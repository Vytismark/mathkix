// ============================================================
// Topic Affinity - Enjoyment Signal Computation
// Pure functions only, no Supabase dependency.
// ============================================================

import type { BehavioralEvent, TopicAffinity } from '@/types/adaptive'

// ── Constants ──────────────────────────────────────────────

/** Days for affinity score to decay halfway toward neutral (50) */
const AFFINITY_HALF_LIFE_DAYS = 14

/** Neutral baseline */
const NEUTRAL_SCORE = 50

/**
 * affinityToWeightMultiplier maps affinity 0-100 → multiplier [0.70, 1.30].
 *
 * Formula: 1.0 + (affinity - 50) / 167
 *   affinity 50  → 1.00 (no effect)
 *   affinity 100 → 1.30 (30% boost)
 *   affinity 0   → 0.70 (30% reduction)
 */
export function affinityToWeightMultiplier(affinity_score: number): number {
  return 1.0 + (affinity_score - NEUTRAL_SCORE) / 167
}

// ── Time decay ─────────────────────────────────────────────

/**
 * Apply exponential decay toward neutral.
 * Score drifts to 50 over time with the given half-life.
 * This prevents stale signals from dominating long after they were measured.
 */
export function applyAffinityDecay(
  affinity_score: number,
  last_updated: Date | string,
  halfLifeDays: number = AFFINITY_HALF_LIFE_DAYS
): number {
  const updatedMs =
    last_updated instanceof Date ? last_updated.getTime() : new Date(last_updated).getTime()
  const daysPassed = (Date.now() - updatedMs) / (24 * 60 * 60 * 1000)

  // Exponential decay: score approaches NEUTRAL_SCORE
  const decayFactor = Math.pow(0.5, daysPassed / halfLifeDays)
  const decayed = NEUTRAL_SCORE + (affinity_score - NEUTRAL_SCORE) * decayFactor

  return Math.max(0, Math.min(100, decayed))
}

// ── Delta computation ──────────────────────────────────────

/**
 * Compute partial affinity update from a batch of behavioral events.
 * Returns only the fields that changed; caller merges with existing row.
 */
export function computeAffinityDelta(
  events: BehavioralEvent[],
  childAvgResponseMs: number
): Partial<Omit<TopicAffinity, 'id' | 'child_id' | 'domain'>> {
  const answerEvents = events.filter(
    (e) => e.event_type === 'answer_correct' || e.event_type === 'answer_wrong'
  )
  // Response time delta: fast → positive, slow → negative
  let scoreAdjustment = 0

  if (answerEvents.length > 0) {
    const validTimes = answerEvents
      .map((e) => e.time_ms)
      .filter((t): t is number => t !== null && t > 0)

    if (validTimes.length > 0 && childAvgResponseMs > 0) {
      const sessionAvg = validTimes.reduce((s, t) => s + t, 0) / validTimes.length
      const ratio = sessionAvg / childAvgResponseMs
      // ratio < 0.8 → faster than usual → +5 points enjoyment
      // ratio > 1.5 → slower than usual → -5 points
      if (ratio < 0.8) scoreAdjustment += 5
      else if (ratio > 1.5) scoreAdjustment -= 5
    }
  }

  // Correct streak bonus: streaks are enjoyment signals
  const correctStreak = (() => {
    let streak = 0
    for (let i = answerEvents.length - 1; i >= 0; i--) {
      if (answerEvents[i].event_type === 'answer_correct') streak++
      else break
    }
    return streak
  })()
  if (correctStreak >= 3) scoreAdjustment += 3

  // Avg response time for this batch
  const allTimes = answerEvents
    .map((e) => e.time_ms)
    .filter((t): t is number => t !== null && t > 0)
  const batchAvgMs = allTimes.length > 0
    ? Math.round(allTimes.reduce((s, t) => s + t, 0) / allTimes.length)
    : null

  return {
    correct_streak_best: correctStreak,
    avg_response_ms:    batchAvgMs,
    last_updated:       new Date().toISOString(),
    // scoreAdjustment is returned as metadata for the caller to apply
    ...(scoreAdjustment !== 0
      ? { _scoreAdjustment: scoreAdjustment } as unknown as Partial<TopicAffinity>
      : {}),
  }
}

/**
 * Apply a score adjustment to an existing affinity record,
 * clamping to [0, 100] and weighting by number of data points.
 */
export function applyScoreAdjustment(
  current: number,
  adjustment: number,
  sessionCount: number
): number {
  // Dampen adjustments as more data accumulates (first sessions have more impact)
  const dampen = Math.max(0.2, 1 - sessionCount * 0.05)
  const newScore = current + adjustment * dampen
  return Math.max(0, Math.min(100, newScore))
}

/**
 * Full affinity score recomputation from stored fields.
 * Used when we want a clean recalculation rather than incremental update.
 */
export function recomputeAffinityScore(affinity: TopicAffinity): number {
  const base = NEUTRAL_SCORE

  // Streak signal: +10 for a best streak >= 5
  const streakBonus = affinity.correct_streak_best >= 5 ? 10 : 0

  const raw = base + streakBonus
  return Math.max(0, Math.min(100, raw))
}
