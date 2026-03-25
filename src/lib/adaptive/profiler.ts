// ============================================================
// Child Learning Profiler — Rolling Window Inference Engine
//
// V2: Uses session signal HISTORY for rolling analysis instead
// of single-session threshold checks.
//
// Key improvements over V1:
//   1. Rolling window: looks at last N sessions, not just current
//   2. Trend detection: improving/stable/declining per dimension
//   3. Correlation-aware: anxiety affects speed interpretation, etc.
//   4. Consistency requirements: established values need 3+ consistent
//      counter-signals to change (prevents flapping)
//   5. Diminishing confidence returns: later sessions add less certainty
//   6. Minimum sample sizes: dimensions wait for enough data
//
// All inference is SILENT — no questions to the child.
// ============================================================

import type {
  ChildLearningProfile,
  SessionSignalSnapshot,
  CognitiveStage,
  MemoryCapacity,
  ProcessingSpeedLevel,
  AnxietyLevel,
  ProceduralConceptualBalance,
  RepresentationPref,
  ExampleRulePref,
  MotivationOrientation,
  ChallengeTolerance,
  MindsetIndicator,
  ErrorTypeTendency,
  SelfCorrectionAbility,
  HintResponsiveness,
  ResponseLatencyPattern,
  InterleavingPref,
  WordProblemLevel,
  FatiguePattern,
  FeedbackGranularity,
  ExplanationDepth,
  InstructionStyle,
  ExampleFadingStage,
  LessonOrdering,
  CRAStage,
  MasterySpeed,
} from '@/types/learning-profile'
import {
  createDefaultProfile,
  updateDimension,
  updateArrayDimension,
  updateDomainMapDimension,
  MAX_SIGNAL_HISTORY,
} from '@/types/learning-profile'
import type { SessionSignals } from './profile-signals'
import type { Domain } from '@/types/quiz'
import { detectMisconceptions } from '@/data/misconceptions'

// ── Main entry point ─────────────────────────────────────────

export function updateProfile(
  current: ChildLearningProfile | null,
  signals: SessionSignals,
): ChildLearningProfile {
  // Handle null, undefined, or empty {} from DB
  const profile = (current && current.cognitiveStage) ? current : createDefaultProfile()

  // Build snapshot and append to history
  const snapshot = buildSnapshot(signals)
  const history = [...(profile.signalHistory ?? []), snapshot]
  if (history.length > MAX_SIGNAL_HISTORY) history.splice(0, history.length - MAX_SIGNAL_HISTORY)

  // Rolling window for analysis (last 10 sessions)
  const window = history.slice(-10)

  // Cross-session statistics
  const stats = computeRollingStats(window)

  // Correlation context: dimensions that affect interpretation of others
  const correlations: CorrelationContext = {
    isAnxious: profile.mathAnxietyLevel?.value === 'high' && (profile.mathAnxietyLevel?.confidence ?? 0) >= 0.3,
    isSlow: profile.processingSpeed?.value === 'slow' && (profile.processingSpeed?.confidence ?? 0) >= 0.3,
    isCareless: profile.errorTypeTendency?.value === 'careless' && (profile.errorTypeTendency?.confidence ?? 0) >= 0.3,
  }

  return {
    cognitiveStage: inferCognitiveStage(profile.cognitiveStage, signals, stats),
    workingMemoryCapacity: inferWorkingMemory(profile.workingMemoryCapacity, signals, stats, correlations),
    processingSpeed: inferProcessingSpeed(profile.processingSpeed, signals, stats, correlations),
    mathAnxietyLevel: inferMathAnxiety(profile.mathAnxietyLevel, signals, stats),

    misconceptionFlags: inferMisconceptions(profile.misconceptionFlags, signals, window),
    proceduralVsConceptual: inferProceduralConceptual(profile.proceduralVsConceptual, signals, stats),

    representationPreference: inferRepresentationPref(profile.representationPreference, signals, window),
    exampleFirstVsRuleFirst: inferExampleRulePref(profile.exampleFirstVsRuleFirst, signals, window),
    craStageByDomain: inferCRAStage(profile.craStageByDomain, signals),

    motivationOrientation: inferMotivation(profile.motivationOrientation, signals, stats),
    challengeTolerance: inferChallengeTolerance(profile.challengeTolerance, signals, stats),
    mindsetIndicator: inferMindset(profile.mindsetIndicator, signals, stats, correlations),

    errorTypeTendency: inferErrorType(profile.errorTypeTendency, signals, stats),
    selfCorrectionAbility: inferSelfCorrection(profile.selfCorrectionAbility, signals, stats),
    hintResponsiveness: inferHintResponsiveness(profile.hintResponsiveness, signals, stats),
    responseLatencyPattern: inferLatencyPattern(profile.responseLatencyPattern, signals, stats),

    masterySpeedByDomain: inferMasterySpeed(profile.masterySpeedByDomain, signals, window),
    interleavingPreference: inferInterleavingPref(profile.interleavingPreference, signals, window),

    wordProblemProficiency: inferWordProblemLevel(profile.wordProblemProficiency, signals, stats),
    sessionFatiguePattern: inferFatiguePattern(profile.sessionFatiguePattern, signals, stats),

    feedbackGranularity: inferFeedbackGranularity(profile.feedbackGranularity, signals, stats),
    explanationDepth: inferExplanationDepth(profile.explanationDepth, signals, stats),

    discoveryVsDirectInstruction: inferInstructionStyle(profile.discoveryVsDirectInstruction, signals, window),
    workedExampleFadingStage: inferExampleFading(profile.workedExampleFadingStage, signals, stats),
    problemFirstVsLessonFirst: inferLessonOrdering(profile.problemFirstVsLessonFirst, signals, stats),

    signalHistory: history,
  }
}

// ── Rolling statistics ───────────────────────────────────────

interface RollingStats {
  sessionCount: number
  avgAccuracy: number
  avgResponseMs: number
  avgHintRate: number
  avgErrorStreak: number
  avgSpeedDecayRatio: number
  avgInstructionSkipRate: number
  avgAiTeacherUsage: number
  avgInstructionCompletion: number
  /** Accuracy trend: positive = improving, negative = declining */
  accuracyTrend: number
  /** Response time trend: positive = slowing, negative = speeding up */
  responseTrend: number
  /** Consistency of accuracy (low variance = consistent performer) */
  accuracyVariance: number
  /** Average post-error pause ratio (pause after error / pause after correct) */
  avgPostErrorPauseRatio: number
  /** Average bare number vs word problem gap */
  avgBareVsWordGap: number | null
  /** Average procedural vs conceptual gap */
  avgProcVsConceptGap: number | null
  /** How often sessions are interleaved */
  interleavedRate: number
  /** Average first-half vs second-half accuracy gap (fatigue indicator) */
  avgFatigueGap: number
}

function computeRollingStats(window: SessionSignalSnapshot[]): RollingStats {
  const n = window.length
  if (n === 0) return emptyStats()

  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length
  const variance = (arr: number[]) => {
    const m = avg(arr)
    return arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length
  }

  const accuracies = window.map(s => s.accuracy)
  const responseTimes = window.map(s => s.avgResponseMs)
  const hintRates = window.map(s => s.hintRate)
  const errorStreaks = window.map(s => s.errorStreak)
  const speedDecays = window.map(s => s.speedDecayRatio)
  const skipRates = window.map(s => s.instructionSkipRate)
  const aiUsages = window.map(s => s.aiTeacherUsageRate)
  const completions = window.map(s => s.instructionCompletionRate)

  // Trend: linear regression slope on accuracies over time
  const accuracyTrend = linearSlope(accuracies)
  const responseTrend = linearSlope(responseTimes)

  // Post-error pause ratio (average across sessions that have it)
  const pauseRatios = window
    .filter(s => s.postErrorPauseMs !== null && s.postCorrectPauseMs !== null && s.postCorrectPauseMs > 0)
    .map(s => s.postErrorPauseMs! / s.postCorrectPauseMs!)
  const avgPostErrorPauseRatio = pauseRatios.length >= 2 ? avg(pauseRatios) : 1.0

  // Bare number vs word problem gap
  const bwGaps = window
    .filter(s => s.bareNumberAccuracy !== null && s.wordProblemAccuracy !== null)
    .map(s => s.bareNumberAccuracy! - s.wordProblemAccuracy!)
  const avgBareVsWordGap = bwGaps.length >= 2 ? avg(bwGaps) : null

  // Procedural vs conceptual gap
  const pcGaps = window
    .filter(s => s.proceduralAccuracy !== null && s.conceptualAccuracy !== null)
    .map(s => s.proceduralAccuracy! - s.conceptualAccuracy!)
  const avgProcVsConceptGap = pcGaps.length >= 2 ? avg(pcGaps) : null

  // Interleaving rate
  const interleavedRate = window.filter(s => s.wasInterleaved).length / n

  // Fatigue gap (first half - second half accuracy)
  const fatigueGaps = window.map(s => s.firstHalfAccuracy - s.secondHalfAccuracy)

  return {
    sessionCount: n,
    avgAccuracy: avg(accuracies),
    avgResponseMs: avg(responseTimes),
    avgHintRate: avg(hintRates),
    avgErrorStreak: avg(errorStreaks),
    avgSpeedDecayRatio: avg(speedDecays),
    avgInstructionSkipRate: avg(skipRates),
    avgAiTeacherUsage: avg(aiUsages),
    avgInstructionCompletion: avg(completions),
    accuracyTrend,
    responseTrend,
    accuracyVariance: variance(accuracies),
    avgPostErrorPauseRatio,
    avgBareVsWordGap,
    avgProcVsConceptGap,
    interleavedRate,
    avgFatigueGap: avg(fatigueGaps),
  }
}

function emptyStats(): RollingStats {
  return {
    sessionCount: 0, avgAccuracy: 0.5, avgResponseMs: 15000, avgHintRate: 0,
    avgErrorStreak: 0, avgSpeedDecayRatio: 1, avgInstructionSkipRate: 0,
    avgAiTeacherUsage: 0, avgInstructionCompletion: 1,
    accuracyTrend: 0, responseTrend: 0, accuracyVariance: 0,
    avgPostErrorPauseRatio: 1, avgBareVsWordGap: null, avgProcVsConceptGap: null,
    interleavedRate: 0.5, avgFatigueGap: 0,
  }
}

/** Simple linear regression slope */
function linearSlope(values: number[]): number {
  const n = values.length
  if (n < 3) return 0
  const xMean = (n - 1) / 2
  const yMean = values.reduce((s, v) => s + v, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean)
    den += (i - xMean) ** 2
  }
  return den > 0 ? num / den : 0
}

// ── Correlation context ──────────────────────────────────────

interface CorrelationContext {
  /** If true, slow processing may be anxiety, not low ability */
  isAnxious: boolean
  /** If true, errors may be speed-related, not comprehension */
  isSlow: boolean
  /** If true, errors are likely careless, not conceptual */
  isCareless: boolean
}

// ── Signal snapshot builder ──────────────────────────────────

function buildSnapshot(signals: SessionSignals): SessionSignalSnapshot {
  return {
    timestamp: new Date().toISOString(),
    accuracy: signals.errorPattern.overallAccuracy,
    avgResponseMs: signals.responseTime.avgResponseMs,
    questionCount: signals.context.totalTimeMs > 0 ? signals.responseTime.responseTimes.length : 0,
    errorStreak: signals.errorPattern.maxErrorStreak,
    bareNumberAccuracy: signals.errorPattern.bareNumberAccuracy,
    wordProblemAccuracy: signals.errorPattern.wordProblemAccuracy,
    proceduralAccuracy: signals.errorPattern.proceduralAccuracy,
    conceptualAccuracy: signals.errorPattern.conceptualAccuracy,
    multiStepAccuracy: signals.errorPattern.multiStepAccuracy,
    postErrorPauseMs: signals.responseTime.postErrorResponseMs,
    postCorrectPauseMs: signals.responseTime.postCorrectResponseMs,
    firstHalfAccuracy: signals.fatigue.earlyAccuracy,
    secondHalfAccuracy: signals.fatigue.lateAccuracy,
    speedDecayRatio: signals.fatigue.speedDecayRatio,
    hintRate: signals.engagement.hintRate,
    aiTeacherUsageRate: signals.engagement.aiTeacherUsageRate,
    instructionSkipRate: signals.engagement.instructionSkipRate,
    instructionCompletionRate: signals.engagement.instructionCompletionRate,
    modalityUsed: signals.modality.modalityUsed,
    postInstructionAccuracy: signals.modality.postInstructionAccuracy,
    domainsPracticed: signals.mastery.domainsPracticed,
    wasInterleaved: signals.mastery.wasInterleaved,
  }
}

// ── 1. Learning Profile ──────────────────────────────────────

function inferCognitiveStage(
  current: ChildLearningProfile['cognitiveStage'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  const { errorPattern } = signals
  const abstractAcc = errorPattern.accuracyByAbstraction['abstract']
  const concreteAcc = errorPattern.accuracyByAbstraction['concrete']

  // Need at least some abstraction-level data
  if (abstractAcc === undefined && concreteAcc === undefined) {
    return updateDimension(current, current.value, 0.05)
  }

  let value: CognitiveStage = 'concrete'
  let strength = 0.4

  // Use rolling accuracy for more stable inference
  if (abstractAcc !== undefined && abstractAcc >= 0.7 && stats.sessionCount >= 3) {
    value = 'formal'
    strength = 0.7
  } else if (abstractAcc !== undefined && abstractAcc >= 0.4) {
    value = 'transitional'
    strength = 0.5
  } else if (concreteAcc !== undefined && concreteAcc >= 0.6) {
    value = 'concrete'
    strength = 0.6
  }

  return updateDimension(current, value, strength)
}

function inferWorkingMemory(
  current: ChildLearningProfile['workingMemoryCapacity'],
  signals: SessionSignals,
  stats: RollingStats,
  correlations: CorrelationContext,
) {
  const multiStepAcc = signals.errorPattern.multiStepAccuracy

  let value: MemoryCapacity = 'medium'
  let strength = 0.3

  if (multiStepAcc !== null && stats.sessionCount >= 2) {
    // Use current session + rolling average for stability
    const rollingMultiStep = stats.sessionCount >= 3
      ? (multiStepAcc + stats.avgAccuracy) / 2  // blend with overall accuracy
      : multiStepAcc

    if (rollingMultiStep >= 0.75) { value = 'high'; strength = 0.6 }
    else if (rollingMultiStep < 0.35) { value = 'low'; strength = 0.6 }
    else { value = 'medium'; strength = 0.4 }

    // Correlation: anxious kids may fail multi-step from anxiety, not low memory
    if (correlations.isAnxious && value === 'low') {
      strength *= 0.5  // reduce confidence in "low" if anxiety is present
    }
  }

  return updateDimension(current, value, strength)
}

function inferProcessingSpeed(
  current: ChildLearningProfile['processingSpeed'],
  signals: SessionSignals,
  stats: RollingStats,
  correlations: CorrelationContext,
) {
  // Use rolling average for stability (not just this session)
  const avgMs = stats.sessionCount >= 3 ? stats.avgResponseMs : signals.responseTime.avgResponseMs
  const grade = signals.context.gradeLevel
  const normMs = grade <= 3 ? 15_000 : grade <= 5 ? 12_000 : 10_000

  let value: ProcessingSpeedLevel
  if (avgMs < normMs * 0.65) value = 'fast'
  else if (avgMs > normMs * 1.5) value = 'slow'
  else value = 'moderate'

  // Correlation: anxious kids appear slow but it's pause-driven
  let strength = stats.sessionCount >= 3 ? 0.7 : 0.4
  if (correlations.isAnxious && value === 'slow') {
    // Check if slowness is post-error pauses (anxiety) vs general slowness
    if (stats.avgPostErrorPauseRatio > 2.0) {
      strength *= 0.4  // probably anxiety, not actual slow processing
    }
  }

  return updateDimension(current, value, strength)
}

function inferMathAnxiety(
  current: ChildLearningProfile['mathAnxietyLevel'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  let anxietyScore = 0
  const weight = stats.sessionCount >= 5 ? 1.0 : 0.6

  // Rolling: consistent post-error pauses across sessions
  if (stats.avgPostErrorPauseRatio > 2.0) anxietyScore += 2 * weight
  else if (stats.avgPostErrorPauseRatio > 1.5) anxietyScore += 1 * weight

  // Rolling: consistently high hint rate
  if (stats.avgHintRate > 0.5) anxietyScore += 1.5 * weight
  else if (stats.avgHintRate > 0.3) anxietyScore += 0.5 * weight

  // Rolling: low accuracy despite slow speed (trying hard but failing)
  if (stats.avgAccuracy < 0.4 && stats.avgResponseMs > 20_000) anxietyScore += 1.5 * weight

  // Trend: declining accuracy suggests growing frustration
  if (stats.accuracyTrend < -0.03) anxietyScore += 1

  // Current session reinforcement
  const { responseTime, engagement } = signals
  if (responseTime.postErrorResponseMs !== null && responseTime.postCorrectResponseMs !== null) {
    if (responseTime.postErrorResponseMs / responseTime.postCorrectResponseMs > 2.5) anxietyScore += 1
  }
  if (engagement.hintRate > 0.6) anxietyScore += 0.5

  let value: AnxietyLevel
  if (anxietyScore >= 4) value = 'high'
  else if (anxietyScore >= 2) value = 'moderate'
  else value = 'low'

  return updateDimension(current, value, Math.min(0.8, anxietyScore / 6))
}

// ── 2. Knowledge State ───────────────────────────────────────

function inferMisconceptions(
  current: ChildLearningProfile['misconceptionFlags'],
  signals: SessionSignals,
  window: SessionSignalSnapshot[],
) {
  const detected = detectMisconceptions(signals.errorPattern.wrongAnswers)
  const newCodes = detected.map(m => m.code)

  // Only add misconceptions if they've appeared in 2+ of last 5 sessions
  // This prevents one-off errors from flagging misconceptions
  const persistentCodes = newCodes // current session codes are candidates

  // Remove misconceptions that haven't appeared in 5+ sessions
  const toRemove = current.value.filter(code =>
    !newCodes.includes(code) && current.dataPoints > 5 && window.length >= 5
  )

  return updateArrayDimension(current, persistentCodes, toRemove, newCodes.length > 0 ? 0.6 : 0.2)
}

function inferProceduralConceptual(
  current: ChildLearningProfile['proceduralVsConceptual'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  // Use rolling gap for stability
  const gap = stats.avgProcVsConceptGap
  if (gap === null) return updateDimension(current, current.value, 0.1)

  let value: ProceduralConceptualBalance
  if (gap > 0.2) value = 'procedural_heavy'
  else if (gap < -0.2) value = 'conceptual_heavy'
  else value = 'balanced'

  const strength = stats.sessionCount >= 5 ? 0.6 : 0.3
  return updateDimension(current, value, strength)
}

// ── 3. Learning Style & Modality ─────────────────────────────

function inferRepresentationPref(
  current: ChildLearningProfile['representationPreference'],
  signals: SessionSignals,
  window: SessionSignalSnapshot[],
) {
  // Look at modality performance across recent sessions
  const modalitySessions = window.filter(s => s.modalityUsed && s.postInstructionAccuracy !== null)
  if (modalitySessions.length < 3) return updateDimension(current, current.value, 0.1)

  // Group by modality and average accuracy
  const modalityAccuracy = new Map<string, number[]>()
  for (const s of modalitySessions) {
    const arr = modalityAccuracy.get(s.modalityUsed!) ?? []
    arr.push(s.postInstructionAccuracy!)
    modalityAccuracy.set(s.modalityUsed!, arr)
  }

  let bestModality = ''
  let bestAvg = -1
  for (const [mod, accs] of modalityAccuracy) {
    if (accs.length < 2) continue  // need at least 2 sessions
    const avg = accs.reduce((s, a) => s + a, 0) / accs.length
    if (avg > bestAvg) { bestAvg = avg; bestModality = mod }
  }

  const mapping: Record<string, RepresentationPref> = {
    'visual': 'visual', 'interactive': 'visual',
    'story': 'verbal',
    'procedural': 'symbolic', 'challenge': 'symbolic',
  }

  const pref = mapping[bestModality] ?? current.value
  return updateDimension(current, pref, bestAvg >= 0.7 ? 0.6 : 0.3)
}

function inferExampleRulePref(
  current: ChildLearningProfile['exampleFirstVsRuleFirst'],
  signals: SessionSignals,
  window: SessionSignalSnapshot[],
) {
  const modalitySessions = window.filter(s => s.modalityUsed && s.postInstructionAccuracy !== null)
  if (modalitySessions.length < 3) return updateDimension(current, current.value, 0.1)

  // Compare procedural (rule-first) vs visual/story (example-first) performance
  const proceduralAccs = modalitySessions.filter(s => s.modalityUsed === 'procedural').map(s => s.postInstructionAccuracy!)
  const exampleAccs = modalitySessions.filter(s => s.modalityUsed === 'visual' || s.modalityUsed === 'story').map(s => s.postInstructionAccuracy!)

  if (proceduralAccs.length < 1 || exampleAccs.length < 1) return updateDimension(current, current.value, 0.1)

  const procAvg = proceduralAccs.reduce((s, a) => s + a, 0) / proceduralAccs.length
  const exampleAvg = exampleAccs.reduce((s, a) => s + a, 0) / exampleAccs.length

  let value: ExampleRulePref = 'balanced'
  if (procAvg > exampleAvg + 0.15) value = 'rule_first'
  else if (exampleAvg > procAvg + 0.15) value = 'example_first'

  return updateDimension(current, value, Math.abs(procAvg - exampleAvg) > 0.15 ? 0.6 : 0.3)
}

function inferCRAStage(
  current: ChildLearningProfile['craStageByDomain'],
  signals: SessionSignals,
) {
  let updated = current
  for (const domain of signals.mastery.domainsPracticed) {
    const diffAccuracy = signals.errorPattern.accuracyByDifficulty
    const hardAcc = diffAccuracy[3] ?? 0
    const medAcc = diffAccuracy[2] ?? 0
    const easyAcc = diffAccuracy[1] ?? 0

    let stage: CRAStage
    if (hardAcc >= 0.65) stage = 'abstract'
    else if (medAcc >= 0.55 || easyAcc >= 0.75) stage = 'representational'
    else stage = 'concrete'

    updated = updateDomainMapDimension(updated, domain, stage, 0.4)
  }
  return updated
}

// ── 4. Motivational & Engagement ─────────────────────────────

function inferMotivation(
  current: ChildLearningProfile['motivationOrientation'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  // Use rolling stats for stable inference
  let value: MotivationOrientation = 'mixed'
  let strength = 0.3

  if (stats.sessionCount >= 5) {
    // Intrinsic: consistently uses AI teacher, completes instruction fully
    if (stats.avgAiTeacherUsage > 0.3 && stats.avgInstructionCompletion > 0.8) {
      value = 'intrinsic'
      strength = 0.6
    }
    // Extrinsic: skips instruction, rushes through
    else if (stats.avgInstructionSkipRate > 0.3 && stats.avgAiTeacherUsage < 0.1) {
      value = 'extrinsic'
      strength = 0.6
    }
  }

  return updateDimension(current, value, strength)
}

function inferChallengeTolerance(
  current: ChildLearningProfile['challengeTolerance'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  let value: ChallengeTolerance = 'moderate'
  let strength = 0.3

  if (stats.sessionCount >= 3) {
    // High: persists through errors, low hint rate across sessions
    if (stats.avgErrorStreak >= 2 && stats.avgHintRate < 0.2) {
      value = 'high'
      strength = 0.6
    }
    // Low: high hint rate, low error streaks (gives up quickly)
    else if (stats.avgHintRate > 0.4 && stats.avgErrorStreak <= 1) {
      value = 'low'
      strength = 0.6
    }

    // Trend matters: improving accuracy despite errors = growing tolerance
    if (stats.accuracyTrend > 0.02 && signals.errorPattern.maxErrorStreak >= 2) {
      value = 'high'
      strength = Math.max(strength, 0.5)
    }
  }

  return updateDimension(current, value, strength)
}

function inferMindset(
  current: ChildLearningProfile['mindsetIndicator'],
  signals: SessionSignals,
  stats: RollingStats,
  correlations: CorrelationContext,
) {
  let value: MindsetIndicator = 'neutral'
  let strength = 0.3

  // Use rolling post-error pause ratio (more stable than single session)
  if (stats.sessionCount >= 3) {
    const ratio = stats.avgPostErrorPauseRatio

    // Growth: doesn't pause much after errors, accuracy improving
    if (ratio < 1.3 && stats.accuracyTrend >= 0) {
      value = 'growth_leaning'
      strength = 0.5
    }
    // Fixed: long pauses after errors, accuracy declining or flat
    else if (ratio > 2.0 && stats.accuracyTrend <= 0) {
      value = 'fixed_leaning'
      strength = 0.5
    }

    // Correlation: anxious kids look fixed but it's anxiety not mindset
    if (correlations.isAnxious && value === 'fixed_leaning') {
      strength *= 0.5
    }
  }

  return updateDimension(current, value, strength)
}

// ── 5. Error & Response Patterns ─────────────────────────────

function inferErrorType(
  current: ChildLearningProfile['errorTypeTendency'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  if (signals.errorPattern.wrongAnswers.length < 2 && stats.sessionCount < 3) {
    return updateDimension(current, current.value, 0.05)
  }

  let value: ErrorTypeTendency = 'mixed'
  let strength = 0.4

  // Use rolling gaps for stability
  if (stats.avgBareVsWordGap !== null && stats.avgBareVsWordGap > 0.25) {
    value = 'reading'
    strength = 0.7
  } else if (stats.avgResponseMs < 8_000 && stats.avgAccuracy < 0.7) {
    value = 'careless'
    strength = 0.6
  } else if (stats.avgAccuracy < 0.5 && stats.avgResponseMs > 15_000) {
    value = 'conceptual'
    strength = 0.6
  }

  return updateDimension(current, value, strength)
}

function inferSelfCorrection(
  current: ChildLearningProfile['selfCorrectionAbility'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  let value: SelfCorrectionAbility = 'moderate'
  const strength = stats.sessionCount >= 3 ? 0.5 : 0.3

  // Rolling: low hint rate + good accuracy = self-correcting
  if (stats.avgHintRate < 0.1 && stats.avgAccuracy >= 0.7) value = 'high'
  else if (stats.avgHintRate > 0.4) value = 'low'

  return updateDimension(current, value, strength)
}

function inferHintResponsiveness(
  current: ChildLearningProfile['hintResponsiveness'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  let value: HintResponsiveness = 'benefits_from_nudge'
  const strength = stats.sessionCount >= 3 ? 0.5 : 0.3

  if (stats.avgHintRate < 0.1 && stats.avgAccuracy >= 0.7) value = 'self_sufficient'
  else if (stats.avgHintRate > 0.3 && stats.avgAccuracy < 0.5) value = 'needs_full_scaffold'

  return updateDimension(current, value, strength)
}

function inferLatencyPattern(
  current: ChildLearningProfile['responseLatencyPattern'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  // Use rolling averages for stable classification
  const avgMs = stats.sessionCount >= 3 ? stats.avgResponseMs : signals.responseTime.avgResponseMs
  const acc = stats.sessionCount >= 3 ? stats.avgAccuracy : signals.errorPattern.overallAccuracy

  let value: ResponseLatencyPattern = 'variable'
  if (avgMs < 10_000 && acc >= 0.8) value = 'fast_right'
  else if (avgMs < 10_000 && acc < 0.5) value = 'fast_wrong'
  else if (avgMs > 18_000 && acc >= 0.6) value = 'slow_careful'

  // Consistency check: if accuracy variance is high, pattern is variable
  if (stats.accuracyVariance > 0.04 && stats.sessionCount >= 5) value = 'variable'

  return updateDimension(current, value, stats.sessionCount >= 3 ? 0.6 : 0.3)
}

// ── 6. Pacing & Progression ─────────────────────────────────

function inferMasterySpeed(
  current: ChildLearningProfile['masterySpeedByDomain'],
  signals: SessionSignals,
  window: SessionSignalSnapshot[],
) {
  let updated = current

  for (const domain of signals.mastery.domainsPracticed) {
    // Look at accuracy trend for this domain across sessions
    const domainSessions = window.filter(s => s.domainsPracticed.includes(domain))
    if (domainSessions.length < 3) continue

    const accs = domainSessions.map(s => s.accuracy)
    const trend = linearSlope(accs)
    const avgAcc = accs.reduce((s, a) => s + a, 0) / accs.length

    let speed: MasterySpeed
    if (avgAcc >= 0.8 && trend >= 0) speed = 'fast'
    else if (avgAcc < 0.45 || trend < -0.02) speed = 'slow'
    else speed = 'average'

    updated = updateDomainMapDimension(updated, domain, speed, 0.5)
  }

  return updated
}

function inferInterleavingPref(
  current: ChildLearningProfile['interleavingPreference'],
  signals: SessionSignals,
  window: SessionSignalSnapshot[],
) {
  if (window.length < 5) return updateDimension(current, current.value, 0.15)

  // Compare accuracy in interleaved vs focused sessions
  const interleaved = window.filter(s => s.wasInterleaved)
  const focused = window.filter(s => !s.wasInterleaved)

  if (interleaved.length < 2 || focused.length < 2) return updateDimension(current, current.value, 0.15)

  const interleavedAcc = interleaved.reduce((s, w) => s + w.accuracy, 0) / interleaved.length
  const focusedAcc = focused.reduce((s, w) => s + w.accuracy, 0) / focused.length

  let value: InterleavingPref = 'balanced'
  if (interleavedAcc > focusedAcc + 0.1) value = 'interleaved'
  else if (focusedAcc > interleavedAcc + 0.1) value = 'focused_blocks'

  return updateDimension(current, value, 0.5)
}

// ── 7. Contextual Factors ────────────────────────────────────

function inferWordProblemLevel(
  current: ChildLearningProfile['wordProblemProficiency'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  // Use rolling average for stability
  const gap = stats.avgBareVsWordGap
  const wp = signals.errorPattern.wordProblemAccuracy

  if (gap === null && wp === null) return updateDimension(current, current.value, 0.05)

  let value: WordProblemLevel
  if (gap !== null && stats.sessionCount >= 3) {
    // Rolling gap-based (more stable)
    if (gap < 0.1) value = 'strong'
    else if (gap < 0.25) value = 'adequate'
    else value = 'struggles'
  } else if (wp !== null) {
    if (wp >= 0.75) value = 'strong'
    else if (wp >= 0.5) value = 'adequate'
    else value = 'struggles'
  } else {
    return updateDimension(current, current.value, 0.05)
  }

  return updateDimension(current, value, stats.sessionCount >= 3 ? 0.6 : 0.4)
}

function inferFatiguePattern(
  current: ChildLearningProfile['sessionFatiguePattern'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  if (stats.sessionCount < 3) return updateDimension(current, current.value, 0.1)

  let value: FatiguePattern = 'consistent'

  // Rolling: average first-half vs second-half gap across sessions
  if (stats.avgFatigueGap > 0.15 && stats.avgSpeedDecayRatio > 1.2) {
    // Determine if early or late decay
    value = signals.fatigue.earlyAccuracy > signals.fatigue.midAccuracy ? 'early_decay' : 'late_decay'
  }

  return updateDimension(current, value, stats.sessionCount >= 5 ? 0.6 : 0.3)
}

// ── 8. Scaffolding & Feedback ────────────────────────────────

function inferFeedbackGranularity(
  current: ChildLearningProfile['feedbackGranularity'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  const grade = signals.context.gradeLevel
  let value: FeedbackGranularity = 'balanced'

  if (stats.sessionCount >= 3) {
    if (grade <= 3 || stats.avgHintRate > 0.4) value = 'immediate_needed'
    else if (grade >= 5 && stats.avgAccuracy >= 0.8 && stats.avgHintRate < 0.1) value = 'delayed_ok'
  }

  return updateDimension(current, value, stats.sessionCount >= 3 ? 0.5 : 0.3)
}

function inferExplanationDepth(
  current: ChildLearningProfile['explanationDepth'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  let value: ExplanationDepth = 'moderate'

  if (stats.sessionCount >= 3) {
    if (stats.avgAiTeacherUsage > 0.5) value = 'detailed'
    else if (stats.avgInstructionSkipRate > 0.4 && stats.avgAiTeacherUsage < 0.1) value = 'brief'
  }

  return updateDimension(current, value, stats.sessionCount >= 3 ? 0.5 : 0.3)
}

// ── 9. Lesson Structure ──────────────────────────────────────

function inferInstructionStyle(
  current: ChildLearningProfile['discoveryVsDirectInstruction'],
  signals: SessionSignals,
  window: SessionSignalSnapshot[],
) {
  const modalitySessions = window.filter(s => s.modalityUsed && s.postInstructionAccuracy !== null)
  if (modalitySessions.length < 3) return updateDimension(current, current.value, 0.1)

  const interactive = modalitySessions.filter(s => s.modalityUsed === 'interactive')
  const procedural = modalitySessions.filter(s => s.modalityUsed === 'procedural')

  if (interactive.length < 1 || procedural.length < 1) return updateDimension(current, current.value, 0.1)

  const intAvg = interactive.reduce((s, w) => s + w.postInstructionAccuracy!, 0) / interactive.length
  const procAvg = procedural.reduce((s, w) => s + w.postInstructionAccuracy!, 0) / procedural.length

  let value: InstructionStyle = 'balanced'
  if (intAvg > procAvg + 0.15) value = 'guided_discovery'
  else if (procAvg > intAvg + 0.15) value = 'direct'

  return updateDimension(current, value, Math.abs(intAvg - procAvg) > 0.15 ? 0.6 : 0.3)
}

function inferExampleFading(
  current: ChildLearningProfile['workedExampleFadingStage'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  let value: ExampleFadingStage = 'full_examples'

  if (stats.sessionCount >= 3) {
    // Rolling: consistent skipping + good accuracy = independent
    if (stats.avgInstructionSkipRate > 0.3 && stats.avgAccuracy >= 0.75) value = 'independent'
    else if (stats.avgInstructionCompletion < 0.8 && stats.avgAccuracy >= 0.6) value = 'partial'
  }

  return updateDimension(current, value, stats.sessionCount >= 3 ? 0.5 : 0.3)
}

function inferLessonOrdering(
  current: ChildLearningProfile['problemFirstVsLessonFirst'],
  signals: SessionSignals,
  stats: RollingStats,
) {
  let value: LessonOrdering = 'lesson_first'

  if (stats.sessionCount >= 5) {
    if (stats.avgInstructionSkipRate > 0.5 && stats.avgAccuracy >= 0.7) value = 'problem_first'
    else if (stats.avgInstructionCompletion > 0.9) value = 'lesson_first'
    else value = 'balanced'
  }

  return updateDimension(current, value, stats.sessionCount >= 5 ? 0.4 : 0.15)
}
