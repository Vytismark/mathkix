// ============================================================
// Child Learning Profiler — Inference Engine
//
// Updates the child's learning profile after each session by
// analyzing behavioral signals. Each dimension has its own
// inference function. Updates are Bayesian-like:
//   - Early sessions: adopt signals readily
//   - Later sessions: require consistent signals to change
//   - Confidence grows with each observation
//   - Strong signals can override at any time
//
// All inference is SILENT — no questions to the child.
// ============================================================

import type {
  ChildLearningProfile,
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
} from '@/types/learning-profile'
import type { SessionSignals } from './profile-signals'
import type { Domain } from '@/types/quiz'
import { detectMisconceptions } from '@/data/misconceptions'

// ── Main entry point ─────────────────────────────────────────

export function updateProfile(
  current: ChildLearningProfile | null,
  signals: SessionSignals,
): ChildLearningProfile {
  const profile = current ?? createDefaultProfile()

  return {
    cognitiveStage: inferCognitiveStage(profile.cognitiveStage, signals),
    workingMemoryCapacity: inferWorkingMemory(profile.workingMemoryCapacity, signals),
    processingSpeed: inferProcessingSpeed(profile.processingSpeed, signals),
    mathAnxietyLevel: inferMathAnxiety(profile.mathAnxietyLevel, signals),

    misconceptionFlags: inferMisconceptions(profile.misconceptionFlags, signals),
    proceduralVsConceptual: inferProceduralConceptual(profile.proceduralVsConceptual, signals),

    representationPreference: inferRepresentationPref(profile.representationPreference, signals),
    exampleFirstVsRuleFirst: inferExampleRulePref(profile.exampleFirstVsRuleFirst, signals),
    craStageByDomain: inferCRAStage(profile.craStageByDomain, signals),

    motivationOrientation: inferMotivation(profile.motivationOrientation, signals),
    challengeTolerance: inferChallengeTolerance(profile.challengeTolerance, signals),
    mindsetIndicator: inferMindset(profile.mindsetIndicator, signals),

    errorTypeTendency: inferErrorType(profile.errorTypeTendency, signals),
    selfCorrectionAbility: inferSelfCorrection(profile.selfCorrectionAbility, signals),
    hintResponsiveness: inferHintResponsiveness(profile.hintResponsiveness, signals),
    responseLatencyPattern: inferLatencyPattern(profile.responseLatencyPattern, signals),

    masterySpeedByDomain: inferMasterySpeed(profile.masterySpeedByDomain, signals),
    interleavingPreference: inferInterleavingPref(profile.interleavingPreference, signals),

    wordProblemProficiency: inferWordProblemLevel(profile.wordProblemProficiency, signals),
    sessionFatiguePattern: inferFatiguePattern(profile.sessionFatiguePattern, signals),

    feedbackGranularity: inferFeedbackGranularity(profile.feedbackGranularity, signals),
    explanationDepth: inferExplanationDepth(profile.explanationDepth, signals),

    discoveryVsDirectInstruction: inferInstructionStyle(profile.discoveryVsDirectInstruction, signals),
    workedExampleFadingStage: inferExampleFading(profile.workedExampleFadingStage, signals),
    problemFirstVsLessonFirst: inferLessonOrdering(profile.problemFirstVsLessonFirst, signals),
  }
}

// ── 1. Learning Profile ──────────────────────────────────────

function inferCognitiveStage(
  current: ChildLearningProfile['cognitiveStage'],
  signals: SessionSignals,
) {
  const { errorPattern } = signals
  const abstractAcc = errorPattern.accuracyByAbstraction['abstract']
  const concreteAcc = errorPattern.accuracyByAbstraction['concrete']

  let value: CognitiveStage = 'concrete'
  let strength = 0.5

  if (abstractAcc !== undefined && abstractAcc >= 0.7) {
    value = 'formal'
    strength = 0.8
  } else if (abstractAcc !== undefined && abstractAcc >= 0.4) {
    value = 'transitional'
    strength = 0.6
  } else if (concreteAcc !== undefined && concreteAcc >= 0.7 && (abstractAcc === undefined || abstractAcc < 0.4)) {
    value = 'concrete'
    strength = 0.7
  }

  return updateDimension(current, value, strength)
}

function inferWorkingMemory(
  current: ChildLearningProfile['workingMemoryCapacity'],
  signals: SessionSignals,
) {
  const { errorPattern, responseTime } = signals
  const multiStepAcc = errorPattern.multiStepAccuracy

  let value: MemoryCapacity = 'medium'
  let strength = 0.4

  if (multiStepAcc !== null) {
    if (multiStepAcc >= 0.8) { value = 'high'; strength = 0.7 }
    else if (multiStepAcc < 0.4) { value = 'low'; strength = 0.7 }
    else { value = 'medium'; strength = 0.5 }
  }

  // Long response times on multi-step problems also indicate lower working memory
  if (responseTime.avgResponseMs > 25_000 && multiStepAcc !== null && multiStepAcc < 0.6) {
    value = 'low'
    strength = Math.max(strength, 0.6)
  }

  return updateDimension(current, value, strength)
}

function inferProcessingSpeed(
  current: ChildLearningProfile['processingSpeed'],
  signals: SessionSignals,
) {
  const { responseTime } = signals
  const avg = responseTime.avgResponseMs

  // Grade-adjusted norms (rough: 3rd grader ~15s, 5th grader ~10s)
  const grade = signals.context.gradeLevel
  const normMs = grade <= 3 ? 15_000 : grade <= 5 ? 12_000 : 10_000

  let value: ProcessingSpeedLevel
  if (avg < normMs * 0.7) value = 'fast'
  else if (avg > normMs * 1.5) value = 'slow'
  else value = 'moderate'

  return updateDimension(current, value, 0.6)
}

function inferMathAnxiety(
  current: ChildLearningProfile['mathAnxietyLevel'],
  signals: SessionSignals,
) {
  const { responseTime, engagement, errorPattern } = signals
  let anxietyScore = 0

  // Long pauses after errors indicate anxiety
  if (responseTime.postErrorResponseMs !== null && responseTime.postCorrectResponseMs !== null) {
    const pauseRatio = responseTime.postErrorResponseMs / responseTime.postCorrectResponseMs
    if (pauseRatio > 2.0) anxietyScore += 2
    else if (pauseRatio > 1.5) anxietyScore += 1
  }

  // Negative emoji reactions
  if (engagement.emojiNet < -2) anxietyScore += 2
  else if (engagement.emojiNet < 0) anxietyScore += 1

  // Avoidance: high hint rate without improvement
  if (engagement.hintRate > 0.5) anxietyScore += 1

  // Low accuracy despite slow speed (trying hard but failing)
  if (errorPattern.overallAccuracy < 0.4 && responseTime.avgResponseMs > 20_000) anxietyScore += 1

  let value: AnxietyLevel
  if (anxietyScore >= 4) value = 'high'
  else if (anxietyScore >= 2) value = 'moderate'
  else value = 'low'

  return updateDimension(current, value, Math.min(0.8, anxietyScore / 5))
}

// ── 2. Knowledge State ───────────────────────────────────────

function inferMisconceptions(
  current: ChildLearningProfile['misconceptionFlags'],
  signals: SessionSignals,
) {
  const detected = detectMisconceptions(signals.errorPattern.wrongAnswers)
  const newCodes = detected.map(m => m.code)

  // Remove misconceptions that haven't appeared in 5+ sessions
  const toRemove = current.value.filter(code =>
    !newCodes.includes(code) && current.dataPoints > 5
  )

  return updateArrayDimension(current, newCodes, toRemove, newCodes.length > 0 ? 0.8 : 0.3)
}

function inferProceduralConceptual(
  current: ChildLearningProfile['proceduralVsConceptual'],
  signals: SessionSignals,
) {
  const { errorPattern } = signals
  const proc = errorPattern.proceduralAccuracy
  const conc = errorPattern.conceptualAccuracy

  if (proc === null || conc === null) return updateDimension(current, current.value, 0.2)

  let value: ProceduralConceptualBalance
  const diff = proc - conc
  if (diff > 0.25) value = 'procedural_heavy'
  else if (diff < -0.25) value = 'conceptual_heavy'
  else value = 'balanced'

  return updateDimension(current, value, 0.6)
}

// ── 3. Learning Style & Modality ─────────────────────────────

function inferRepresentationPref(
  current: ChildLearningProfile['representationPreference'],
  signals: SessionSignals,
) {
  const { modality } = signals
  if (!modality.modalityUsed) return updateDimension(current, current.value, 0.1)

  // Map modality to representation preference
  const mapping: Record<string, RepresentationPref> = {
    'visual': 'visual',
    'interactive': 'visual',
    'story': 'verbal',
    'procedural': 'symbolic',
    'challenge': 'symbolic',
  }

  const pref = mapping[modality.modalityUsed] ?? 'visual'
  const success = modality.postInstructionAccuracy ?? 0.5
  const strength = success >= 0.7 ? 0.7 : 0.3

  return updateDimension(current, pref, strength)
}

function inferExampleRulePref(
  current: ChildLearningProfile['exampleFirstVsRuleFirst'],
  signals: SessionSignals,
) {
  const { modality } = signals
  if (!modality.modalityUsed || modality.postInstructionAccuracy === null) {
    return updateDimension(current, current.value, 0.1)
  }

  // Procedural = rule-first; Visual/Story = example-first
  const acc = modality.postInstructionAccuracy
  let value: ExampleRulePref = 'balanced'

  if (modality.modalityUsed === 'procedural' && acc >= 0.7) value = 'rule_first'
  else if ((modality.modalityUsed === 'visual' || modality.modalityUsed === 'story') && acc >= 0.7) value = 'example_first'

  return updateDimension(current, value, acc >= 0.7 ? 0.6 : 0.3)
}

function inferCRAStage(
  current: ChildLearningProfile['craStageByDomain'],
  signals: SessionSignals,
) {
  const { errorPattern, mastery } = signals
  let updated = current

  for (const domain of mastery.domainsPracticed) {
    const diffAccuracy = errorPattern.accuracyByDifficulty
    const hardAcc = diffAccuracy[3] ?? 0
    const medAcc = diffAccuracy[2] ?? 0
    const easyAcc = diffAccuracy[1] ?? 0

    let stage: CRAStage
    if (hardAcc >= 0.7) stage = 'abstract'
    else if (medAcc >= 0.6 || easyAcc >= 0.8) stage = 'representational'
    else stage = 'concrete'

    updated = updateDomainMapDimension(updated, domain, stage, 0.5)
  }

  return updated
}

// ── 4. Motivational & Engagement ─────────────────────────────

function inferMotivation(
  current: ChildLearningProfile['motivationOrientation'],
  signals: SessionSignals,
) {
  const { engagement } = signals

  // Extrinsic: high emoji reaction to XP/achievements, engagement tied to rewards
  // Intrinsic: uses AI teacher often (curious), high instruction completion
  let value: MotivationOrientation = 'mixed'

  if (engagement.aiTeacherUsageRate > 0.3 && engagement.instructionCompletionRate > 0.8) {
    value = 'intrinsic'
  } else if (engagement.emojiNet > 2 && engagement.instructionSkipRate > 0.3) {
    value = 'extrinsic'
  }

  return updateDimension(current, value, 0.4)
}

function inferChallengeTolerance(
  current: ChildLearningProfile['challengeTolerance'],
  signals: SessionSignals,
) {
  const { errorPattern, engagement } = signals

  let value: ChallengeTolerance = 'moderate'
  let strength = 0.5

  // High: persists through errors without hints
  if (errorPattern.maxErrorStreak >= 3 && engagement.hintRate < 0.2) {
    value = 'high'
    strength = 0.7
  }
  // Low: requests hints quickly after errors
  else if (engagement.hintRate > 0.5 && errorPattern.maxErrorStreak <= 1) {
    value = 'low'
    strength = 0.7
  }

  return updateDimension(current, value, strength)
}

function inferMindset(
  current: ChildLearningProfile['mindsetIndicator'],
  signals: SessionSignals,
) {
  const { responseTime, errorPattern } = signals

  let value: MindsetIndicator = 'neutral'

  // Growth: faster response after errors (eagerness to try again), improving accuracy
  if (responseTime.postErrorResponseMs !== null && responseTime.postCorrectResponseMs !== null) {
    const ratio = responseTime.postErrorResponseMs / responseTime.postCorrectResponseMs
    if (ratio < 1.2 && errorPattern.overallAccuracy >= 0.5) {
      value = 'growth_leaning'
    } else if (ratio > 2.0) {
      value = 'fixed_leaning'
    }
  }

  return updateDimension(current, value, 0.4)
}

// ── 5. Error & Response Patterns ─────────────────────────────

function inferErrorType(
  current: ChildLearningProfile['errorTypeTendency'],
  signals: SessionSignals,
) {
  const { errorPattern, responseTime } = signals
  if (errorPattern.wrongAnswers.length < 2) return updateDimension(current, current.value, 0.1)

  // Careless: fast responses + close-to-correct answers (off by 1, digit swap)
  // Conceptual: wrong method entirely
  // Reading: correct on bare numbers, fails on word problems
  let value: ErrorTypeTendency = 'mixed'
  let strength = 0.5

  if (errorPattern.bareNumberAccuracy !== null && errorPattern.wordProblemAccuracy !== null) {
    const gap = errorPattern.bareNumberAccuracy - errorPattern.wordProblemAccuracy
    if (gap > 0.3) { value = 'reading'; strength = 0.7 }
  }

  if (value === 'mixed' && responseTime.avgResponseMs < 8_000 && errorPattern.overallAccuracy < 0.7) {
    value = 'careless'
    strength = 0.6
  }

  if (value === 'mixed' && errorPattern.overallAccuracy < 0.5 && responseTime.avgResponseMs > 15_000) {
    value = 'conceptual'
    strength = 0.6
  }

  return updateDimension(current, value, strength)
}

function inferSelfCorrection(
  current: ChildLearningProfile['selfCorrectionAbility'],
  signals: SessionSignals,
) {
  const { engagement, errorPattern } = signals

  let value: SelfCorrectionAbility = 'moderate'

  // Self-sufficient: low hint rate + decent accuracy
  if (engagement.hintRate < 0.1 && errorPattern.overallAccuracy >= 0.7) {
    value = 'high'
  }
  // Needs help: high hint rate
  else if (engagement.hintRate > 0.4) {
    value = 'low'
  }

  return updateDimension(current, value, 0.5)
}

function inferHintResponsiveness(
  current: ChildLearningProfile['hintResponsiveness'],
  signals: SessionSignals,
) {
  const { engagement, errorPattern } = signals

  let value: HintResponsiveness = 'benefits_from_nudge'

  if (engagement.hintRate < 0.1 && errorPattern.overallAccuracy >= 0.7) {
    value = 'self_sufficient'
  } else if (engagement.hintRate > 0.3 && errorPattern.overallAccuracy < 0.5) {
    value = 'needs_full_scaffold'
  }

  return updateDimension(current, value, 0.5)
}

function inferLatencyPattern(
  current: ChildLearningProfile['responseLatencyPattern'],
  signals: SessionSignals,
) {
  const { responseTime, errorPattern } = signals
  const avg = responseTime.avgResponseMs
  const acc = errorPattern.overallAccuracy

  let value: ResponseLatencyPattern = 'variable'

  if (avg < 10_000 && acc >= 0.8) value = 'fast_right'
  else if (avg < 10_000 && acc < 0.5) value = 'fast_wrong'
  else if (avg > 18_000 && acc >= 0.6) value = 'slow_careful'

  return updateDimension(current, value, 0.6)
}

// ── 6. Pacing & Progression ─────────────────────────────────

function inferMasterySpeed(
  current: ChildLearningProfile['masterySpeedByDomain'],
  signals: SessionSignals,
) {
  let updated = current

  for (const domain of signals.mastery.domainsPracticed) {
    const acc = signals.mastery.domainAccuracy[domain]
    if (acc === undefined) continue

    // Rough heuristic: high accuracy = fast learner in this domain
    let speed: MasterySpeed
    if (acc >= 0.85) speed = 'fast'
    else if (acc < 0.5) speed = 'slow'
    else speed = 'average'

    updated = updateDomainMapDimension(updated, domain, speed, 0.4)
  }

  return updated
}

function inferInterleavingPref(
  current: ChildLearningProfile['interleavingPreference'],
  signals: SessionSignals,
) {
  const { mastery, errorPattern } = signals

  // Can only infer if we have enough sessions to compare
  if (current.dataPoints < 3) return updateDimension(current, current.value, 0.2)

  let value: InterleavingPref = 'balanced'

  if (mastery.wasInterleaved && errorPattern.overallAccuracy >= 0.7) {
    value = 'interleaved'
  } else if (!mastery.wasInterleaved && errorPattern.overallAccuracy >= 0.7) {
    value = 'focused_blocks'
  }

  return updateDimension(current, value, 0.4)
}

// ── 7. Contextual Factors ────────────────────────────────────

function inferWordProblemLevel(
  current: ChildLearningProfile['wordProblemProficiency'],
  signals: SessionSignals,
) {
  const wp = signals.errorPattern.wordProblemAccuracy
  if (wp === null) return updateDimension(current, current.value, 0.1)

  let value: WordProblemLevel
  if (wp >= 0.75) value = 'strong'
  else if (wp >= 0.5) value = 'adequate'
  else value = 'struggles'

  return updateDimension(current, value, 0.6)
}

function inferFatiguePattern(
  current: ChildLearningProfile['sessionFatiguePattern'],
  signals: SessionSignals,
) {
  const { fatigue } = signals
  if (fatigue.sessionMinutes < 2) return updateDimension(current, current.value, 0.1)

  let value: FatiguePattern = 'consistent'

  const earlyVsLate = fatigue.earlyAccuracy - fatigue.lateAccuracy
  if (earlyVsLate > 0.25 && fatigue.speedDecayRatio > 1.3) {
    value = fatigue.earlyAccuracy > fatigue.midAccuracy ? 'early_decay' : 'late_decay'
  }

  return updateDimension(current, value, 0.5)
}

// ── 8. Scaffolding & Feedback ────────────────────────────────

function inferFeedbackGranularity(
  current: ChildLearningProfile['feedbackGranularity'],
  signals: SessionSignals,
) {
  const { engagement, errorPattern } = signals
  const grade = signals.context.gradeLevel

  let value: FeedbackGranularity = 'balanced'

  // Younger kids or those with high hint usage need immediate feedback
  if (grade <= 3 || engagement.hintRate > 0.4) {
    value = 'immediate_needed'
  }
  // Older kids with high accuracy can handle delayed
  else if (grade >= 5 && errorPattern.overallAccuracy >= 0.8 && engagement.hintRate < 0.1) {
    value = 'delayed_ok'
  }

  return updateDimension(current, value, 0.4)
}

function inferExplanationDepth(
  current: ChildLearningProfile['explanationDepth'],
  signals: SessionSignals,
) {
  const { engagement } = signals

  let value: ExplanationDepth = 'moderate'

  if (engagement.aiTeacherUsageRate > 0.5) value = 'detailed'
  else if (engagement.instructionSkipRate > 0.4 && engagement.aiTeacherUsageRate < 0.1) value = 'brief'

  return updateDimension(current, value, 0.5)
}

// ── 9. Lesson Structure ──────────────────────────────────────

function inferInstructionStyle(
  current: ChildLearningProfile['discoveryVsDirectInstruction'],
  signals: SessionSignals,
) {
  const { modality } = signals
  if (!modality.modalityUsed || modality.postInstructionAccuracy === null) {
    return updateDimension(current, current.value, 0.1)
  }

  let value: InstructionStyle = 'balanced'

  if (modality.modalityUsed === 'interactive' && modality.postInstructionAccuracy >= 0.7) {
    value = 'guided_discovery'
  } else if (modality.modalityUsed === 'procedural' && modality.postInstructionAccuracy >= 0.7) {
    value = 'direct'
  }

  return updateDimension(current, value, modality.postInstructionAccuracy >= 0.7 ? 0.6 : 0.3)
}

function inferExampleFading(
  current: ChildLearningProfile['workedExampleFadingStage'],
  signals: SessionSignals,
) {
  const { engagement, errorPattern } = signals

  let value: ExampleFadingStage = 'full_examples'

  // If child skips instruction and still gets good accuracy → independent
  if (engagement.instructionSkipRate > 0.3 && errorPattern.overallAccuracy >= 0.75) {
    value = 'independent'
  }
  // Moderate skip rate + decent accuracy → partial
  else if (engagement.instructionCompletionRate < 0.8 && errorPattern.overallAccuracy >= 0.6) {
    value = 'partial'
  }

  return updateDimension(current, value, 0.5)
}

function inferLessonOrdering(
  current: ChildLearningProfile['problemFirstVsLessonFirst'],
  signals: SessionSignals,
) {
  // This requires comparing performance across sessions with different orderings.
  // For now, use a proxy: if child performs well despite skipping instruction, they
  // might benefit from problem-first (productive failure model).
  const { engagement, errorPattern } = signals

  let value: LessonOrdering = 'lesson_first'

  if (engagement.instructionSkipRate > 0.5 && errorPattern.overallAccuracy >= 0.7) {
    value = 'problem_first'
  } else if (engagement.instructionCompletionRate > 0.9) {
    value = 'lesson_first'
  } else {
    value = 'balanced'
  }

  return updateDimension(current, value, 0.3)
}
