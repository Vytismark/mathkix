// ============================================================
// Adaptive Learning Engine - Question-Level Selection
//
// Scores EVERY individual question from the entire grade-level pool
// on a composite of: per-standard mastery need, spaced repetition
// urgency, difficulty fit, domain weight, and variety constraints.
//
// Each session mixes multiple domains at different difficulties:
//   - Struggling standards → easier questions (beatable)
//   - Strong standards    → harder questions (keep sharp)
//
// The goal: master every standard at the grade level.
// Domain mastery = can solve hard questions for ALL domain standards.
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { Domain } from '@/types/quiz'
import type {
  DomainWeight,
  EngineState,
  SRItem,
  TopicAffinity,
  CandidateQuestion,
  QuestionScoringContext,
} from '@/types/adaptive'
import { getDomainsForGrade } from '@/types/quiz'
import { getDueItems, overdueDays } from './spaced-repetition'
import { applyAffinityDecay, affinityToWeightMultiplier } from './affinity'
import type { LessonQuestion } from '@/types/curriculum'

// ── Tunable weights ────────────────────────────────────────

/** How much we value mastery need (weakest standard → highest) */
const W_NEED = 1.0

/** How much overdue SR items boost a question's score */
const W_SR = 0.6

/** Penalty per difficulty step above/below the ideal */
const W_DIFFICULTY_FIT = 0.5

/** Domain weight (from buildDomainWeights) contribution */
const W_DOMAIN = 0.7

/** Penalty for picking too many questions from the same standard */
const W_STANDARD_VARIETY = 0.8

/** Soft nudge toward domains the child enjoys */
const W_AFFINITY = 0.15

/** Minimum weight floor so no domain is completely excluded */
const WEIGHT_FLOOR = 0.05

/** Grade relaxation steps for question pool */
const GRADE_RELAXATION = 1

// ── Domain weight calculation ──────────────────────────────

/**
 * Build per-domain weights from mastery scores, SR overdue pressure,
 * and affinity. Weak domains get higher weights.
 */
export function buildDomainWeights(
  domainMastery: Partial<Record<Domain, number>>,
  srItems: SRItem[],
  affinityRows: TopicAffinity[],
  gradeLevel: number = 3
): DomainWeight[] {
  const affinityMap = new Map(affinityRows.map((a) => [a.domain, a]))
  const gradeDomains = getDomainsForGrade(gradeLevel)

  const rawWeights = gradeDomains.map((domain) => {
    const mastery = domainMastery[domain] ?? 50
    const invertedMastery = 100 - mastery

    const overdueSR = srItems.filter(
      (i) => i.domain === domain && overdueDays(i) > 0
    ).length
    const srBonus = Math.min(overdueSR * 8, 40)

    const affinityRow = affinityMap.get(domain)
    const rawAffinity = affinityRow?.affinity_score ?? 50
    const decayedAffinity = affinityRow
      ? applyAffinityDecay(rawAffinity, affinityRow.last_updated)
      : rawAffinity
    const affinityMult = affinityToWeightMultiplier(decayedAffinity)

    const rawWeight = (invertedMastery + srBonus) * affinityMult

    return { domain, baseWeight: invertedMastery, affinityBonus: affinityMult, srBonus, rawWeight }
  })

  const sum = rawWeights.reduce((s, w) => s + w.rawWeight, 0)
  const withFloor = rawWeights.map((w) => ({
    ...w,
    finalWeight: Math.max(WEIGHT_FLOOR, w.rawWeight / (sum || 1)),
  }))

  const sum2 = withFloor.reduce((s, w) => s + w.finalWeight, 0)
  return withFloor.map((w) => ({
    domain: w.domain,
    baseWeight: w.baseWeight,
    affinityBonus: w.affinityBonus,
    srBonus: w.srBonus,
    finalWeight: w.finalWeight / sum2,
  }))
}

// ── Engine state ───────────────────────────────────────────

export function createEngineState(
  childId: string,
  sessionId: string,
  domainMastery: Partial<Record<Domain, number>>,
  srItems: SRItem[],
  affinityRows: TopicAffinity[],
  gradeLevel: number = 3
): EngineState {
  const domainWeights = buildDomainWeights(domainMastery, srItems, affinityRows, gradeLevel)
  const srDueThisSession = getDueItems(srItems).map((i) => i.standard_code)

  return {
    childId,
    sessionId,
    domainWeights,
    usedQuestionKeys: [],
    srDueThisSession,
    srCompletedThisSession: [],
    questionsAnswered: 0,
  }
}

export function serialiseEngineState(state: EngineState): object {
  return { ...state }
}

export function deserialiseEngineState(raw: unknown): EngineState {
  return raw as EngineState
}

// ── Ideal difficulty from mastery level ────────────────────

/**
 * Map standard mastery level to ideal question difficulty.
 * Struggling → easy questions. Mastered → hard questions to stay sharp.
 */
function idealDifficultyForMastery(mastery: number): number {
  switch (mastery) {
    case 0:  return 1.0   // never seen → start easy
    case 1:  return 1.5   // introduced → easy-medium
    case 2:  return 2.5   // practicing → medium-hard
    case 3:  return 3.0   // mastered → keep sharp with hard
    default: return 1.0
  }
}

// ── Per-question scoring ───────────────────────────────────

/**
 * Score a single candidate question. Higher = better pick.
 * Returns -1 to hard-exclude the question.
 */
export function scoreQuestion(
  q: CandidateQuestion,
  ctx: QuestionScoringContext
): number {
  const qKey = `${q.lesson_id}:${q.id}`

  // Hard exclude: already used this exact question
  if (ctx.usedQuestionKeys.has(qKey)) return -1

  // Hard exclude: domain cap (no domain > 50% of session)
  const domainCount = ctx.usedDomainCounts.get(q.domain) ?? 0
  const maxPerDomain = Math.ceil(ctx.totalQuestions * 0.5)
  if (domainCount >= maxPerDomain) return -1

  // Hard exclude: standard cap (max 3 questions per standard)
  const standardCount = ctx.usedStandardCounts.get(q.standard_code) ?? 0
  if (standardCount >= 3) return -1

  const mastery = ctx.masteryMap.get(q.standard_code) ?? 0

  // ── 1. Need score (0-100)
  const needScore = mastery === 0 ? 100
    : mastery === 1 ? 70
    : mastery === 2 ? 40
    : 10

  // ── 2. SR urgency (0-100)
  let srScore = 0
  if (ctx.pendingSR.has(q.standard_code)) {
    const srItem = ctx.srItemMap.get(q.standard_code)
    if (srItem) {
      const daysOver = overdueDays(srItem)
      srScore = Math.min(100, Math.max(0, 30 + daysOver * 23))
    }
  }

  // ── 3. Difficulty fit (0-100)
  const ideal = idealDifficultyForMastery(mastery)
  const diffGap = Math.abs(q.difficulty - ideal)
  // Hard exclude if gap > 1.5 (e.g. mastery 0 child won't see difficulty 3)
  if (diffGap > 1.5) return -1
  const difficultyFitScore = Math.max(0, 100 - diffGap * 50)

  // ── 4. Domain weight score (0-100)
  const domainWeight = ctx.domainWeightMap.get(q.domain) ?? 0.2
  const domainScore = Math.min(100, domainWeight * 500)

  // ── 5. Standard variety penalty (increases with each pick from same standard)
  const varietyPenalty = standardCount * 30

  // ── 6. Affinity nudge (0-100)
  const affinityScore = ctx.affinityMap.get(q.domain) ?? 50

  // ── Composite score
  return (
    needScore          * W_NEED +
    srScore            * W_SR +
    difficultyFitScore * W_DIFFICULTY_FIT +
    domainScore        * W_DOMAIN +
    affinityScore      * W_AFFINITY -
    varietyPenalty      * W_STANDARD_VARIETY
  )
}

// ── Question pool builder ──────────────────────────────────

type LessonRow = Database['public']['Tables']['lessons']['Row']

/**
 * Load ALL lessons for the grade range and flatten into individual
 * CandidateQuestion objects enriched with parent lesson metadata.
 */
export async function buildQuestionPool(
  supabase: SupabaseClient<Database>,
  gradeLevel: number
): Promise<CandidateQuestion[]> {
  const minGrade = Math.max(0, gradeLevel - GRADE_RELAXATION)
  const maxGrade = Math.min(5, gradeLevel + GRADE_RELAXATION)

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, domain, standard_code, difficulty, xp_reward, questions')
    .eq('is_active', true)
    .gte('grade_level', minGrade)
    .lte('grade_level', maxGrade)

  if (!lessons || lessons.length === 0) return []

  const pool: CandidateQuestion[] = []

  for (const lesson of lessons) {
    if (!lesson.standard_code) continue
    const qs = lesson.questions as LessonQuestion[] | null
    if (!Array.isArray(qs) || qs.length === 0) continue

    for (const q of qs) {
      pool.push({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        correct_answer: q.correct_answer,
        lesson_id: lesson.id,
        domain: lesson.domain as Domain,
        standard_code: lesson.standard_code,
        difficulty: lesson.difficulty,
        xp_reward: lesson.xp_reward,
      })
    }
  }

  return pool
}

// ── Softmax sampling ───────────────────────────────────────

function softmaxSample(
  candidates: Array<{ question: CandidateQuestion; score: number }>,
  temperature: number
): CandidateQuestion {
  if (candidates.length <= 1) return candidates[0].question

  const maxScore = candidates[0].score
  const exps = candidates.map((c) => Math.exp((c.score - maxScore) / temperature))
  const sumExps = exps.reduce((s, e) => s + e, 0)

  let rand = Math.random() * sumExps
  for (let i = 0; i < candidates.length; i++) {
    rand -= exps[i]
    if (rand <= 0) return candidates[i].question
  }

  return candidates[0].question
}

// ── Session question selector ──────────────────────────────

/**
 * Iteratively selects questions for a session.
 * After each pick, re-scores the pool (variety penalties change).
 * Uses softmax sampling for natural variation.
 */
export function selectSessionQuestions(
  pool: CandidateQuestion[],
  totalCount: number,
  ctx: QuestionScoringContext
): CandidateQuestion[] {
  const selected: CandidateQuestion[] = []
  // Work with a mutable copy so we can remove selected questions
  let remaining = [...pool]

  for (let pick = 0; pick < totalCount && remaining.length > 0; pick++) {
    // Score all remaining questions
    const scored = remaining
      .map((q) => ({ question: q, score: scoreQuestion(q, ctx) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)

    if (scored.length === 0) break

    // Take top-8 candidates and softmax sample
    const topK = scored.slice(0, 8)
    const picked = softmaxSample(topK, 0.5)

    selected.push(picked)

    // Update context for next iteration
    const qKey = `${picked.lesson_id}:${picked.id}`
    ctx.usedQuestionKeys.add(qKey)
    ctx.usedStandardCounts.set(
      picked.standard_code,
      (ctx.usedStandardCounts.get(picked.standard_code) ?? 0) + 1
    )
    ctx.usedDomainCounts.set(
      picked.domain,
      (ctx.usedDomainCounts.get(picked.domain) ?? 0) + 1
    )

    // Remove picked question from pool
    remaining = remaining.filter(
      (q) => !(q.lesson_id === picked.lesson_id && q.id === picked.id)
    )
  }

  return selected
}

// ── Helpers ────────────────────────────────────────────────

/**
 * Extract the domain code from a standard code string.
 * e.g. "3.OA.1" → "OA", "2.NBT.3" → "NBT", "5.G.2" → "G"
 */
export function extractDomainFromStandard(standardCode: string): Domain | null {
  const parts = standardCode.split('.')
  if (parts.length < 2) return null
  const domain = parts[1]
  const valid: Domain[] = ['OA', 'NBT', 'NF', 'MD', 'G']
  return valid.includes(domain as Domain) ? (domain as Domain) : null
}
