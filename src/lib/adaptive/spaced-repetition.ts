// ============================================================
// Spaced Repetition - SM-2 Algorithm
// Pure functions only, no Supabase dependency.
// ============================================================

import type { Domain } from '@/types/quiz'
import type { SRItem, SRQuality } from '@/types/adaptive'

// ── Constants ──────────────────────────────────────────────

const MIN_EASE_FACTOR = 1.3
const DEFAULT_EASE_FACTOR = 2.5
// Lookahead: surface items due within this many hours
const DEFAULT_LOOKAHEAD_HOURS = 4

// ── Quality mapping ────────────────────────────────────────

/**
 * Convert a lesson score (0-100) to SM-2 quality (0-5).
 * Quality < 3 = failed (repetitions reset to 0).
 */
export function scoreToSRQuality(score_pct: number): SRQuality {
  if (score_pct >= 90) return 5
  if (score_pct >= 75) return 4
  if (score_pct >= 60) return 3
  if (score_pct >= 40) return 2
  if (score_pct >= 20) return 1
  return 0
}

// ── SM-2 core ──────────────────────────────────────────────

/**
 * Apply one SM-2 review cycle. Returns updated SM-2 fields + next_review_at.
 *
 * Child-friendly modification: ease_factor is NOT decreased on failure.
 * This avoids compounding scheduling difficulty for struggling learners.
 * A failed item simply re-queues with interval=1 day.
 */
export function applyReview(
  item: Pick<SRItem, 'ease_factor' | 'interval_days' | 'repetitions'>,
  quality: SRQuality
): {
  ease_factor:      number
  interval_days:    number
  repetitions:      number
  next_review_at:   Date
  last_reviewed_at: Date
} {
  const now = new Date()
  let { ease_factor, repetitions } = item
  let interval_days: number

  if (quality < 3) {
    // Failed: reset repetitions, interval=1, keep ease_factor (child-friendly)
    repetitions = 0
    interval_days = 1
  } else {
    // Passed
    if (repetitions === 0) {
      interval_days = 1
    } else if (repetitions === 1) {
      interval_days = 6
    } else {
      interval_days = Math.round(item.interval_days * ease_factor)
    }
    // Standard SM-2 ease factor update
    ease_factor = Math.max(
      MIN_EASE_FACTOR,
      ease_factor + 0.1 - (5 - quality) * 0.08 - (5 - quality) * 0.02
    )
    repetitions++
  }

  const next_review_at = new Date(now.getTime() + interval_days * 24 * 60 * 60 * 1000)

  return {
    ease_factor,
    interval_days,
    repetitions,
    next_review_at,
    last_reviewed_at: now,
  }
}

// ── Due item queries ───────────────────────────────────────

/**
 * Returns items due for review, sorted most-overdue first.
 * Includes a short lookahead window to avoid same-day misses.
 */
export function getDueItems(
  items: SRItem[],
  lookaheadHours: number = DEFAULT_LOOKAHEAD_HOURS
): SRItem[] {
  const cutoff = new Date(Date.now() + lookaheadHours * 60 * 60 * 1000)
  return items
    .filter((item) => new Date(item.next_review_at) <= cutoff)
    .sort((a, b) => new Date(a.next_review_at).getTime() - new Date(b.next_review_at).getTime())
}

/**
 * How overdue is an item, in days?
 * Positive = overdue, negative = not yet due.
 */
export function overdueDays(item: SRItem): number {
  const diff = Date.now() - new Date(item.next_review_at).getTime()
  return diff / (24 * 60 * 60 * 1000)
}

// ── New item factory ───────────────────────────────────────

/**
 * Produce the initial SR item fields for a first-encountered standard.
 * The initialScore drives the first interval: high score = longer first interval.
 */
export function createInitialSRItem(
  childId: string,
  standard_code: string,
  domain: Domain,
  grade_level: number,
  initialScore: number
): Omit<SRItem, 'id' | 'created_at'> {
  // First interval varies by initial score: good retention → start further out
  const quality = scoreToSRQuality(initialScore)
  const interval_days = quality >= 4 ? 3 : quality >= 3 ? 1 : 1

  const next_review_at = new Date(Date.now() + interval_days * 24 * 60 * 60 * 1000)

  return {
    child_id:         childId,
    standard_code,
    domain,
    grade_level,
    ease_factor:      DEFAULT_EASE_FACTOR,
    interval_days,
    repetitions:      quality >= 3 ? 1 : 0,
    next_review_at:   next_review_at.toISOString(),
    last_reviewed_at: new Date().toISOString(),
    last_score_pct:   initialScore,
    times_reviewed:   1,
  }
}
