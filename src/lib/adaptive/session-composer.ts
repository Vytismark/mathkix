// ============================================================
// Session Composer — Builds structured learning sessions
//
// Replaces flat question-list sessions with a structured sequence
// of instruction + practice + review segments.
//
// Session budget (in "units"):
//   - 1 instruction segment = 2 units (teaching + guided practice)
//   - 1 practice segment    = 1 unit  (3 questions)
//   - 1 review segment      = 1 unit  (2 SR questions)
//
// Composition strategy:
//   1. Allocate SR reviews (if any due)
//   2. Select 1-2 standards to teach via prerequisite engine
//   3. Pick modality for each standard
//   4. Fill remaining budget with practice reinforcement
//   5. Order: instruction → practice → review
//
// Falls back to practice-only (current behavior) when no
// authored lesson content exists for selected standards.
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { Domain } from '@/types/quiz'
import type { SRItem, TopicAffinity, CandidateQuestion, QuestionScoringContext } from '@/types/adaptive'
import type {
  SessionSegment,
  TeachingModality,
  ModalityScores,
  PracticeQuestion,
} from '@/types/lesson-content'
import type { ChildLearningProfile } from '@/types/learning-profile'
import { CONFIDENCE_THRESHOLD } from '@/types/learning-profile'
import { logDecision, logTable } from './algo-logger'
import {
  selectNextStandards,
  type PriorityScoringContext,
} from './prerequisites'
import { selectModality } from './modality'
import { getLessonContent, getAvailableModalities, hasLessonContent } from '@/data/lessons'
import { buildQuestionPool, selectSessionQuestions, buildDomainWeights } from './engine'
import { getDueItems, overdueDays } from './spaced-repetition'
import { applyAffinityDecay } from './affinity'

// ── Types ────────────────────────────────────────────────────

export interface ComposedSession {
  segments: SessionSegment[]
  /** Flat question list for backward-compatible practice-only sessions */
  fallbackQuestions: CandidateQuestion[] | null
  /** Whether this session uses the new segment-based format */
  isSegmented: boolean
  totalEstimatedMinutes: number
  /** Profile-derived adjustments for client-side use (AI teacher, UI) */
  profileAdjustments: ProfileAdjustments
}

interface ComposerInput {
  childId: string
  gradeLevel: number
  attentionSpan: 'short' | 'medium' | 'long'
  spanQuestionOffset: number
  domainMastery: Partial<Record<Domain, number>>
  masteryMap: Map<string, number>
  srItems: SRItem[]
  affinityRows: TopicAffinity[]
  modalityScores: ModalityScores
  childPreferences: {
    learning_pace: 'steady' | 'average' | 'quick'
    challenge_preference: 'gentle' | 'balanced' | 'loves_challenge'
    motivation_style: 'rewards' | 'challenge' | 'encouragement'
    parent_goal: 'catch_up' | 'reinforce' | 'advance'
  }
  lastUsedModality: TeachingModality | null
  recentStandards: Set<string>
  sessionsSinceMap: Map<string, number>
  learningProfile: ChildLearningProfile | null
}

// ── Constants ────────────────────────────────────────────────

const BUDGET_MAP = { short: 4, medium: 5, long: 7 } as const
const INSTRUCTION_COST = 2   // units per instruction segment
const PRACTICE_COST = 1      // units per practice segment
const REVIEW_COST = 1        // units per review segment

const PRACTICE_QUESTIONS_PER_SEGMENT = 3
const REVIEW_QUESTIONS_PER_SEGMENT = 2
const MAX_REINFORCEMENT_SEGMENTS = 2  // cap reinforcement to avoid bloat

// ── Main composer ────────────────────────────────────────────

export async function composeSession(
  supabase: SupabaseClient<Database>,
  input: ComposerInput,
): Promise<ComposedSession> {
  const budget = Math.max(3, Math.min(13,
    BUDGET_MAP[input.attentionSpan] + input.spanQuestionOffset
  ))

  logDecision({ component: 'COMPOSER', action: 'compose_session_start', childId: input.childId, data: {
    budget, attentionSpan: input.attentionSpan, offset: input.spanQuestionOffset, grade: input.gradeLevel,
    parentGoal: input.childPreferences.parent_goal, learningPace: input.childPreferences.learning_pace,
  }})

  // ── Profile-aware adjustments ─────────────────────────────
  const profile = input.learningProfile
  const profileAdjustments = deriveProfileAdjustments(profile, input.childPreferences)

  logDecision({ component: 'COMPOSER', action: 'profile_adjustments', childId: input.childId, data: {
    ...profileAdjustments, hasProfile: !!(profile && profile.cognitiveStage),
  }})

  // ── Step 1: Check if we have any authored lesson content ──
  // If not, fall back to the existing practice-only system
  const priorityCtx = buildPriorityContext(input)
  const candidateStandards = selectNextStandards(input.gradeLevel, priorityCtx, 3, profileAdjustments.allowPrereqBypass)

  const standardsWithContent = candidateStandards.filter(
    (s) => hasLessonContent(s.standardCode)
  )

  logDecision({ component: 'COMPOSER', action: 'content_check', childId: input.childId, data: {
    candidateCount: candidateStandards.length,
    withContentCount: standardsWithContent.length,
    candidates: candidateStandards.map(s => ({ code: s.standardCode, score: Math.round(s.score), tier: s.readiness.tier })),
    withContent: standardsWithContent.map(s => s.standardCode),
  }})

  // No authored content → fall back to practice-only
  if (standardsWithContent.length === 0) {
    logDecision({ component: 'COMPOSER', action: 'fallback_practice_only', childId: input.childId, data: { reason: 'no_authored_content' }})
    return composePracticeOnly(supabase, input, budget)
  }

  // ── Step 2: Allocate budget ───────────────────────────────
  let remaining = budget
  const segments: SessionSegment[] = []

  // 2a. SR reviews (1 segment normally, +1 for catch_up goal)
  const maxReviewSegments = 1 + profileAdjustments.extraReviewSegments
  const srDue = getDueItems(input.srItems)
  let reviewsAdded = 0
  while (srDue.length > reviewsAdded * REVIEW_QUESTIONS_PER_SEGMENT && remaining >= REVIEW_COST && reviewsAdded < maxReviewSegments) {
    const batch = srDue.slice(reviewsAdded * REVIEW_QUESTIONS_PER_SEGMENT, (reviewsAdded + 1) * REVIEW_QUESTIONS_PER_SEGMENT)
    const reviewQuestions = await buildReviewQuestions(supabase, input, batch)
    if (reviewQuestions.length === 0) break
    segments.push({
      type: 'review',
      standardCode: batch[0].standard_code,
      questions: reviewQuestions,
      isSpacedRepetition: true,
    } as SessionSegment)
    remaining -= REVIEW_COST
    reviewsAdded++
  }

  // 2b. Instruction segments (1-2 standards with content)
  // Profile: focused learners get 1 standard, interleaved get 2
  const maxInstructionStandards = profileAdjustments.preferFocused ? 1 : 2
  const instructionStandards = standardsWithContent.slice(0, Math.min(maxInstructionStandards,
    Math.floor(remaining / (INSTRUCTION_COST + PRACTICE_COST))
  ))

  for (const priority of instructionStandards) {
    // Profile: independent learners can skip instruction, get extra practice instead
    if (profileAdjustments.canSkipInstruction) {
      if (remaining >= PRACTICE_COST) {
        const content = getLessonContent(priority.standardCode, 'procedural')
        if (content && content.practiceQuestions.length > 0) {
          segments.push({
            type: 'practice',
            standardCode: priority.standardCode,
            questions: content.practiceQuestions.slice(0, profileAdjustments.practiceQuestionsPerSegment + profileAdjustments.extraPracticeQuestions),
          })
          remaining -= PRACTICE_COST
        }
      }
      continue
    }

    if (remaining < INSTRUCTION_COST + PRACTICE_COST) break

    const available = getAvailableModalities(priority.standardCode)
    if (available.length === 0) continue

    // Profile-aware modality filtering
    let filteredModalities = [...available]
    if (profileAdjustments.preferConcreteModalities) {
      // Concrete-stage kids: prefer visual and interactive over procedural/challenge
      const concrete: TeachingModality[] = ['visual', 'interactive', 'story']
      const preferred = filteredModalities.filter(m => concrete.includes(m))
      if (preferred.length > 0) filteredModalities = preferred
    }
    if (profileAdjustments.exampleOrRule === 'rule_first') {
      // Rule-first kids: boost procedural if available
      if (filteredModalities.includes('procedural')) {
        filteredModalities = ['procedural', ...filteredModalities.filter(m => m !== 'procedural')]
      }
    } else if (profileAdjustments.exampleOrRule === 'example_first') {
      // Example-first kids: boost visual/story
      const exampleTypes: TeachingModality[] = ['visual', 'story']
      const preferred = filteredModalities.filter(m => exampleTypes.includes(m))
      if (preferred.length > 0) filteredModalities = [...preferred, ...filteredModalities.filter(m => !exampleTypes.includes(m))]
    }

    // Select modality
    const totalAttempts = Object.values(input.modalityScores)
      .reduce((sum, s) => sum + s.attempts, 0)

    const modality = selectModality({
      modalityScores: input.modalityScores,
      childPreferences: input.childPreferences,
      availableModalities: filteredModalities.length > 0 ? filteredModalities : available,
      lastUsedModality: input.lastUsedModality,
      totalAttempts,
    })

    logDecision({ component: 'MODALITY', action: 'selected', childId: input.childId, data: {
      standard: priority.standardCode, modality, available, filtered: filteredModalities, totalAttempts,
      phase: totalAttempts < 3 ? 'cold_start' : totalAttempts < 15 ? 'exploration' : 'exploitation',
      profileInfluence: { representationPref: profileAdjustments.representationPref, exampleOrRule: profileAdjustments.exampleOrRule, preferConcrete: profileAdjustments.preferConcreteModalities },
    }})

    const content = getLessonContent(priority.standardCode, modality)
    if (!content) continue

    // Instruction segment
    segments.push({
      type: 'instruction',
      standardCode: priority.standardCode,
      modality,
      content,
    })
    remaining -= INSTRUCTION_COST

    // Paired practice segment (use the lesson's practice questions)
    if (content.practiceQuestions.length > 0 && remaining >= PRACTICE_COST) {
      segments.push({
        type: 'practice',
        standardCode: priority.standardCode,
        questions: content.practiceQuestions.slice(0, profileAdjustments.practiceQuestionsPerSegment),
      })
      remaining -= PRACTICE_COST
    }
  }

  // 2c. Fill remaining budget with reinforcement practice (capped)
  const maxReinforcement = Math.min(remaining, MAX_REINFORCEMENT_SEGMENTS)
  if (maxReinforcement >= PRACTICE_COST) {
    const reinforcementQuestions = await buildReinforcementQuestions(
      supabase, input, maxReinforcement * profileAdjustments.practiceQuestionsPerSegment,
      // Exclude standards already covered by instruction segments
      new Set(instructionStandards.map(s => s.standardCode))
    )

    // Split into practice segments
    let reinforcementCount = 0
    const qPerSeg = profileAdjustments.practiceQuestionsPerSegment
    for (let i = 0; i < reinforcementQuestions.length && remaining >= PRACTICE_COST && reinforcementCount < MAX_REINFORCEMENT_SEGMENTS; i += qPerSeg) {
      const batch = reinforcementQuestions.slice(i, i + qPerSeg)
      if (batch.length === 0) break

      const standardCode = batch[0].standard_code ?? 'mixed'
      segments.push({
        type: 'practice',
        standardCode,
        questions: batch.map(candidateToPractice),
      })
      remaining -= PRACTICE_COST
      reinforcementCount++
    }
  }

  // ── Step 3: Order segments ────────────────────────────────
  // instruction → practice → review (end on review for retention)
  const ordered = orderSegments(segments, profileAdjustments)

  const totalMinutes = ordered.reduce((sum, seg) => {
    if (seg.type === 'instruction') return sum + (seg.content.estimatedMinutes ?? 3)
    if (seg.type === 'practice') return sum + seg.questions.length * 0.5
    return sum + seg.questions.length * 0.4
  }, 0)

  logTable('COMPOSER', 'session_segments', ordered.map(s => ({
    type: s.type,
    standard: s.standardCode,
    ...(s.type === 'instruction' ? { modality: s.modality, steps: s.content.introduction.length } : {}),
    ...(s.type !== 'instruction' ? { questions: s.questions.length } : {}),
  })), input.childId)

  logDecision({ component: 'COMPOSER', action: 'compose_session_done', childId: input.childId, data: {
    isSegmented: true, segmentCount: ordered.length, estimatedMinutes: Math.round(totalMinutes), budgetUsed: budget - remaining, budgetTotal: budget,
  }})

  return {
    segments: ordered,
    fallbackQuestions: null,
    isSegmented: true,
    totalEstimatedMinutes: Math.round(totalMinutes),
    profileAdjustments,
  }
}

// ── Practice-only fallback ───────────────────────────────────

async function composePracticeOnly(
  supabase: SupabaseClient<Database>,
  input: ComposerInput,
  budget: number,
): Promise<ComposedSession> {
  const pool = await buildQuestionPool(supabase, input.gradeLevel)
  if (pool.length === 0) {
    return { segments: [], fallbackQuestions: [], isSegmented: false, totalEstimatedMinutes: 0, profileAdjustments: deriveProfileAdjustments(input.learningProfile, input.childPreferences) }
  }

  const affinityMap = new Map<Domain, number>()
  for (const row of input.affinityRows) {
    affinityMap.set(row.domain, applyAffinityDecay(row.affinity_score, row.last_updated))
  }

  const domainWeights = buildDomainWeights(
    input.domainMastery, input.srItems, input.affinityRows, input.gradeLevel
  )

  const pendingSR = new Set(getDueItems(input.srItems).map(i => i.standard_code))
  const srItemMap = new Map(input.srItems.map(r => [r.standard_code, r]))

  const ctx: QuestionScoringContext = {
    masteryMap: input.masteryMap,
    srItemMap,
    pendingSR,
    domainWeightMap: new Map(domainWeights.map(w => [w.domain, w.finalWeight])),
    affinityMap,
    usedQuestionKeys: new Set(),
    usedStandardCounts: new Map(),
    usedDomainCounts: new Map(),
    totalQuestions: budget,
  }

  const selected = selectSessionQuestions(pool, budget, ctx)

  return {
    segments: [],
    fallbackQuestions: selected,
    isSegmented: false,
    totalEstimatedMinutes: Math.round(selected.length * 0.5),
    profileAdjustments: deriveProfileAdjustments(input.learningProfile, input.childPreferences),
  }
}

// ── Helper: build review questions from SR items ─────────────

async function buildReviewQuestions(
  supabase: SupabaseClient<Database>,
  input: ComposerInput,
  srItems: SRItem[],
): Promise<PracticeQuestion[]> {
  const selected: PracticeQuestion[] = []

  for (const item of srItems) {
    if (selected.length >= REVIEW_QUESTIONS_PER_SEGMENT) break

    // First: try authored lesson content (has classification tags for profiler)
    const available = getAvailableModalities(item.standard_code)
    if (available.length > 0) {
      const content = getLessonContent(item.standard_code, available[0])
      if (content && content.practiceQuestions.length > 0) {
        const sorted = [...content.practiceQuestions].sort((a, b) =>
          Math.abs(a.difficulty - 2) - Math.abs(b.difficulty - 2)
        )
        selected.push(sorted[0])
        continue
      }
    }

    // Fallback: use old question pool (no classification tags)
    if (!fallbackPool) {
      fallbackPool = await buildQuestionPool(supabase, input.gradeLevel)
    }
    const matching = fallbackPool.filter(q => q.standard_code === item.standard_code)
    if (matching.length > 0) {
      const sorted = matching.sort((a, b) =>
        Math.abs(a.difficulty - 2) - Math.abs(b.difficulty - 2)
      )
      selected.push(candidateToPractice(sorted[0]))
    }
  }

  return selected
}
// Lazy-loaded fallback pool for SR questions without authored content
let fallbackPool: CandidateQuestion[] | null = null

// ── Helper: build reinforcement practice questions ───────────

async function buildReinforcementQuestions(
  supabase: SupabaseClient<Database>,
  input: ComposerInput,
  maxQuestions: number,
  excludeStandards: Set<string>,
): Promise<(CandidateQuestion & { standard_code: string })[]> {
  const pool = await buildQuestionPool(supabase, input.gradeLevel)

  // Filter out standards already covered by instruction
  const filtered = pool.filter(q => !excludeStandards.has(q.standard_code))
  if (filtered.length === 0) return []

  const affinityMap = new Map<Domain, number>()
  for (const row of input.affinityRows) {
    affinityMap.set(row.domain, applyAffinityDecay(row.affinity_score, row.last_updated))
  }

  const domainWeights = buildDomainWeights(
    input.domainMastery, input.srItems, input.affinityRows, input.gradeLevel
  )

  const pendingSR = new Set(getDueItems(input.srItems).map(i => i.standard_code))
  const srItemMap = new Map(input.srItems.map(r => [r.standard_code, r]))

  const ctx: QuestionScoringContext = {
    masteryMap: input.masteryMap,
    srItemMap,
    pendingSR,
    domainWeightMap: new Map(domainWeights.map(w => [w.domain, w.finalWeight])),
    affinityMap,
    usedQuestionKeys: new Set(),
    usedStandardCounts: new Map(),
    usedDomainCounts: new Map(),
    totalQuestions: maxQuestions,
  }

  return selectSessionQuestions(filtered, maxQuestions, ctx) as (CandidateQuestion & { standard_code: string })[]
}

// ── Helper: convert CandidateQuestion to PracticeQuestion ────

function candidateToPractice(q: CandidateQuestion): PracticeQuestion {
  return {
    id: q.id,
    text: q.text,
    type: q.type,
    options: q.options,
    correct_answer: q.correct_answer,
    difficulty: q.difficulty,
  }
}

// ── Helper: order segments for optimal learning ──────────────

function orderSegments(segments: SessionSegment[], adjustments: ProfileAdjustments): SessionSegment[] {
  const instructions = segments.filter(s => s.type === 'instruction')
  const practices = segments.filter(s => s.type === 'practice')
  const reviews = segments.filter(s => s.type === 'review')

  // If we have instruction segments, pair each with its practice
  const paired: SessionSegment[] = []
  for (const inst of instructions) {
    paired.push(inst)
    const matchIdx = practices.findIndex(p => p.standardCode === inst.standardCode)
    if (matchIdx >= 0) {
      paired.push(practices[matchIdx])
      practices.splice(matchIdx, 1)
    }
  }

  // Remaining practice segments (reinforcement)
  paired.push(...practices)

  // Reviews at the end (retention) — unless frontloading for early-decay kids
  if (adjustments.frontloadHardContent && reviews.length > 0) {
    // Put reviews first (they're harder/older material) for kids who decay early
    return [...reviews, ...paired]
  }

  paired.push(...reviews)
  return paired
}

// ── Helper: build priority context from composer input ────────

function buildPriorityContext(input: ComposerInput): PriorityScoringContext {
  const affinityMap = new Map<Domain, number>()
  for (const row of input.affinityRows) {
    affinityMap.set(row.domain, applyAffinityDecay(row.affinity_score, row.last_updated))
  }

  const srOverdueDays = new Map<string, number>()
  for (const item of input.srItems) {
    const days = overdueDays(item)
    if (days > 0) srOverdueDays.set(item.standard_code, days)
  }

  return {
    masteryMap: input.masteryMap,
    domainMastery: input.domainMastery as Record<string, number>,
    affinityMap,
    srOverdueDays,
    recentStandards: input.recentStandards,
    sessionsSinceMap: input.sessionsSinceMap,
  }
}

// ── Profile-aware session adjustments ────────────────────────

export interface ProfileAdjustments {
  // ── Session composition ──────────────────────────
  /** Prefer focused single-domain or interleaved multi-domain */
  preferFocused: boolean
  /** Reduce difficulty for anxious learners (0 = none, 1 = one step easier) */
  difficultyReduction: number
  /** Extra practice questions for low working memory */
  extraPracticeQuestions: number
  /** Skip straight to practice if child is at "independent" fading stage */
  canSkipInstruction: boolean
  /** Put harder content first for early-decay fatigue pattern */
  frontloadHardContent: boolean
  /** Reduce word problems for kids who struggle with reading comprehension */
  reduceWordProblems: boolean

  // ── Modality preferences ─────────────────────────
  /** Preferred representation: visual, symbolic, verbal */
  representationPref: 'visual' | 'symbolic' | 'verbal' | null
  /** Example-first (visual/story) vs rule-first (procedural) */
  exampleOrRule: 'example_first' | 'rule_first' | null
  /** CRA stage for modality filtering */
  preferConcreteModalities: boolean

  // ── AI teacher personality ───────────────────────
  /** Math anxiety level → affects teacher warmth */
  anxietyLevel: 'high' | 'moderate' | 'low'
  /** How detailed explanations should be */
  explanationDepth: 'brief' | 'moderate' | 'detailed'
  /** Growth vs fixed mindset → affects error framing */
  mindset: 'fixed_leaning' | 'neutral' | 'growth_leaning'
  /** How to handle errors: careless → "slow down", conceptual → re-teach */
  errorStrategy: 'slow_down' | 'reteach' | 'simplify_language' | 'default'
  /** Hint style: minimal nudge vs full scaffold */
  hintStyle: 'minimal' | 'moderate' | 'full_scaffold'

  // ── Content presentation ─────────────────────────
  /** Worked example fading stage */
  exampleFading: 'full_examples' | 'partial' | 'independent'
  /** Processing speed label (for timeout/pacing adjustments) */
  processingSpeed: 'slow' | 'moderate' | 'fast'
  /** Challenge tolerance (for difficulty ramping) */
  challengeTolerance: 'low' | 'moderate' | 'high'

  // ── Parent goal & pacing ─────────────────────────
  /** Parent goal: catch_up prioritizes gaps, advance pushes forward */
  parentGoal: 'catch_up' | 'reinforce' | 'advance'
  /** Learning pace: affects practice quantity per standard */
  learningPace: 'steady' | 'average' | 'quick'
  /** Extra review segments for catch_up goal */
  extraReviewSegments: number
  /** Whether to allow advancing past incomplete prerequisites */
  allowPrereqBypass: boolean
  /** Practice questions per segment (adjusted by pace) */
  practiceQuestionsPerSegment: number
}

function deriveProfileAdjustments(
  profile: ChildLearningProfile | null,
  prefs?: ComposerInput['childPreferences'],
): ProfileAdjustments {
  const parentGoal = prefs?.parent_goal ?? 'reinforce'
  const learningPace = prefs?.learning_pace ?? 'average'

  const defaults: ProfileAdjustments = {
    preferFocused: false,
    difficultyReduction: 0,
    extraPracticeQuestions: 0,
    canSkipInstruction: false,
    frontloadHardContent: false,
    reduceWordProblems: false,
    representationPref: null,
    exampleOrRule: null,
    preferConcreteModalities: false,
    anxietyLevel: 'moderate',
    explanationDepth: 'moderate',
    mindset: 'neutral',
    errorStrategy: 'default',
    hintStyle: 'moderate',
    exampleFading: 'full_examples',
    processingSpeed: 'moderate',
    challengeTolerance: 'moderate',
    parentGoal,
    learningPace,
    extraReviewSegments: parentGoal === 'catch_up' ? 1 : 0,
    allowPrereqBypass: parentGoal === 'advance',
    practiceQuestionsPerSegment: learningPace === 'steady' ? 4 : learningPace === 'quick' ? 2 : 3,
  }

  if (!profile || !profile.interleavingPreference) return defaults

  const adj = { ...defaults }
  const C = CONFIDENCE_THRESHOLD

  // ── Session composition ──────────────────────────
  if (profile.interleavingPreference?.confidence >= C) {
    adj.preferFocused = profile.interleavingPreference.value === 'focused_blocks'
  }
  if (profile.mathAnxietyLevel?.confidence >= C && profile.mathAnxietyLevel.value === 'high') {
    adj.difficultyReduction = 1
  }
  if (profile.workingMemoryCapacity?.confidence >= C && profile.workingMemoryCapacity.value === 'low') {
    adj.extraPracticeQuestions = 1
  }
  if (profile.workedExampleFadingStage?.confidence >= C && profile.workedExampleFadingStage.value === 'independent') {
    adj.canSkipInstruction = true
  }
  if (profile.sessionFatiguePattern?.confidence >= C && profile.sessionFatiguePattern.value === 'early_decay') {
    adj.frontloadHardContent = true
  }
  if (profile.wordProblemProficiency?.confidence >= C && profile.wordProblemProficiency.value === 'struggles') {
    adj.reduceWordProblems = true
  }

  // ── Modality preferences ─────────────────────────
  if (profile.representationPreference?.confidence >= C) {
    adj.representationPref = profile.representationPreference.value
  }
  if (profile.exampleFirstVsRuleFirst?.confidence >= C) {
    adj.exampleOrRule = profile.exampleFirstVsRuleFirst.value === 'balanced' ? null : profile.exampleFirstVsRuleFirst.value
  }
  if (profile.cognitiveStage?.confidence >= C && profile.cognitiveStage.value === 'concrete') {
    adj.preferConcreteModalities = true
  }

  // ── AI teacher personality ───────────────────────
  if (profile.mathAnxietyLevel?.confidence >= C) {
    adj.anxietyLevel = profile.mathAnxietyLevel.value
  }
  if (profile.explanationDepth?.confidence >= C) {
    adj.explanationDepth = profile.explanationDepth.value
  }
  if (profile.mindsetIndicator?.confidence >= C) {
    adj.mindset = profile.mindsetIndicator.value
  }
  if (profile.errorTypeTendency?.confidence >= C) {
    adj.errorStrategy =
      profile.errorTypeTendency.value === 'careless' ? 'slow_down'
      : profile.errorTypeTendency.value === 'conceptual' ? 'reteach'
      : profile.errorTypeTendency.value === 'reading' ? 'simplify_language'
      : 'default'
  }
  if (profile.hintResponsiveness?.confidence >= C) {
    adj.hintStyle =
      profile.hintResponsiveness.value === 'self_sufficient' ? 'minimal'
      : profile.hintResponsiveness.value === 'needs_full_scaffold' ? 'full_scaffold'
      : 'moderate'
  }

  // ── Content presentation ─────────────────────────
  if (profile.workedExampleFadingStage?.confidence >= C) {
    adj.exampleFading = profile.workedExampleFadingStage.value
  }
  if (profile.processingSpeed?.confidence >= C) {
    adj.processingSpeed = profile.processingSpeed.value
  }
  if (profile.challengeTolerance?.confidence >= C) {
    adj.challengeTolerance = profile.challengeTolerance.value
  }

  // ── Parent goal overrides ────────────────────────
  if (parentGoal === 'catch_up') {
    // More review, reduce difficulty, more practice per standard
    adj.extraReviewSegments = 1
    adj.difficultyReduction = Math.max(adj.difficultyReduction, 1)
    adj.practiceQuestionsPerSegment = Math.max(adj.practiceQuestionsPerSegment, 4)
  } else if (parentGoal === 'advance') {
    // Push forward, less review, allow bypassing prerequisites
    adj.allowPrereqBypass = true
    adj.extraReviewSegments = 0
    adj.practiceQuestionsPerSegment = Math.min(adj.practiceQuestionsPerSegment, 2)
  }

  // ── Learning pace fine-tuning ────────────────────
  if (learningPace === 'steady') {
    // More practice, never skip instruction
    adj.canSkipInstruction = false
    adj.practiceQuestionsPerSegment = Math.max(adj.practiceQuestionsPerSegment, 4)
  } else if (learningPace === 'quick') {
    // Less practice, allow instruction skip if profile supports it
    adj.practiceQuestionsPerSegment = Math.min(adj.practiceQuestionsPerSegment, 2)
  }

  return adj
}
