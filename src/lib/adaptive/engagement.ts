// ============================================================
// Engagement & Disengagement Detection
// Pure functions only, no Supabase dependency.
// ============================================================

import type { EngagementWindow, EngagementSignal, EngagementAction } from '@/types/adaptive'

// ── Tunable constants ──────────────────────────────────────

/** Flag 'slowing' when current response time > this multiple of session avg */
const SLOW_RESPONSE_MULTIPLIER = 2.0

/** Flag 'error_streak' at this many consecutive wrong answers */
const ERROR_STREAK_WARNING = 3

/** Trigger domain_pivot at this many consecutive wrong answers */
export const ERROR_STREAK_PIVOT = 5

/** Flag 'fatigue' when session exceeds this many minutes */
const FATIGUE_SESSION_MINUTES = 20

/** Rolling window size for response time trend */
const WINDOW_SIZE = 5

/** Consecutive correct answers to clear 'slowing' or 'error_streak' signal */
const RECOVERY_STREAK = 2

/** Suggest session end after this many correct answers */
const SESSION_END_CORRECT = 15

/** Suggest session end after this many total questions */
const SESSION_END_TOTAL = 25

/** Suggest session end after this many minutes */
const SESSION_END_MINUTES = 25

// ── Factory ────────────────────────────────────────────────

export function createEngagementWindow(): EngagementWindow {
  return {
    recentResponseMs:       [],
    sessionAvgResponseMs:   0,
    errorStreak:            0,
    correctStreak:          0,
    totalWrong:             0,
    pivotCount:             0,
    disengagementTriggered: false,
    sessionStartMs:         Date.now(),
  }
}

// ── Answer processing ──────────────────────────────────────

/**
 * Record a new answer and compute the current engagement signal.
 * Returns both the updated window and the current signal.
 */
export function processAnswer(
  window: EngagementWindow,
  response_ms: number,
  correct: boolean
): { window: EngagementWindow; signal: EngagementSignal } {
  // Update response time window (sliding)
  const recentResponseMs = [...window.recentResponseMs, response_ms].slice(-WINDOW_SIZE)

  // Update session average (running mean)
  const totalAnswers = window.recentResponseMs.length + 1
  const sessionAvgResponseMs =
    totalAnswers <= 1
      ? response_ms
      : Math.round(
          (window.sessionAvgResponseMs * (totalAnswers - 1) + response_ms) / totalAnswers
        )

  // Update streak counts
  const errorStreak   = correct ? 0 : window.errorStreak + 1
  const correctStreak = correct ? window.correctStreak + 1 : 0
  const totalWrong    = correct ? window.totalWrong : window.totalWrong + 1

  const updated: EngagementWindow = {
    ...window,
    recentResponseMs,
    sessionAvgResponseMs,
    errorStreak,
    correctStreak,
    totalWrong,
  }

  const signal = computeSignal(updated, response_ms)

  // Mark disengagement triggered (sticky for rest of session)
  const disengagementTriggered =
    window.disengagementTriggered || signal === 'disengaged'

  return {
    window: { ...updated, disengagementTriggered },
    signal,
  }
}

// ── Signal computation ─────────────────────────────────────

function computeSignal(window: EngagementWindow, latestResponseMs: number): EngagementSignal {
  const sessionMinutes = (Date.now() - window.sessionStartMs) / 60_000

  const signals: EngagementSignal[] = []

  // Slowing: latest response > 2× session average (requires at least 3 data points)
  if (
    window.recentResponseMs.length >= 3 &&
    window.sessionAvgResponseMs > 0 &&
    latestResponseMs > window.sessionAvgResponseMs * SLOW_RESPONSE_MULTIPLIER
  ) {
    // Only flag if correctStreak < RECOVERY_STREAK (recovering child shouldn't be flagged)
    if (window.correctStreak < RECOVERY_STREAK) {
      signals.push('slowing')
    }
  }

  // Error streak
  if (window.errorStreak >= ERROR_STREAK_WARNING) {
    signals.push('error_streak')
  }

  // Fatigue: session too long
  if (sessionMinutes > FATIGUE_SESSION_MINUTES) {
    signals.push('fatigue')
  }

  // Disengaged: two or more signals simultaneously
  if (signals.length >= 2) return 'disengaged'
  if (signals.length === 1) return signals[0]
  return 'ok'
}

// ── Signal snapshot ────────────────────────────────────────

/**
 * Derive the current engagement signal from a window snapshot.
 * Uses the most recent response time recorded in the window.
 * Safe to call outside of processAnswer (e.g. in the engine before selecting a lesson).
 */
export function getCurrentSignal(window: EngagementWindow): EngagementSignal {
  const latestResponseMs =
    window.recentResponseMs.length > 0
      ? window.recentResponseMs[window.recentResponseMs.length - 1]
      : 0
  return computeSignal(window, latestResponseMs)
}

// ── Action recommendation ──────────────────────────────────

/** What the engine should do in response to this signal */
export function recommendAction(signal: EngagementSignal): EngagementAction {
  switch (signal) {
    case 'ok':
      return 'continue'
    case 'slowing':
      return 'reduce_difficulty'
    case 'error_streak':
      return 'domain_pivot'
    case 'fatigue':
      return 'offer_break'
    case 'disengaged':
      return 'domain_pivot'
  }
}

// ── Session end detection ──────────────────────────────────

/**
 * Returns true when a natural session stopping point is reached.
 * Does not force a stop - the UI should suggest rather than mandate.
 */
export function shouldSuggestSessionEnd(
  window: EngagementWindow,
  questionsAnswered: number
): boolean {
  const sessionMinutes = (Date.now() - window.sessionStartMs) / 60_000
  const correctCount = questionsAnswered - window.totalWrong

  return (
    correctCount >= SESSION_END_CORRECT ||
    questionsAnswered >= SESSION_END_TOTAL ||
    sessionMinutes >= SESSION_END_MINUTES
  )
}

// ── Pivot tracking ─────────────────────────────────────────

export function recordPivot(window: EngagementWindow): EngagementWindow {
  return { ...window, pivotCount: window.pivotCount + 1 }
}
