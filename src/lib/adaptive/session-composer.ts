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
// createDefaultModalityScores available from '@/types/lesson-content' if needed
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
  }
  lastUsedModality: TeachingModality | null
  recentStandards: Set<string>
  sessionsSinceMap: Map<string, number>
}

// ── Constants ────────────────────────────────────────────────

const BUDGET_MAP = { short: 5, medium: 7, long: 9 } as const
const INSTRUCTION_COST = 2   // units per instruction segment
const PRACTICE_COST = 1      // units per practice segment (3 questions)
const REVIEW_COST = 1        // units per review segment (2 questions)

const PRACTICE_QUESTIONS_PER_SEGMENT = 3
const REVIEW_QUESTIONS_PER_SEGMENT = 2

// ── Main composer ────────────────────────────────────────────

export async function composeSession(
  supabase: SupabaseClient<Database>,
  input: ComposerInput,
): Promise<ComposedSession> {
  const budget = Math.max(3, Math.min(13,
    BUDGET_MAP[input.attentionSpan] + input.spanQuestionOffset
  ))

  // ── Step 1: Check if we have any authored lesson content ──
  // If not, fall back to the existing practice-only system
  const priorityCtx = buildPriorityContext(input)
  const candidateStandards = selectNextStandards(input.gradeLevel, priorityCtx, 3)

  const standardsWithContent = candidateStandards.filter(
    (s) => hasLessonContent(s.standardCode)
  )

  // No authored content → fall back to practice-only
  if (standardsWithContent.length === 0) {
    return composePracticeOnly(supabase, input, budget)
  }

  // ── Step 2: Allocate budget ───────────────────────────────
  let remaining = budget
  const segments: SessionSegment[] = []

  // 2a. SR reviews (max 1 segment)
  const srDue = getDueItems(input.srItems)
  if (srDue.length > 0 && remaining >= REVIEW_COST) {
    const reviewQuestions = await buildReviewQuestions(
      supabase, input, srDue.slice(0, REVIEW_QUESTIONS_PER_SEGMENT)
    )
    if (reviewQuestions.length > 0) {
      segments.push({
        type: 'review',
        standardCode: reviewQuestions[0].standard_code ?? srDue[0].standard_code,
        questions: reviewQuestions.map(candidateToPractice),
        isSpacedRepetition: true,
      } as SessionSegment)
      remaining -= REVIEW_COST
    }
  }

  // 2b. Instruction segments (1-2 standards with content)
  const instructionStandards = standardsWithContent.slice(0, Math.min(2,
    Math.floor(remaining / (INSTRUCTION_COST + PRACTICE_COST))
  ))

  for (const priority of instructionStandards) {
    if (remaining < INSTRUCTION_COST + PRACTICE_COST) break

    const available = getAvailableModalities(priority.standardCode)
    if (available.length === 0) continue

    // Select modality
    const totalAttempts = Object.values(input.modalityScores)
      .reduce((sum, s) => sum + s.attempts, 0)

    const modality = selectModality({
      modalityScores: input.modalityScores,
      childPreferences: input.childPreferences,
      availableModalities: available,
      lastUsedModality: input.lastUsedModality,
      totalAttempts,
    })

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
        questions: content.practiceQuestions.slice(0, PRACTICE_QUESTIONS_PER_SEGMENT),
      })
      remaining -= PRACTICE_COST
    }
  }

  // 2c. Fill remaining budget with reinforcement practice
  if (remaining >= PRACTICE_COST) {
    const reinforcementQuestions = await buildReinforcementQuestions(
      supabase, input, remaining * PRACTICE_QUESTIONS_PER_SEGMENT,
      // Exclude standards already covered by instruction segments
      new Set(instructionStandards.map(s => s.standardCode))
    )

    // Split into practice segments
    for (let i = 0; i < reinforcementQuestions.length && remaining >= PRACTICE_COST; i += PRACTICE_QUESTIONS_PER_SEGMENT) {
      const batch = reinforcementQuestions.slice(i, i + PRACTICE_QUESTIONS_PER_SEGMENT)
      if (batch.length === 0) break

      const standardCode = batch[0].standard_code ?? 'mixed'
      segments.push({
        type: 'practice',
        standardCode,
        questions: batch.map(candidateToPractice),
      })
      remaining -= PRACTICE_COST
    }
  }

  // ── Step 3: Order segments ────────────────────────────────
  // instruction → practice → review (end on review for retention)
  const ordered = orderSegments(segments)

  const totalMinutes = ordered.reduce((sum, seg) => {
    if (seg.type === 'instruction') return sum + (seg.content.estimatedMinutes ?? 3)
    if (seg.type === 'practice') return sum + seg.questions.length * 0.5
    return sum + seg.questions.length * 0.4
  }, 0)

  return {
    segments: ordered,
    fallbackQuestions: null,
    isSegmented: true,
    totalEstimatedMinutes: Math.round(totalMinutes),
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
    return { segments: [], fallbackQuestions: [], isSegmented: false, totalEstimatedMinutes: 0 }
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
  }
}

// ── Helper: build review questions from SR items ─────────────

async function buildReviewQuestions(
  supabase: SupabaseClient<Database>,
  input: ComposerInput,
  srItems: SRItem[],
): Promise<CandidateQuestion[]> {
  const pool = await buildQuestionPool(supabase, input.gradeLevel)

  // Filter to questions matching SR standard codes
  const srCodes = new Set(srItems.map(i => i.standard_code))
  const srPool = pool.filter(q => srCodes.has(q.standard_code))

  if (srPool.length === 0) return []

  // Pick questions at appropriate difficulty for review
  const selected: CandidateQuestion[] = []
  for (const item of srItems) {
    const matching = srPool.filter(q => q.standard_code === item.standard_code)
    if (matching.length === 0) continue

    // For review: pick medium difficulty (not too easy, not too hard)
    const sorted = matching.sort((a, b) =>
      Math.abs(a.difficulty - 2) - Math.abs(b.difficulty - 2)
    )
    selected.push(sorted[0])
    if (selected.length >= REVIEW_QUESTIONS_PER_SEGMENT) break
  }

  return selected
}

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

function orderSegments(segments: SessionSegment[]): SessionSegment[] {
  const instructions = segments.filter(s => s.type === 'instruction')
  const practices = segments.filter(s => s.type === 'practice')
  const reviews = segments.filter(s => s.type === 'review')

  // If we have instruction segments, pair each with its practice
  const paired: SessionSegment[] = []
  for (const inst of instructions) {
    paired.push(inst)
    // Find the matching practice segment for this standard
    const matchIdx = practices.findIndex(p => p.standardCode === inst.standardCode)
    if (matchIdx >= 0) {
      paired.push(practices[matchIdx])
      practices.splice(matchIdx, 1)
    }
  }

  // Remaining practice segments (reinforcement)
  paired.push(...practices)

  // Reviews at the end (retention)
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
