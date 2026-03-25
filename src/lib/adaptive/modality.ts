// ============================================================
// Modality Selection Algorithm
//
// Decides HOW to teach a standard by choosing from 5 modalities:
//   visual, story, procedural, interactive, challenge
//
// Three phases based on data accumulation:
//   1. Cold start (< 3 attempts)  → use parent-set preferences
//   2. Exploration  (3-15 attempts) → epsilon-greedy, try everything
//   3. Exploitation (15+ attempts)  → Thompson sampling, exploit best
//
// Constraints:
//   - Never repeat same modality twice in a row for same domain
//   - Variety bonus for untried modalities
//   - Difficulty stretching: high success on easy → try harder modalities
// ============================================================

import type {
  TeachingModality,
  ModalityScore,
  ModalityScores,
} from '@/types/lesson-content'
import { TEACHING_MODALITIES } from '@/types/lesson-content'

// ── Types ────────────────────────────────────────────────────

interface ChildPreferences {
  learning_pace: 'steady' | 'average' | 'quick'
  challenge_preference: 'gentle' | 'balanced' | 'loves_challenge'
  motivation_style: 'rewards' | 'challenge' | 'encouragement'
}

interface ModalitySelectionContext {
  modalityScores: ModalityScores
  childPreferences: ChildPreferences
  availableModalities: TeachingModality[]
  lastUsedModality: TeachingModality | null  // for same-domain variety
  totalAttempts: number                       // across all modalities
}

// ── Constants ────────────────────────────────────────────────

const COLD_START_THRESHOLD = 3
const EXPLORATION_THRESHOLD = 15
const EPSILON_EXPLORE = 0.4    // exploration phase: 40% random
const EPSILON_EXPLOIT = 0.15   // exploitation phase: 15% random

// ── Main selection function ──────────────────────────────────

export function selectModality(ctx: ModalitySelectionContext): TeachingModality {
  const available = ctx.availableModalities.filter(m => m !== ctx.lastUsedModality)

  // If filtering removed all options, use full list
  const candidates = available.length > 0 ? available : ctx.availableModalities

  if (candidates.length === 1) return candidates[0]

  if (ctx.totalAttempts === 0) {
    // Very first lesson ever — always start with visual (safest, most engaging)
    if (candidates.includes('visual')) return 'visual'
    if (candidates.includes('story')) return 'story'
  }

  if (ctx.totalAttempts < COLD_START_THRESHOLD) {
    return coldStartSelection(candidates, ctx.childPreferences)
  }

  if (ctx.totalAttempts < EXPLORATION_THRESHOLD) {
    return explorationSelection(candidates, ctx.modalityScores, EPSILON_EXPLORE)
  }

  return exploitationSelection(candidates, ctx.modalityScores, EPSILON_EXPLOIT)
}

// ── Phase 1: Cold start ──────────────────────────────────────

/**
 * Use parent-set preferences to pick initial modality.
 * Maps preference combinations to ranked modality lists.
 */
function coldStartSelection(
  candidates: TeachingModality[],
  prefs: ChildPreferences,
): TeachingModality {
  const ranked = coldStartRanking(prefs)

  // Pick the highest-ranked modality that's available
  for (const modality of ranked) {
    if (candidates.includes(modality)) return modality
  }

  // Fallback: random from candidates
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function coldStartRanking(prefs: ChildPreferences): TeachingModality[] {
  // Build a score for each modality based on preferences
  const scores: Record<TeachingModality, number> = {
    visual: 0,
    story: 0,
    procedural: 0,
    interactive: 0,
    challenge: 0,
  }

  // Challenge preference
  if (prefs.challenge_preference === 'loves_challenge') {
    scores.challenge += 3
    scores.interactive += 2
  } else if (prefs.challenge_preference === 'gentle') {
    scores.visual += 3
    scores.story += 2
    scores.procedural += 1
  } else {
    scores.visual += 1
    scores.procedural += 1
    scores.interactive += 1
  }

  // Learning pace
  if (prefs.learning_pace === 'steady') {
    scores.procedural += 2
    scores.visual += 1
  } else if (prefs.learning_pace === 'quick') {
    scores.challenge += 1
    scores.interactive += 1
  }

  // Motivation style
  if (prefs.motivation_style === 'rewards') {
    scores.interactive += 2
    scores.challenge += 1
  } else if (prefs.motivation_style === 'encouragement') {
    scores.story += 2
    scores.visual += 1
  } else {
    // 'challenge' motivation
    scores.challenge += 2
    scores.interactive += 1
  }

  // Sort by score descending, break ties randomly
  return [...TEACHING_MODALITIES].sort((a, b) => {
    const diff = scores[b] - scores[a]
    if (diff !== 0) return diff
    return Math.random() - 0.5
  })
}

// ── Phase 2: Exploration ─────────────────────────────────────

/**
 * Epsilon-greedy with bias toward untried modalities.
 * With probability epsilon, pick a random untried/least-tried modality.
 * Otherwise, pick the modality with highest composite score.
 */
function explorationSelection(
  candidates: TeachingModality[],
  scores: ModalityScores,
  epsilon: number,
): TeachingModality {
  // Epsilon chance: explore
  if (Math.random() < epsilon) {
    return leastTriedModality(candidates, scores)
  }

  // Otherwise: pick best by composite score
  return bestByComposite(candidates, scores)
}

/**
 * Return the modality with fewest attempts (untried first).
 * Ties broken randomly.
 */
function leastTriedModality(
  candidates: TeachingModality[],
  scores: ModalityScores,
): TeachingModality {
  const minAttempts = Math.min(...candidates.map(m => scores[m].attempts))
  const leastTried = candidates.filter(m => scores[m].attempts === minAttempts)
  return leastTried[Math.floor(Math.random() * leastTried.length)]
}

// ── Phase 3: Exploitation (Thompson sampling) ────────────────

/**
 * Thompson sampling: model each modality as Beta(alpha, beta),
 * sample from each, pick the highest sample.
 *
 * alpha = successes + 1 (prior)
 * beta  = failures + 1  (prior)
 *
 * With epsilon probability, still explore randomly.
 */
function exploitationSelection(
  candidates: TeachingModality[],
  scores: ModalityScores,
  epsilon: number,
): TeachingModality {
  if (Math.random() < epsilon) {
    return leastTriedModality(candidates, scores)
  }

  let bestModality = candidates[0]
  let bestSample = -1

  for (const modality of candidates) {
    const s = scores[modality]
    // Convert success_rate (0-1) and engagement (0-1) to composite
    const compositeRate = s.attempts > 0
      ? s.success_rate * 0.6 + s.engagement * 0.4
      : 0.5 // prior: assume 50%

    const successes = Math.round(compositeRate * s.attempts) + 1  // +1 prior
    const failures = Math.round((1 - compositeRate) * s.attempts) + 1

    const sample = betaSample(successes, failures)
    if (sample > bestSample) {
      bestSample = sample
      bestModality = modality
    }
  }

  return bestModality
}

// ── Composite scoring (used during exploration) ──────────────

function bestByComposite(
  candidates: TeachingModality[],
  scores: ModalityScores,
): TeachingModality {
  let best = candidates[0]
  let bestScore = -1

  for (const modality of candidates) {
    const s = scores[modality]
    // Composite: 60% success, 40% engagement, bonus for untried
    const composite = s.attempts > 0
      ? s.success_rate * 0.6 + s.engagement * 0.4
      : 0.55 // slight bonus for untried (encourage exploration)

    if (composite > bestScore) {
      bestScore = composite
      best = modality
    }
  }

  return best
}

// ── Score update helpers ─────────────────────────────────────

/**
 * Update modality scores after a session segment completion.
 * Uses exponential moving average so recent sessions matter more.
 */
export function updateModalityScore(
  current: ModalityScore,
  scorePct: number,
  engagementSignal: string,
): ModalityScore {
  const alpha = current.attempts < 5 ? 0.5 : 0.2  // faster learning early
  const newSuccessRate = scorePct / 100

  const engagementValue = engagementSignalToValue(engagementSignal)

  return {
    success_rate: current.attempts === 0
      ? newSuccessRate
      : current.success_rate * (1 - alpha) + newSuccessRate * alpha,
    engagement: current.attempts === 0
      ? engagementValue
      : current.engagement * (1 - alpha) + engagementValue * alpha,
    attempts: current.attempts + 1,
    last_used: new Date().toISOString(),
  }
}

function engagementSignalToValue(signal: string): number {
  switch (signal) {
    case 'ok': return 0.7
    case 'slowing': return 0.4
    case 'error_streak': return 0.2
    case 'fatigue': return 0.3
    case 'disengaged': return 0.1
    default: return 0.5
  }
}

/**
 * Derive the preferred modality from modality scores.
 * Returns the modality with highest composite score that has ≥ 3 attempts.
 * Returns null if insufficient data.
 */
export function derivePreferredModality(
  scores: ModalityScores,
): TeachingModality | null {
  let best: TeachingModality | null = null
  let bestComposite = -1

  for (const modality of TEACHING_MODALITIES) {
    const s = scores[modality]
    if (s.attempts < 3) continue

    const composite = s.success_rate * 0.6 + s.engagement * 0.4
    if (composite > bestComposite) {
      bestComposite = composite
      best = modality
    }
  }

  return best
}

// ── Beta distribution sampling ───────────────────────────────

/**
 * Sample from Beta(alpha, beta) using the Jöhnk algorithm.
 * Returns a value in [0, 1].
 */
function betaSample(alpha: number, beta: number): number {
  // For small alpha/beta, use the standard gamma-based approach
  const x = gammaSample(alpha)
  const y = gammaSample(beta)
  return x / (x + y)
}

/**
 * Sample from Gamma(shape, 1) using Marsaglia and Tsang's method.
 */
function gammaSample(shape: number): number {
  if (shape < 1) {
    // Boost method for shape < 1
    return gammaSample(shape + 1) * Math.pow(Math.random(), 1 / shape)
  }

  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)

  for (;;) {
    let x: number
    let v: number
    do {
      x = normalSample()
      v = 1 + c * x
    } while (v <= 0)

    v = v * v * v
    const u = Math.random()

    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
  }
}

/**
 * Sample from standard normal distribution (Box-Muller transform).
 */
function normalSample(): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}
