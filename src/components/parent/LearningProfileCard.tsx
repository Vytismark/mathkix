'use client'

import { useEffect, useState } from 'react'

interface ProfileDimension {
  value: string | string[] | Record<string, string>
  confidence: number
  dataPoints: number
  trend?: 'improving' | 'stable' | 'declining'
}

type Profile = Record<string, ProfileDimension>

// ── Friendly labels and descriptions ─────────────────────────

interface DimensionDisplay {
  label: string
  category: string
  describe: (value: string) => string
}

const DIMENSION_MAP: Record<string, DimensionDisplay> = {
  processingSpeed: {
    label: 'Problem-solving speed',
    category: 'How they learn',
    describe: (v) => v === 'fast' ? 'Works through problems quickly' : v === 'slow' ? 'Takes their time — careful and thorough' : 'Works at a steady pace',
  },
  workingMemoryCapacity: {
    label: 'Multi-step problem handling',
    category: 'How they learn',
    describe: (v) => v === 'high' ? 'Handles complex multi-step problems well' : v === 'low' ? 'Benefits from problems broken into smaller steps' : 'Handles moderate complexity',
  },
  cognitiveStage: {
    label: 'Thinking style',
    category: 'How they learn',
    describe: (v) => v === 'formal' ? 'Comfortable with abstract concepts and variables' : v === 'concrete' ? 'Learns best with hands-on examples and pictures' : 'Transitioning from concrete to abstract thinking',
  },
  motivationOrientation: {
    label: 'What drives them',
    category: 'What motivates them',
    describe: (v) => v === 'intrinsic' ? 'Curious learner — motivated by understanding and discovery' : v === 'extrinsic' ? 'Goal-oriented — motivated by achievements and progress' : 'Motivated by a mix of curiosity and goals',
  },
  challengeTolerance: {
    label: 'Persistence with challenges',
    category: 'What motivates them',
    describe: (v) => v === 'high' ? 'Keeps trying even when problems are tough' : v === 'low' ? 'Benefits from encouragement when problems get hard' : 'Handles challenges with some support',
  },
  mindsetIndicator: {
    label: 'Growth mindset',
    category: 'What motivates them',
    describe: (v) => v === 'growth_leaning' ? 'Sees mistakes as learning opportunities' : v === 'fixed_leaning' ? 'May get discouraged by mistakes — we use extra encouragement' : 'Developing a healthy attitude toward mistakes',
  },
  representationPreference: {
    label: 'Learning style',
    category: 'Teaching style that works',
    describe: (v) => v === 'visual' ? 'Learns best with pictures, diagrams, and visual examples' : v === 'verbal' ? 'Learns best through stories and verbal explanations' : 'Learns best with equations and step-by-step procedures',
  },
  exampleFirstVsRuleFirst: {
    label: 'How they prefer to start',
    category: 'Teaching style that works',
    describe: (v) => v === 'example_first' ? 'Learns better by seeing examples first, then the rule' : v === 'rule_first' ? 'Prefers learning the rule first, then practicing' : 'Flexible — works well either way',
  },
  explanationDepth: {
    label: 'Explanation detail level',
    category: 'Teaching style that works',
    describe: (v) => v === 'detailed' ? 'Benefits from thorough step-by-step explanations' : v === 'brief' ? 'Prefers quick, concise explanations' : 'Likes a moderate amount of detail',
  },
  workedExampleFadingStage: {
    label: 'Independence level',
    category: 'Teaching style that works',
    describe: (v) => v === 'independent' ? 'Ready to solve problems with minimal guidance' : v === 'partial' ? 'Benefits from seeing part of the solution first' : 'Learns best with full worked examples shown first',
  },
  mathAnxietyLevel: {
    label: 'Math comfort',
    category: 'Areas to watch',
    describe: (v) => v === 'high' ? 'Shows signs of math anxiety — we use a gentler, more encouraging approach' : v === 'low' ? 'Comfortable and confident with math' : 'Generally comfortable, occasional hesitation',
  },
  errorTypeTendency: {
    label: 'Error patterns',
    category: 'Areas to watch',
    describe: (v) => v === 'careless' ? 'Knows the concepts but sometimes rushes — we remind them to slow down' : v === 'conceptual' ? 'Sometimes needs concepts re-explained — we provide extra teaching' : v === 'reading' ? 'Strong at math but word problems can be tricky — we simplify language' : 'No strong error pattern detected',
  },
  wordProblemProficiency: {
    label: 'Word problems',
    category: 'Areas to watch',
    describe: (v) => v === 'strong' ? 'Handles word problems confidently' : v === 'struggles' ? 'Word problems are harder — we provide simpler language and more support' : 'Adequate with word problems',
  },
  hintResponsiveness: {
    label: 'Help preferences',
    category: 'Areas to watch',
    describe: (v) => v === 'self_sufficient' ? 'Rarely needs hints — figures things out independently' : v === 'needs_full_scaffold' ? 'Benefits from step-by-step guidance when stuck' : 'A small nudge is usually enough to get back on track',
  },
  sessionFatiguePattern: {
    label: 'Session energy',
    category: 'Session patterns',
    describe: (v) => v === 'late_decay' ? 'Energy drops toward the end — we put important content first' : v === 'early_decay' ? 'Needs a moment to warm up — starts strong after first few questions' : 'Maintains consistent energy throughout sessions',
  },
  interleavingPreference: {
    label: 'Topic mixing',
    category: 'Session patterns',
    describe: (v) => v === 'interleaved' ? 'Does better when topics are mixed in one session' : v === 'focused_blocks' ? 'Prefers focusing on one topic at a time' : 'Works well with both approaches',
  },
  responseLatencyPattern: {
    label: 'Response style',
    category: 'Session patterns',
    describe: (v) => v === 'fast_right' ? 'Quick and accurate — strong automatic recall' : v === 'fast_wrong' ? 'Responds quickly but sometimes too fast — we encourage double-checking' : v === 'slow_careful' ? 'Takes time to think carefully before answering' : 'Variable response pattern',
  },
}

const CATEGORY_ORDER = [
  'How they learn',
  'What motivates them',
  'Teaching style that works',
  'Areas to watch',
  'Session patterns',
]

const CATEGORY_ICONS: Record<string, string> = {
  'How they learn': '🧠',
  'What motivates them': '🌟',
  'Teaching style that works': '📖',
  'Areas to watch': '👀',
  'Session patterns': '⏱️',
}

// ── Confidence display ───────────────────────────────────────

function ConfidenceDot({ confidence }: { confidence: number }) {
  const color = confidence >= 0.6 ? 'bg-green-400' : confidence >= 0.3 ? 'bg-amber-400' : 'bg-slate-300'
  const label = confidence >= 0.6 ? 'High confidence' : confidence >= 0.3 ? 'Growing confidence' : 'Still learning'
  return (
    <span title={label} className={`inline-block w-2 h-2 rounded-full ${color}`} />
  )
}

function TrendArrow({ trend }: { trend?: string }) {
  if (!trend) return null
  if (trend === 'improving') return <span className="text-green-500 text-xs ml-1" title="Improving">↑</span>
  if (trend === 'declining') return <span className="text-red-400 text-xs ml-1" title="Needs attention">↓</span>
  return <span className="text-slate-400 text-xs ml-1" title="Stable">→</span>
}

// ── Main component ───────────────────────────────────────────

interface LearningProfileCardProps {
  childId: string
}

export function LearningProfileCard({ childId }: LearningProfileCardProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/children/${childId}/profile`)
      .then(r => r.json())
      .then(data => { setProfile(data.profile ?? null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [childId])

  if (loading) return <div className="text-sm text-slate-400 py-4">Loading learning profile...</div>

  // Count dimensions with enough confidence to show
  const visibleDimensions = profile ? Object.entries(DIMENSION_MAP).filter(([key]) => {
    const dim = profile[key] as ProfileDimension | undefined
    return dim && dim.confidence >= 0.15 && dim.dataPoints >= 1
  }) : []

  if (!profile || !profile.cognitiveStage || visibleDimensions.length === 0) {
    return (
      <div
        className="rounded-2xl border border-white/10 p-6"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <h3 className="text-lg font-bold text-white mb-2">Learning Profile</h3>
        <p className="text-sm text-slate-400">
          We&apos;re still getting to know your child&apos;s learning style. After a few more sessions, insights will appear here.
        </p>
      </div>
    )
  }

  // Group by category
  const byCategory = new Map<string, Array<{ key: string; dim: ProfileDimension; display: DimensionDisplay }>>()
  for (const [key, display] of visibleDimensions) {
    const dim = profile[key] as ProfileDimension
    const cat = display.category
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push({ key, dim, display })
  }

  return (
    <div
      className="rounded-2xl border border-white/10 p-6"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Learning Profile</h3>
        <span className="text-xs text-slate-400">{profile.cognitiveStage?.dataPoints ?? 0} sessions analyzed</span>
      </div>

      <div className="space-y-5">
        {CATEGORY_ORDER.map(cat => {
          const items = byCategory.get(cat)
          if (!items || items.length === 0) return null
          return (
            <div key={cat}>
              <h4 className="text-sm font-semibold text-slate-400 mb-2">
                {CATEGORY_ICONS[cat]} {cat}
              </h4>
              <div className="space-y-2">
                {items.map(({ key, dim, display }) => {
                  const valueStr = typeof dim.value === 'string' ? dim.value : JSON.stringify(dim.value)
                  return (
                    <div key={key} className="flex items-start gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <ConfidenceDot confidence={dim.confidence} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-slate-200">{display.label}</span>
                          <TrendArrow trend={dim.trend} />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {display.describe(valueStr)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-slate-500 mt-4">
        This profile is built automatically from session behavior. It becomes more accurate with each session.
      </p>
    </div>
  )
}
