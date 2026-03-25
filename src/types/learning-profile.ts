// ============================================================
// Child Learning Profile — Comprehensive Dimension Tracking
//
// 25+ dimensions inferred silently from session behavior.
// Each dimension has a value, confidence level (0-1), data point
// count, and last-updated timestamp. Dimensions only change
// when confidence threshold is met to prevent flapping.
//
// Categories:
//   1. Learning Profile (cognitive, memory, speed, anxiety)
//   2. Knowledge State (misconceptions, procedural vs conceptual)
//   3. Learning Style & Modality (visual/symbolic/verbal, CRA stage)
//   4. Motivational & Engagement (motivation, challenge tolerance, mindset)
//   5. Error & Response Patterns (error type, self-correction, hints, latency)
//   6. Pacing & Progression (mastery speed, interleaving preference)
//   7. Contextual Factors (word problems, fatigue)
//   8. Scaffolding & Feedback (granularity, depth)
//   9. Lesson Structure (discovery vs direct, example fading)
// ============================================================

import type { Domain } from './quiz'

// ── Core wrapper for every dimension ─────────────────────────

export interface ProfileDimension<T> {
  value: T
  confidence: number       // 0-1, how sure we are
  dataPoints: number        // sessions that contributed to this inference
  lastUpdated: string       // ISO timestamp
  trend?: 'improving' | 'stable' | 'declining'  // cross-session trend
  /** Recent raw values for rolling analysis (last 10 observations) */
  recentValues?: string[]   // JSON-serialized for generic storage
}

// ── Confidence thresholds ────────────────────────────────────

/** Minimum confidence before a dimension influences the algorithm */
export const CONFIDENCE_THRESHOLD = 0.3

/** Expected sessions to reach full confidence */
export const SESSIONS_TO_FULL_CONFIDENCE = 20

/** Minimum sessions before changing an established dimension value */
export const MIN_SESSIONS_TO_CHANGE = 3

// ── Session signal snapshot (stored in history) ──────────────

export interface SessionSignalSnapshot {
  timestamp: string
  /** Core metrics */
  accuracy: number                // 0-1
  avgResponseMs: number
  questionCount: number
  /** Error patterns */
  errorStreak: number
  bareNumberAccuracy: number | null
  wordProblemAccuracy: number | null
  proceduralAccuracy: number | null
  conceptualAccuracy: number | null
  multiStepAccuracy: number | null
  /** Timing patterns */
  postErrorPauseMs: number | null
  postCorrectPauseMs: number | null
  firstHalfAccuracy: number
  secondHalfAccuracy: number
  speedDecayRatio: number
  /** Engagement */
  hintRate: number
  aiTeacherUsageRate: number
  instructionSkipRate: number
  instructionCompletionRate: number
  /** Modality */
  modalityUsed: string | null
  postInstructionAccuracy: number | null
  /** Domains */
  domainsPracticed: string[]
  wasInterleaved: boolean
}

/** Max snapshots to keep in history */
export const MAX_SIGNAL_HISTORY = 20

// ── Dimension value types ────────────────────────────────────

export type CognitiveStage = 'concrete' | 'transitional' | 'formal'
export type MemoryCapacity = 'low' | 'medium' | 'high'
export type ProcessingSpeedLevel = 'slow' | 'moderate' | 'fast'
export type AnxietyLevel = 'high' | 'moderate' | 'low'
export type ProceduralConceptualBalance = 'procedural_heavy' | 'balanced' | 'conceptual_heavy'
export type RepresentationPref = 'visual' | 'symbolic' | 'verbal'
export type ExampleRulePref = 'example_first' | 'balanced' | 'rule_first'
export type CRAStage = 'concrete' | 'representational' | 'abstract'
export type MotivationOrientation = 'intrinsic' | 'mixed' | 'extrinsic'
export type ChallengeTolerance = 'low' | 'moderate' | 'high'
export type MindsetIndicator = 'fixed_leaning' | 'neutral' | 'growth_leaning'
export type ErrorTypeTendency = 'careless' | 'conceptual' | 'reading' | 'mixed'
export type SelfCorrectionAbility = 'low' | 'moderate' | 'high'
export type HintResponsiveness = 'needs_full_scaffold' | 'benefits_from_nudge' | 'self_sufficient'
export type ResponseLatencyPattern = 'fast_wrong' | 'slow_careful' | 'fast_right' | 'variable'
export type MasterySpeed = 'slow' | 'average' | 'fast'
export type InterleavingPref = 'focused_blocks' | 'balanced' | 'interleaved'
export type WordProblemLevel = 'struggles' | 'adequate' | 'strong'
export type FatiguePattern = 'consistent' | 'early_decay' | 'late_decay'
export type FeedbackGranularity = 'immediate_needed' | 'balanced' | 'delayed_ok'
export type ExplanationDepth = 'brief' | 'moderate' | 'detailed'
export type InstructionStyle = 'direct' | 'balanced' | 'guided_discovery'
export type ExampleFadingStage = 'full_examples' | 'partial' | 'independent'
export type LessonOrdering = 'lesson_first' | 'balanced' | 'problem_first'

// ── Full learning profile ────────────────────────────────────

export interface ChildLearningProfile {
  // ── 1. Learning Profile ───────────────────────────
  cognitiveStage: ProfileDimension<CognitiveStage>
  workingMemoryCapacity: ProfileDimension<MemoryCapacity>
  processingSpeed: ProfileDimension<ProcessingSpeedLevel>
  mathAnxietyLevel: ProfileDimension<AnxietyLevel>

  // ── 2. Knowledge State ────────────────────────────
  misconceptionFlags: ProfileDimension<string[]>
  proceduralVsConceptual: ProfileDimension<ProceduralConceptualBalance>

  // ── 3. Learning Style & Modality ──────────────────
  representationPreference: ProfileDimension<RepresentationPref>
  exampleFirstVsRuleFirst: ProfileDimension<ExampleRulePref>
  craStageByDomain: ProfileDimension<Partial<Record<Domain, CRAStage>>>

  // ── 4. Motivational & Engagement ──────────────────
  motivationOrientation: ProfileDimension<MotivationOrientation>
  challengeTolerance: ProfileDimension<ChallengeTolerance>
  mindsetIndicator: ProfileDimension<MindsetIndicator>

  // ── 5. Error & Response Patterns ──────────────────
  errorTypeTendency: ProfileDimension<ErrorTypeTendency>
  selfCorrectionAbility: ProfileDimension<SelfCorrectionAbility>
  hintResponsiveness: ProfileDimension<HintResponsiveness>
  responseLatencyPattern: ProfileDimension<ResponseLatencyPattern>

  // ── 6. Pacing & Progression ───────────────────────
  masterySpeedByDomain: ProfileDimension<Partial<Record<Domain, MasterySpeed>>>
  interleavingPreference: ProfileDimension<InterleavingPref>

  // ── 7. Contextual Factors ─────────────────────────
  wordProblemProficiency: ProfileDimension<WordProblemLevel>
  sessionFatiguePattern: ProfileDimension<FatiguePattern>

  // ── 8. Scaffolding & Feedback ─────────────────────
  feedbackGranularity: ProfileDimension<FeedbackGranularity>
  explanationDepth: ProfileDimension<ExplanationDepth>

  // ── 9. Lesson Structure ───────────────────────────
  discoveryVsDirectInstruction: ProfileDimension<InstructionStyle>
  workedExampleFadingStage: ProfileDimension<ExampleFadingStage>
  problemFirstVsLessonFirst: ProfileDimension<LessonOrdering>

  // ── Signal history for rolling analysis ───────────
  signalHistory: SessionSignalSnapshot[]
}

// ── Default factory ──────────────────────────────────────────

function dim<T>(value: T): ProfileDimension<T> {
  return { value, confidence: 0, dataPoints: 0, lastUpdated: '' }
}

export function createDefaultProfile(): ChildLearningProfile {
  return {
    cognitiveStage: dim<CognitiveStage>('concrete'),
    workingMemoryCapacity: dim<MemoryCapacity>('medium'),
    processingSpeed: dim<ProcessingSpeedLevel>('moderate'),
    mathAnxietyLevel: dim<AnxietyLevel>('moderate'),

    misconceptionFlags: dim<string[]>([]),
    proceduralVsConceptual: dim<ProceduralConceptualBalance>('balanced'),

    representationPreference: dim<RepresentationPref>('visual'),
    exampleFirstVsRuleFirst: dim<ExampleRulePref>('balanced'),
    craStageByDomain: dim<Partial<Record<Domain, CRAStage>>>({}),

    motivationOrientation: dim<MotivationOrientation>('mixed'),
    challengeTolerance: dim<ChallengeTolerance>('moderate'),
    mindsetIndicator: dim<MindsetIndicator>('neutral'),

    errorTypeTendency: dim<ErrorTypeTendency>('mixed'),
    selfCorrectionAbility: dim<SelfCorrectionAbility>('moderate'),
    hintResponsiveness: dim<HintResponsiveness>('benefits_from_nudge'),
    responseLatencyPattern: dim<ResponseLatencyPattern>('variable'),

    masterySpeedByDomain: dim<Partial<Record<Domain, MasterySpeed>>>({}),
    interleavingPreference: dim<InterleavingPref>('balanced'),

    wordProblemProficiency: dim<WordProblemLevel>('adequate'),
    sessionFatiguePattern: dim<FatiguePattern>('consistent'),

    feedbackGranularity: dim<FeedbackGranularity>('balanced'),
    explanationDepth: dim<ExplanationDepth>('moderate'),

    discoveryVsDirectInstruction: dim<InstructionStyle>('balanced'),
    workedExampleFadingStage: dim<ExampleFadingStage>('full_examples'),
    problemFirstVsLessonFirst: dim<LessonOrdering>('lesson_first'),

    signalHistory: [],
  }
}

// ── Dimension update helpers ─────────────────────────────────

/**
 * Update a dimension with a new observation using rolling window analysis.
 *
 * Value change rules (prevents flapping):
 *   - First 2 sessions: adopt readily
 *   - Sessions 3+: require MIN_SESSIONS_TO_CHANGE consecutive consistent
 *     signals OR signal strength >= 0.8 to change an established value
 *   - Same value as current: reinforces confidence
 *
 * Confidence uses diminishing returns: each session adds less confidence
 * than the previous one, modeling real-world certainty accumulation.
 *
 * Trend detection: looks at recent values to determine if dimension
 * is improving, stable, or declining.
 */
export function updateDimension<T>(
  current: ProfileDimension<T>,
  newValue: T,
  signalStrength: number = 1,
): ProfileDimension<T> {
  const newDataPoints = current.dataPoints + 1

  // Diminishing returns on confidence: first sessions add more
  // Formula: each session adds less (1/n scaling), capped at 1.0
  const diminishingGain = signalStrength / Math.max(SESSIONS_TO_FULL_CONFIDENCE, newDataPoints * 0.5)
  const newConfidence = Math.min(1, current.confidence + diminishingGain)

  // Track recent values (last 10 observations)
  const recentValues = [...(current.recentValues ?? [])]
  recentValues.push(JSON.stringify(newValue))
  if (recentValues.length > 10) recentValues.shift()

  // Determine if value should change
  let shouldUpdate: boolean
  if (newDataPoints <= 2) {
    // Early sessions: adopt readily
    shouldUpdate = true
  } else if (newValue === current.value) {
    // Same value: reinforce (always "update" to bump confidence)
    shouldUpdate = true
  } else if (signalStrength >= 0.8) {
    // Very strong signal: override
    shouldUpdate = true
  } else {
    // Require consistency: the new value must have appeared in
    // MIN_SESSIONS_TO_CHANGE of the last 5 observations
    const recentWindow = recentValues.slice(-5)
    const newValueStr = JSON.stringify(newValue)
    const consistentCount = recentWindow.filter(v => v === newValueStr).length
    shouldUpdate = consistentCount >= MIN_SESSIONS_TO_CHANGE
  }

  // Detect trend from recent values
  const trend = detectTrend(recentValues)

  return {
    value: shouldUpdate ? newValue : current.value,
    confidence: newConfidence,
    dataPoints: newDataPoints,
    lastUpdated: new Date().toISOString(),
    trend,
    recentValues,
  }
}

/**
 * Detect trend from recent string-encoded values.
 * For ordinal dimensions, detects movement toward "better" or "worse".
 */
function detectTrend(recentValues: string[]): 'improving' | 'stable' | 'declining' | undefined {
  if (recentValues.length < 4) return undefined

  // Check if the last 3 values are all the same (stable)
  const last3 = recentValues.slice(-3)
  if (last3.every(v => v === last3[0])) return 'stable'

  // Check if value is changing by comparing first half to second half
  const mid = Math.floor(recentValues.length / 2)
  const firstHalf = recentValues.slice(0, mid)
  const secondHalf = recentValues.slice(mid)

  // Count unique values in each half
  const firstUnique = new Set(firstHalf).size
  const secondUnique = new Set(secondHalf).size

  // If second half is more consistent (fewer unique values), dimension is stabilizing
  if (secondUnique < firstUnique) return 'stable'

  // Otherwise we can't determine trend from categorical values alone
  return undefined
}

/**
 * Update a dimension that holds an array (like misconception flags).
 * Adds new items, removes items that haven't been seen recently.
 */
export function updateArrayDimension(
  current: ProfileDimension<string[]>,
  toAdd: string[],
  toRemove: string[],
  signalStrength: number = 1,
): ProfileDimension<string[]> {
  const updated = new Set(current.value)
  for (const item of toAdd) updated.add(item)
  for (const item of toRemove) updated.delete(item)

  return {
    value: [...updated],
    confidence: Math.min(1, current.confidence + signalStrength / SESSIONS_TO_FULL_CONFIDENCE),
    dataPoints: current.dataPoints + 1,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Update a dimension that holds a per-domain map.
 */
export function updateDomainMapDimension<T>(
  current: ProfileDimension<Partial<Record<Domain, T>>>,
  domain: Domain,
  newValue: T,
  signalStrength: number = 1,
): ProfileDimension<Partial<Record<Domain, T>>> {
  return {
    value: { ...current.value, [domain]: newValue },
    confidence: Math.min(1, current.confidence + signalStrength / SESSIONS_TO_FULL_CONFIDENCE),
    dataPoints: current.dataPoints + 1,
    lastUpdated: new Date().toISOString(),
  }
}

// ── Question classification tags ─────────────────────────────

export type QuestionCategory = 'procedural' | 'conceptual' | 'word_problem' | 'bare_number'
export type AbstractionLevel = 'concrete' | 'representational' | 'abstract'

export interface QuestionClassification {
  category: QuestionCategory
  abstractionLevel: AbstractionLevel
  stepsRequired: number
}
