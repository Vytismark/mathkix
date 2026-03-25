// ============================================================
// Profiler Test Script — Simulates 20 child archetypes
//
// Run: npx tsx scripts/test-profiler.ts
//
// Each archetype goes through 10 simulated sessions to verify
// that the profiler converges to the expected profile.
// ============================================================

import { updateProfile } from '../src/lib/adaptive/profiler'
import { createDefaultProfile, type ChildLearningProfile } from '../src/types/learning-profile'
import type { SessionSignals } from '../src/lib/adaptive/profile-signals'
import type { Domain } from '../src/types/quiz'

// ── Test harness ─────────────────────────────────────────────

interface Archetype {
  name: string
  description: string
  expectedTraits: Record<string, string>
  generateSession: (sessionNum: number) => SessionSignals
}

function runArchetype(arch: Archetype, sessions: number = 10): {
  name: string
  profile: ChildLearningProfile
  matches: number
  mismatches: string[]
} {
  let profile: ChildLearningProfile | null = null

  for (let i = 0; i < sessions; i++) {
    const signals = arch.generateSession(i)
    profile = updateProfile(profile, signals)
  }

  const final = profile!
  const mismatches: string[] = []
  let matches = 0

  for (const [key, expected] of Object.entries(arch.expectedTraits)) {
    const dim = (final as Record<string, { value?: unknown }>)[key]
    const actual = dim?.value
    const actualStr = JSON.stringify(actual)
    const expectedStr = expected

    if (actualStr === `"${expectedStr}"` || actualStr === expectedStr) {
      matches++
    } else {
      mismatches.push(`  ${key}: expected "${expectedStr}" got ${actualStr} (conf: ${(dim as { confidence?: number })?.confidence?.toFixed(2)})`)
    }
  }

  return { name: arch.name, profile: final, matches, mismatches }
}

// ── Signal generators ────────────────────────────────────────

function baseContext(grade: number = 3): SessionSignals['context'] {
  return {
    childId: 'test-child',
    sessionId: `session-${Date.now()}`,
    gradeLevel: grade,
    totalTimeMs: 180_000,
    isSegmented: true,
    hintRequestCount: 0,
    instructionSkipCount: 0,
    instructionStepsViewed: 4,
    instructionStepsTotal: 5,
    aiTeacherMessages: 0,
  }
}

function makeSignals(overrides: {
  accuracy?: number
  avgResponseMs?: number
  postErrorMs?: number | null
  postCorrectMs?: number | null
  hintRate?: number
  maxErrorStreak?: number
  bareNumberAcc?: number | null
  wordProblemAcc?: number | null
  proceduralAcc?: number | null
  conceptualAcc?: number | null
  multiStepAcc?: number | null
  firstHalfAcc?: number
  secondHalfAcc?: number
  speedDecay?: number
  instructionSkipRate?: number
  instructionCompletion?: number
  aiTeacherUsage?: number
  modalityUsed?: string | null
  postInstructionAcc?: number | null
  domains?: Domain[]
  wasInterleaved?: boolean
  grade?: number
  abstractAcc?: number
  concreteAcc?: number
  difficulty1Acc?: number
  difficulty2Acc?: number
  difficulty3Acc?: number
}): SessionSignals {
  const acc = overrides.accuracy ?? 0.7
  const avgMs = overrides.avgResponseMs ?? 12000
  const domains = overrides.domains ?? ['OA' as Domain]

  return {
    responseTime: {
      responseTimes: Array(8).fill(avgMs),
      avgResponseMs: avgMs,
      medianResponseMs: avgMs,
      trendSlope: 0,
      postErrorResponseMs: overrides.postErrorMs ?? null,
      postCorrectResponseMs: overrides.postCorrectMs ?? null,
      firstHalfAvgMs: avgMs,
      secondHalfAvgMs: avgMs * (overrides.speedDecay ?? 1),
    },
    errorPattern: {
      overallAccuracy: acc,
      bareNumberAccuracy: overrides.bareNumberAcc ?? null,
      wordProblemAccuracy: overrides.wordProblemAcc ?? null,
      proceduralAccuracy: overrides.proceduralAcc ?? null,
      conceptualAccuracy: overrides.conceptualAcc ?? null,
      accuracyByDifficulty: {
        1: overrides.difficulty1Acc ?? acc + 0.1,
        2: overrides.difficulty2Acc ?? acc,
        3: overrides.difficulty3Acc ?? acc - 0.1,
      },
      accuracyByAbstraction: {
        ...(overrides.concreteAcc !== undefined ? { concrete: overrides.concreteAcc } : {}),
        ...(overrides.abstractAcc !== undefined ? { abstract: overrides.abstractAcc } : {}),
      },
      wrongAnswers: [],
      maxErrorStreak: overrides.maxErrorStreak ?? 1,
      multiStepAccuracy: overrides.multiStepAcc ?? null,
    },
    engagement: {
      hintRate: overrides.hintRate ?? 0,
      instructionSkipRate: overrides.instructionSkipRate ?? 0,
      instructionCompletionRate: overrides.instructionCompletion ?? 1,
      aiTeacherUsageRate: overrides.aiTeacherUsage ?? 0,
      paceRatio: 1,
    },
    mastery: {
      domainsPracticed: domains,
      domainAccuracy: Object.fromEntries(domains.map(d => [d, acc])) as Partial<Record<Domain, number>>,
      wasInterleaved: overrides.wasInterleaved ?? false,
      standardsAttempted: ['3.OA.1'],
    },
    fatigue: {
      earlyAccuracy: overrides.firstHalfAcc ?? acc,
      midAccuracy: acc,
      lateAccuracy: overrides.secondHalfAcc ?? acc,
      speedDecayRatio: overrides.speedDecay ?? 1,
      sessionMinutes: 5,
    },
    modality: {
      modalityUsed: overrides.modalityUsed ?? null,
      postInstructionAccuracy: overrides.postInstructionAcc ?? null,
    },
    context: {
      ...baseContext(overrides.grade ?? 3),
      hintRequestCount: Math.round((overrides.hintRate ?? 0) * 8),
      instructionSkipCount: (overrides.instructionSkipRate ?? 0) > 0 ? 1 : 0,
      instructionStepsViewed: Math.round((overrides.instructionCompletion ?? 1) * 5),
      aiTeacherMessages: Math.round((overrides.aiTeacherUsage ?? 0) * 8),
    },
  }
}

// ── 20 Archetypes ────────────────────────────────────────────

const archetypes: Archetype[] = [
  // 1. Anxious slow learner
  {
    name: '1. Anxious Slow Learner',
    description: 'Long pauses after errors, high hint rate, low accuracy, slow',
    expectedTraits: {
      mathAnxietyLevel: 'high',
      processingSpeed: 'slow',
      hintResponsiveness: 'needs_full_scaffold',
      challengeTolerance: 'low',
    },
    generateSession: () => makeSignals({
      accuracy: 0.35, avgResponseMs: 25000, postErrorMs: 35000, postCorrectMs: 12000,
      hintRate: 0.6, maxErrorStreak: 4,
    }),
  },

  // 2. Fast careless kid
  {
    name: '2. Fast Careless Kid',
    description: 'Very fast responses, decent knowledge but makes silly mistakes',
    expectedTraits: {
      processingSpeed: 'fast',
      errorTypeTendency: 'careless',
      responseLatencyPattern: 'fast_wrong',
      // challengeTolerance stays moderate — low error streak + low accuracy isn't "high tolerance"
    },
    generateSession: () => makeSignals({
      accuracy: 0.55, avgResponseMs: 5000, maxErrorStreak: 2, hintRate: 0.05,
      bareNumberAcc: 0.6, wordProblemAcc: 0.5,
    }),
  },

  // 3. Gifted fast learner
  {
    name: '3. Gifted Fast Learner',
    description: 'Fast, accurate, skips instruction, self-sufficient',
    expectedTraits: {
      processingSpeed: 'fast',
      responseLatencyPattern: 'fast_right',
      workedExampleFadingStage: 'independent',
      selfCorrectionAbility: 'high',
      hintResponsiveness: 'self_sufficient',
      explanationDepth: 'brief',
    },
    generateSession: () => makeSignals({
      accuracy: 0.92, avgResponseMs: 6000, hintRate: 0, instructionSkipRate: 0.5,
      instructionCompletion: 0.4, aiTeacherUsage: 0,
    }),
  },

  // 4. Curious explorer
  {
    name: '4. Curious Explorer',
    description: 'Uses AI teacher heavily, reads all instruction, intrinsic motivation',
    expectedTraits: {
      motivationOrientation: 'intrinsic',
      explanationDepth: 'detailed',
    },
    generateSession: () => makeSignals({
      accuracy: 0.7, avgResponseMs: 15000, aiTeacherUsage: 0.6,
      instructionCompletion: 1.0, instructionSkipRate: 0, hintRate: 0.1,
    }),
  },

  // 5. Word problem struggler
  {
    name: '5. Word Problem Struggler',
    description: 'Good at bare numbers, fails word problems',
    expectedTraits: {
      wordProblemProficiency: 'struggles',
      errorTypeTendency: 'reading',
    },
    generateSession: () => makeSignals({
      accuracy: 0.6, bareNumberAcc: 0.9, wordProblemAcc: 0.3,
    }),
  },

  // 6. Conceptual thinker
  {
    name: '6. Conceptual Thinker (weak procedures)',
    description: 'Understands why but struggles with execution',
    expectedTraits: {
      proceduralVsConceptual: 'conceptual_heavy',
    },
    generateSession: () => makeSignals({
      accuracy: 0.6, proceduralAcc: 0.4, conceptualAcc: 0.85,
    }),
  },

  // 7. Procedural robot
  {
    name: '7. Procedural Robot (weak concepts)',
    description: 'Can execute algorithms but doesn\'t understand why',
    expectedTraits: {
      proceduralVsConceptual: 'procedural_heavy',
    },
    generateSession: () => makeSignals({
      accuracy: 0.65, proceduralAcc: 0.9, conceptualAcc: 0.35,
    }),
  },

  // 8. Fatigues early
  {
    name: '8. Early Fatigue Kid',
    description: 'Starts strong, accuracy drops in second half',
    expectedTraits: {
      sessionFatiguePattern: 'late_decay',
    },
    generateSession: () => makeSignals({
      accuracy: 0.6, firstHalfAcc: 0.85, secondHalfAcc: 0.4, speedDecay: 1.5,
    }),
  },

  // 9. Growth mindset kid
  {
    name: '9. Growth Mindset Kid',
    description: 'Quick to retry after errors, accuracy improving',
    expectedTraits: {
      mindsetIndicator: 'growth_leaning',
    },
    generateSession: (i) => makeSignals({
      accuracy: 0.5 + i * 0.04, // improving each session
      postErrorMs: 8000, postCorrectMs: 7000, // barely pauses after errors
      maxErrorStreak: 3, hintRate: 0.1,
    }),
  },

  // 10. Fixed mindset kid
  {
    name: '10. Fixed Mindset Kid',
    description: 'Long pauses after errors, accuracy flat or declining',
    expectedTraits: {
      mindsetIndicator: 'fixed_leaning',
    },
    generateSession: (i) => makeSignals({
      accuracy: 0.5 - i * 0.01, // slightly declining
      postErrorMs: 30000, postCorrectMs: 10000, // huge pause after errors
      maxErrorStreak: 2,
    }),
  },

  // 11. Visual learner
  {
    name: '11. Visual Learner',
    description: 'Performs best with visual modality',
    expectedTraits: {
      representationPreference: 'visual',
    },
    generateSession: (i) => makeSignals({
      accuracy: 0.7,
      modalityUsed: i % 3 === 0 ? 'visual' : i % 3 === 1 ? 'procedural' : 'story',
      postInstructionAcc: i % 3 === 0 ? 0.9 : i % 3 === 1 ? 0.5 : 0.6,
    }),
  },

  // 12. Rule-first learner
  {
    name: '12. Rule-First Learner',
    description: 'Prefers procedural modality over examples',
    expectedTraits: {
      exampleFirstVsRuleFirst: 'rule_first',
    },
    generateSession: (i) => makeSignals({
      accuracy: 0.7,
      modalityUsed: i % 2 === 0 ? 'procedural' : 'visual',
      postInstructionAcc: i % 2 === 0 ? 0.9 : 0.5,
    }),
  },

  // 13. Concrete-stage learner
  {
    name: '13. Concrete Stage Learner',
    description: 'Good at easy/concrete, fails abstract',
    expectedTraits: {
      cognitiveStage: 'concrete',
    },
    generateSession: () => makeSignals({
      accuracy: 0.55, concreteAcc: 0.85, abstractAcc: 0.2,
      difficulty1Acc: 0.9, difficulty2Acc: 0.5, difficulty3Acc: 0.1,
    }),
  },

  // 14. Formal-stage advanced kid
  {
    name: '14. Formal Stage Advanced Kid',
    description: 'Handles abstract and hard problems well',
    expectedTraits: {
      cognitiveStage: 'formal',
    },
    generateSession: () => makeSignals({
      accuracy: 0.85, concreteAcc: 0.9, abstractAcc: 0.8,
      difficulty1Acc: 0.95, difficulty2Acc: 0.85, difficulty3Acc: 0.75,
    }),
  },

  // 15. Low working memory
  {
    name: '15. Low Working Memory',
    description: 'Fails multi-step, slow, not anxious',
    expectedTraits: {
      workingMemoryCapacity: 'low',
    },
    generateSession: () => makeSignals({
      accuracy: 0.5, multiStepAcc: 0.2, avgResponseMs: 22000,
      postErrorMs: 12000, postCorrectMs: 10000, // no anxiety pattern
    }),
  },

  // 16. High working memory
  {
    name: '16. High Working Memory',
    description: 'Handles multi-step easily',
    expectedTraits: {
      workingMemoryCapacity: 'high',
    },
    generateSession: () => makeSignals({
      accuracy: 0.85, multiStepAcc: 0.85, avgResponseMs: 10000,
    }),
  },

  // 17. Extrinsic motivation (rusher)
  {
    name: '17. Extrinsic Motivation Rusher',
    description: 'Skips instruction, doesn\'t use teacher, just wants to finish',
    expectedTraits: {
      motivationOrientation: 'extrinsic',
      explanationDepth: 'brief',
    },
    generateSession: () => makeSignals({
      accuracy: 0.6, instructionSkipRate: 0.5, instructionCompletion: 0.3,
      aiTeacherUsage: 0, hintRate: 0,
    }),
  },

  // 18. Slow and careful
  {
    name: '18. Slow and Careful',
    description: 'Takes time, good accuracy, methodical',
    expectedTraits: {
      responseLatencyPattern: 'slow_careful',
      processingSpeed: 'slow',
    },
    generateSession: () => makeSignals({
      accuracy: 0.8, avgResponseMs: 25000, hintRate: 0.05,
    }),
  },

  // 19. Interleaved learner
  {
    name: '19. Interleaved Learner',
    description: 'Better accuracy in mixed-domain sessions',
    expectedTraits: {
      interleavingPreference: 'interleaved',
    },
    generateSession: (i) => makeSignals({
      accuracy: i % 2 === 0 ? 0.85 : 0.55,
      wasInterleaved: i % 2 === 0,
      domains: i % 2 === 0 ? ['OA', 'NBT', 'NF'] as Domain[] : ['OA'] as Domain[],
    }),
  },

  // 20. Balanced average kid
  {
    name: '20. Balanced Average Kid',
    description: 'Everything moderate, no strong patterns',
    expectedTraits: {
      processingSpeed: 'moderate',
      challengeTolerance: 'moderate',
      errorTypeTendency: 'mixed',
    },
    generateSession: () => makeSignals({
      accuracy: 0.65, avgResponseMs: 13000, hintRate: 0.15,
      maxErrorStreak: 2, bareNumberAcc: 0.7, wordProblemAcc: 0.6,
    }),
  },
]

// ── Run all tests ────────────────────────────────────────────

console.log('=' .repeat(70))
console.log('PROFILER V2 — ARCHETYPE SIMULATION (20 kids × 10 sessions each)')
console.log('='.repeat(70))
console.log()

let totalMatches = 0
let totalExpected = 0
const failures: string[] = []

for (const arch of archetypes) {
  const result = runArchetype(arch, 10)
  const total = Object.keys(arch.expectedTraits).length
  totalMatches += result.matches
  totalExpected += total

  const status = result.matches === total ? '✓ PASS' : `✗ FAIL (${result.matches}/${total})`
  console.log(`${status}  ${arch.name}`)
  console.log(`         ${arch.description}`)

  if (result.mismatches.length > 0) {
    for (const m of result.mismatches) {
      console.log(`         ${m}`)
      failures.push(`${arch.name}: ${m.trim()}`)
    }
  }
  console.log()
}

console.log('='.repeat(70))
console.log(`RESULTS: ${totalMatches}/${totalExpected} traits matched (${Math.round(totalMatches/totalExpected*100)}%)`)
console.log(`         ${archetypes.length - failures.length > 0 ? archetypes.length - failures.length : 0} archetypes fully correct`)
if (failures.length > 0) {
  console.log(`\nFAILURES (${failures.length}):`)
  for (const f of failures) console.log(`  - ${f}`)
}
console.log('='.repeat(70))
