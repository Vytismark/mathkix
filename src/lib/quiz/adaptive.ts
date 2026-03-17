// ============================================================
// Domain Sweep Adaptive Algorithm
//
// The quiz tests each grade-appropriate domain in sequence.
// G1-2: 4 domains × 5 questions = 20 total
// G3-5: 5 domains × 4 questions = 20 total
// Difficulty steps up/down within each domain based on correctness.
// ============================================================

import type { Domain, DomainAdaptiveState, DomainScores, DomainState, QuizAnswerRecord } from '@/types/quiz'
import { DOMAINS, getDomainsForGrade, getQuestionsPerDomain } from '@/types/quiz'

export { DOMAINS, getDomainsForGrade, getQuestionsPerDomain }
export type { Domain, DomainAdaptiveState }

// ── Constants ─────────────────────────────────────────────
const MIN_DIFFICULTY = 1
const MAX_DIFFICULTY = 3
const MIN_GRADE = 1
const MAX_GRADE = 5

// ── State factory ──────────────────────────────────────────

function createDomainState(startGrade: number): DomainState {
  return {
    questionsAsked: [],
    currentDifficulty: 2,            // start at medium difficulty
    currentGrade: Math.max(MIN_GRADE, Math.min(MAX_GRADE, startGrade)),
  }
}

export function createDomainAdaptiveState(schoolGrade: number | null): DomainAdaptiveState {
  const grade = schoolGrade ?? 2
  const gradeDomains = getDomainsForGrade(grade)
  const questionsPerDomain = getQuestionsPerDomain(grade)
  const domains: Partial<Record<Domain, DomainState>> = {}
  for (const d of gradeDomains) domains[d] = createDomainState(grade)
  return {
    currentDomainIndex: 0,
    gradeDomains,
    questionsPerDomain,
    domains,
    usedQuestionIds: new Set(),
    allAnswers: [],
  }
}

// ── Serialise / deserialise (for DB round-trip) ────────────
// The Set can't be stored in JSON, so we convert it.

export function serialiseDomainState(state: DomainAdaptiveState): object {
  return {
    ...state,
    usedQuestionIds: Array.from(state.usedQuestionIds),
  }
}

export function deserialiseDomainState(raw: unknown): DomainAdaptiveState {
  const obj = raw as Record<string, unknown>
  return {
    ...(obj as Omit<DomainAdaptiveState, 'usedQuestionIds'>),
    usedQuestionIds: new Set(obj.usedQuestionIds as string[]),
  }
}

// ── Rebuild from answer history (stateless re-hydration) ───

export function rebuildDomainStateFromHistory(
  answers: QuizAnswerRecord[],
  schoolGrade: number | null
): DomainAdaptiveState {
  let state = createDomainAdaptiveState(schoolGrade)
  for (const answer of answers) {
    state = processDomainAnswer(state, answer)
  }
  return state
}

// ── Answer processing ──────────────────────────────────────

export function processDomainAnswer(
  state: DomainAdaptiveState,
  answer: QuizAnswerRecord
): DomainAdaptiveState {
  const domain = state.gradeDomains[state.currentDomainIndex] as Domain
  const existing = state.domains[domain]
  if (!existing) return state
  const ds = { ...existing }

  // Record the answer
  ds.questionsAsked = [...ds.questionsAsked, answer]

  // Adapt difficulty and grade
  if (answer.correct) {
    // Step difficulty up; if already max, step grade up
    if (ds.currentDifficulty < MAX_DIFFICULTY) {
      ds.currentDifficulty++
    } else if (ds.currentGrade < MAX_GRADE) {
      ds.currentGrade++
      ds.currentDifficulty = 2  // reset difficulty at new grade
    }
  } else {
    // Step difficulty down; if already min, step grade down
    if (ds.currentDifficulty > MIN_DIFFICULTY) {
      ds.currentDifficulty--
    } else if (ds.currentGrade > MIN_GRADE) {
      ds.currentGrade--
      ds.currentDifficulty = 2  // reset difficulty at new grade
    }
  }

  const next: DomainAdaptiveState = {
    ...state,
    domains: { ...state.domains, [domain]: ds },
    usedQuestionIds: new Set([...state.usedQuestionIds, answer.question_id]),
    allAnswers: [...state.allAnswers, answer],
  }

  // Advance to next domain if this one is complete
  if (ds.questionsAsked.length >= state.questionsPerDomain) {
    next.currentDomainIndex = state.currentDomainIndex + 1
  }

  return next
}

// ── Accessors ──────────────────────────────────────────────

export function getCurrentDomain(state: DomainAdaptiveState): Domain {
  const idx = Math.min(state.currentDomainIndex, state.gradeDomains.length - 1)
  return state.gradeDomains[idx]
}

export function shouldAdvanceDomain(state: DomainAdaptiveState): boolean {
  const domain = getCurrentDomain(state)
  const ds = state.domains[domain]
  return ds ? ds.questionsAsked.length >= state.questionsPerDomain : true
}

export function shouldStopQuiz(state: DomainAdaptiveState): boolean {
  return state.currentDomainIndex >= state.gradeDomains.length
}

export function getDomainProgress(state: DomainAdaptiveState): Partial<Record<Domain, number>> {
  const progress: Partial<Record<Domain, number>> = {}
  for (const d of state.gradeDomains) {
    const ds = state.domains[d]
    progress[d] = ds ? Math.min(ds.questionsAsked.length, state.questionsPerDomain) : 0
  }
  return progress
}

// ── Score computation ──────────────────────────────────────

/**
 * Compute mastery % (0-100) for each grade-relevant domain.
 *
 * Formula:
 *   base    = (correct_count / questionsPerDomain) * 100
 *   bonus   = avg_difficulty_reached * 5  (max +15 for all at difficulty 3)
 *   penalty = avg_answer_time_ms > 30 000 ? -5 : 0
 *   score   = clamp(base + bonus + penalty, 0, 100)
 */
export function computeDomainScores(state: DomainAdaptiveState): DomainScores {
  const scores: DomainScores = {}
  for (const domain of state.gradeDomains) {
    const ds = state.domains[domain]
    if (!ds) { scores[domain] = 0; continue }
    const asked = ds.questionsAsked

    if (asked.length === 0) {
      scores[domain] = 0
      continue
    }

    const correct = asked.filter((a) => a.correct).length
    const base = (correct / state.questionsPerDomain) * 100

    const avgDifficulty = asked.reduce((s, a) => s + a.difficulty, 0) / asked.length
    const bonus = avgDifficulty * 5

    const avgTimeMs = asked.reduce((s, a) => s + a.time_ms, 0) / asked.length
    const penalty = avgTimeMs > 30_000 ? -5 : 0

    scores[domain] = Math.round(Math.max(0, Math.min(100, base + bonus + penalty)))
  }
  return scores
}
