// ============================================================
// Profile Signal Extractors
//
// Extract raw behavioral signals from session data that the
// profiler uses to update learning profile dimensions.
//
// Each extractor takes session data and returns a structured
// signal object. These are pure functions — no side effects.
// ============================================================

import type { Domain } from '@/types/quiz'
import type { QuestionCategory, AbstractionLevel } from '@/types/learning-profile'

// ── Input types (from session data) ──────────────────────────

export interface AnswerRecord {
  questionId: number
  answer: string
  correct: boolean
  startMs: number
  endMs: number
  difficulty: number
  domain: Domain
  standardCode: string | null
  questionType: string          // 'multiple_choice' | 'numeric' | 'fraction'
  questionText: string
  correctAnswer: string
  category?: QuestionCategory
  abstractionLevel?: AbstractionLevel
  stepsRequired?: number
}

export interface SessionContext {
  childId: string
  sessionId: string
  gradeLevel: number
  totalTimeMs: number
  isSegmented: boolean
  hintRequestCount: number
  instructionSkipCount: number    // times child hit "Got it!" to skip
  instructionStepsViewed: number  // total instruction steps viewed
  instructionStepsTotal: number   // total instruction steps available
  aiTeacherMessages: number       // times child messaged the AI teacher
}

// ── Extracted signal types ───────────────────────────────────

export interface ResponseTimeSignals {
  /** Per-question response times in ms */
  responseTimes: number[]
  /** Average response time across session */
  avgResponseMs: number
  /** Median response time */
  medianResponseMs: number
  /** Response time trend: positive = slowing, negative = speeding up */
  trendSlope: number
  /** Response times after errors (null if no errors) */
  postErrorResponseMs: number | null
  /** Response times after correct answers */
  postCorrectResponseMs: number | null
  /** First half avg vs second half avg */
  firstHalfAvgMs: number
  secondHalfAvgMs: number
}

export interface ErrorPatternSignals {
  /** Total correct / total questions */
  overallAccuracy: number
  /** Accuracy on bare number problems */
  bareNumberAccuracy: number | null
  /** Accuracy on word problems */
  wordProblemAccuracy: number | null
  /** Accuracy on procedural questions */
  proceduralAccuracy: number | null
  /** Accuracy on conceptual questions */
  conceptualAccuracy: number | null
  /** Accuracy by difficulty level */
  accuracyByDifficulty: Record<number, number>
  /** Accuracy by abstraction level */
  accuracyByAbstraction: Partial<Record<AbstractionLevel, number>>
  /** Wrong answers with their question context (for misconception detection) */
  wrongAnswers: Array<{
    questionText: string
    correctAnswer: string
    givenAnswer: string
    domain: Domain
    standardCode: string | null
    difficulty: number
  }>
  /** Consecutive error streaks observed */
  maxErrorStreak: number
  /** Accuracy on multi-step problems (stepsRequired > 1) */
  multiStepAccuracy: number | null
}

export interface EngagementSignals {
  /** Hint requests per question */
  hintRate: number
  /** Did child skip instruction steps? */
  instructionSkipRate: number
  /** How many instruction steps were viewed vs available */
  instructionCompletionRate: number
  /** AI teacher usage rate (messages per question) */
  aiTeacherUsageRate: number
  /** Session duration vs expected (based on question count) */
  paceRatio: number  // <1 = faster than expected, >1 = slower
}

export interface MasterySignals {
  /** Domains practiced this session */
  domainsPracticed: Domain[]
  /** Per-domain accuracy this session */
  domainAccuracy: Partial<Record<Domain, number>>
  /** Whether the session was interleaved (3+ domains) or focused (1-2) */
  wasInterleaved: boolean
  /** Standards attempted */
  standardsAttempted: string[]
}

export interface FatigueSignals {
  /** Accuracy in first third of session */
  earlyAccuracy: number
  /** Accuracy in middle third */
  midAccuracy: number
  /** Accuracy in final third */
  lateAccuracy: number
  /** Response time in first half vs second half (ratio >1 = slowing) */
  speedDecayRatio: number
  /** Total session duration in minutes */
  sessionMinutes: number
}

export interface ModalitySignals {
  /** Modality used in instruction segments (null if practice-only) */
  modalityUsed: string | null
  /** Accuracy after instruction vs practice-only */
  postInstructionAccuracy: number | null
}

// ── Combined session signals ─────────────────────────────────

export interface SessionSignals {
  responseTime: ResponseTimeSignals
  errorPattern: ErrorPatternSignals
  engagement: EngagementSignals
  mastery: MasterySignals
  fatigue: FatigueSignals
  modality: ModalitySignals
  context: SessionContext
}

// ── Extractors ───────────────────────────────────────────────

export function extractResponseTimeSignals(answers: AnswerRecord[]): ResponseTimeSignals {
  const times = answers.map(a => a.endMs - a.startMs).filter(t => t > 0 && t < 300_000)

  if (times.length === 0) {
    return {
      responseTimes: [], avgResponseMs: 0, medianResponseMs: 0,
      trendSlope: 0, postErrorResponseMs: null, postCorrectResponseMs: null,
      firstHalfAvgMs: 0, secondHalfAvgMs: 0,
    }
  }

  const avg = times.reduce((s, t) => s + t, 0) / times.length
  const sorted = [...times].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]

  // Trend: simple linear regression slope on response times
  const n = times.length
  const xMean = (n - 1) / 2
  const yMean = avg
  let numerator = 0
  let denominator = 0
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (times[i] - yMean)
    denominator += (i - xMean) * (i - xMean)
  }
  const slope = denominator > 0 ? numerator / denominator : 0

  // Post-error and post-correct response times
  const postErrorTimes: number[] = []
  const postCorrectTimes: number[] = []
  for (let i = 1; i < answers.length; i++) {
    const prevCorrect = answers[i - 1].correct
    const time = answers[i].endMs - answers[i].startMs
    if (time > 0 && time < 300_000) {
      if (prevCorrect) postCorrectTimes.push(time)
      else postErrorTimes.push(time)
    }
  }

  const half = Math.ceil(times.length / 2)
  const firstHalf = times.slice(0, half)
  const secondHalf = times.slice(half)

  return {
    responseTimes: times,
    avgResponseMs: Math.round(avg),
    medianResponseMs: median,
    trendSlope: slope,
    postErrorResponseMs: postErrorTimes.length > 0 ? Math.round(postErrorTimes.reduce((s, t) => s + t, 0) / postErrorTimes.length) : null,
    postCorrectResponseMs: postCorrectTimes.length > 0 ? Math.round(postCorrectTimes.reduce((s, t) => s + t, 0) / postCorrectTimes.length) : null,
    firstHalfAvgMs: firstHalf.length > 0 ? Math.round(firstHalf.reduce((s, t) => s + t, 0) / firstHalf.length) : 0,
    secondHalfAvgMs: secondHalf.length > 0 ? Math.round(secondHalf.reduce((s, t) => s + t, 0) / secondHalf.length) : 0,
  }
}

export function extractErrorPatternSignals(answers: AnswerRecord[]): ErrorPatternSignals {
  if (answers.length === 0) {
    return {
      overallAccuracy: 0, bareNumberAccuracy: null, wordProblemAccuracy: null,
      proceduralAccuracy: null, conceptualAccuracy: null,
      accuracyByDifficulty: {}, accuracyByAbstraction: {},
      wrongAnswers: [], maxErrorStreak: 0, multiStepAccuracy: null,
    }
  }

  const overallAccuracy = answers.filter(a => a.correct).length / answers.length

  // Category-based accuracy
  const byCategory = groupAccuracy(answers, a => a.category)
  const byAbstraction = groupAccuracy(answers, a => a.abstractionLevel)
  const byDifficulty = groupAccuracy(answers, a => String(a.difficulty))

  // Multi-step accuracy
  const multiStep = answers.filter(a => (a.stepsRequired ?? 1) > 1)
  const multiStepAccuracy = multiStep.length >= 2
    ? multiStep.filter(a => a.correct).length / multiStep.length
    : null

  // Error streak
  let maxStreak = 0
  let currentStreak = 0
  for (const a of answers) {
    if (!a.correct) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak) }
    else currentStreak = 0
  }

  // Wrong answers for misconception detection
  const wrongAnswers = answers
    .filter(a => !a.correct)
    .map(a => ({
      questionText: a.questionText,
      correctAnswer: a.correctAnswer,
      givenAnswer: a.answer,
      domain: a.domain,
      standardCode: a.standardCode,
      difficulty: a.difficulty,
    }))

  return {
    overallAccuracy,
    bareNumberAccuracy: byCategory['bare_number'] ?? null,
    wordProblemAccuracy: byCategory['word_problem'] ?? null,
    proceduralAccuracy: byCategory['procedural'] ?? null,
    conceptualAccuracy: byCategory['conceptual'] ?? null,
    accuracyByDifficulty: Object.fromEntries(
      Object.entries(groupAccuracy(answers, a => String(a.difficulty)))
        .map(([k, v]) => [Number(k), v])
    ),
    accuracyByAbstraction: byAbstraction as Partial<Record<AbstractionLevel, number>>,
    wrongAnswers,
    maxErrorStreak: maxStreak,
    multiStepAccuracy,
  }
}

export function extractEngagementSignals(
  answers: AnswerRecord[],
  ctx: SessionContext,
): EngagementSignals {
  const questionCount = answers.length || 1
  const expectedMs = questionCount * 20_000 // ~20s per question expected

  return {
    hintRate: ctx.hintRequestCount / questionCount,
    instructionSkipRate: ctx.instructionStepsTotal > 0
      ? ctx.instructionSkipCount / ctx.instructionStepsTotal
      : 0,
    instructionCompletionRate: ctx.instructionStepsTotal > 0
      ? ctx.instructionStepsViewed / ctx.instructionStepsTotal
      : 1,
    aiTeacherUsageRate: ctx.aiTeacherMessages / questionCount,
    paceRatio: ctx.totalTimeMs / expectedMs,
  }
}

export function extractMasterySignals(answers: AnswerRecord[]): MasterySignals {
  const domains = new Set<Domain>()
  const domainCorrect = new Map<Domain, number>()
  const domainTotal = new Map<Domain, number>()
  const standards = new Set<string>()

  for (const a of answers) {
    domains.add(a.domain)
    domainTotal.set(a.domain, (domainTotal.get(a.domain) ?? 0) + 1)
    if (a.correct) domainCorrect.set(a.domain, (domainCorrect.get(a.domain) ?? 0) + 1)
    if (a.standardCode) standards.add(a.standardCode)
  }

  const domainAccuracy: Partial<Record<Domain, number>> = {}
  for (const d of domains) {
    domainAccuracy[d] = (domainCorrect.get(d) ?? 0) / (domainTotal.get(d) ?? 1)
  }

  return {
    domainsPracticed: [...domains],
    domainAccuracy,
    wasInterleaved: domains.size >= 3,
    standardsAttempted: [...standards],
  }
}

export function extractFatigueSignals(answers: AnswerRecord[]): FatigueSignals {
  if (answers.length < 3) {
    return { earlyAccuracy: 0, midAccuracy: 0, lateAccuracy: 0, speedDecayRatio: 1, sessionMinutes: 0 }
  }

  const third = Math.ceil(answers.length / 3)
  const early = answers.slice(0, third)
  const mid = answers.slice(third, third * 2)
  const late = answers.slice(third * 2)

  const acc = (arr: AnswerRecord[]) => arr.length > 0 ? arr.filter(a => a.correct).length / arr.length : 0
  const avgTime = (arr: AnswerRecord[]) => {
    const times = arr.map(a => a.endMs - a.startMs).filter(t => t > 0)
    return times.length > 0 ? times.reduce((s, t) => s + t, 0) / times.length : 0
  }

  const half = Math.ceil(answers.length / 2)
  const firstHalfTime = avgTime(answers.slice(0, half))
  const secondHalfTime = avgTime(answers.slice(half))

  const totalMs = answers.length > 0
    ? answers[answers.length - 1].endMs - answers[0].startMs
    : 0

  return {
    earlyAccuracy: acc(early),
    midAccuracy: acc(mid),
    lateAccuracy: acc(late),
    speedDecayRatio: firstHalfTime > 0 ? secondHalfTime / firstHalfTime : 1,
    sessionMinutes: totalMs / 60_000,
  }
}

export function extractModalitySignals(
  answers: AnswerRecord[],
  modalityUsed: string | null,
  instructionStandardCodes: string[],
): ModalitySignals {
  if (!modalityUsed || instructionStandardCodes.length === 0) {
    return { modalityUsed: null, postInstructionAccuracy: null }
  }

  const instructedSet = new Set(instructionStandardCodes)
  const postInstruction = answers.filter(a => a.standardCode && instructedSet.has(a.standardCode))

  return {
    modalityUsed,
    postInstructionAccuracy: postInstruction.length > 0
      ? postInstruction.filter(a => a.correct).length / postInstruction.length
      : null,
  }
}

/**
 * Combine all extractors into a single SessionSignals object.
 */
export function extractAllSignals(
  answers: AnswerRecord[],
  ctx: SessionContext,
  modalityUsed: string | null,
  instructionStandardCodes: string[],
): SessionSignals {
  return {
    responseTime: extractResponseTimeSignals(answers),
    errorPattern: extractErrorPatternSignals(answers),
    engagement: extractEngagementSignals(answers, ctx),
    mastery: extractMasterySignals(answers),
    fatigue: extractFatigueSignals(answers),
    modality: extractModalitySignals(answers, modalityUsed, instructionStandardCodes),
    context: ctx,
  }
}

// ── Utility ──────────────────────────────────────────────────

function groupAccuracy<T>(
  answers: AnswerRecord[],
  keyFn: (a: AnswerRecord) => T | undefined,
): Record<string, number> {
  const correct = new Map<string, number>()
  const total = new Map<string, number>()

  for (const a of answers) {
    const key = keyFn(a)
    if (key === undefined) continue
    const k = String(key)
    total.set(k, (total.get(k) ?? 0) + 1)
    if (a.correct) correct.set(k, (correct.get(k) ?? 0) + 1)
  }

  const result: Record<string, number> = {}
  for (const [k, t] of total) {
    if (t >= 2) result[k] = (correct.get(k) ?? 0) / t  // need at least 2 to be meaningful
  }
  return result
}
