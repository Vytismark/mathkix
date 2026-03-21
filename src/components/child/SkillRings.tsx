'use client'

import type { Domain } from '@/types/quiz'
import { StartPracticeButton } from './StartPracticeButton'

// ── Domain visuals ──────────────────────────────────────────

const DOMAIN_STYLE: Record<string, {
  label: string
  icon: string
  color: string
  colorLight: string
}> = {
  OA:  { label: 'Operations',  icon: '➕', color: '#3b82f6', colorLight: '#dbeafe' },
  NBT: { label: 'Numbers',     icon: '🔢', color: '#8b5cf6', colorLight: '#ede9fe' },
  NF:  { label: 'Fractions',   icon: '½',  color: '#10b981', colorLight: '#d1fae5' },
  MD:  { label: 'Measurement', icon: '📏', color: '#f97316', colorLight: '#fed7aa' },
  G:   { label: 'Geometry',    icon: '🔷', color: '#ec4899', colorLight: '#fce7f3' },
  CC:  { label: 'Counting',    icon: '🔤', color: '#f59e0b', colorLight: '#fef3c7' },
}

const FALLBACK_STYLE = { label: 'Math', icon: '📘', color: '#6b7280', colorLight: '#f3f4f6' }

// ── SVG ring helper ─────────────────────────────────────────

function SkillRingSVG({ pct, color, colorLight, size }: {
  pct: number
  color: string
  colorLight: string
  size: number
}) {
  const strokeWidth = size > 80 ? 8 : 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const filled = (Math.min(pct, 100) / 100) * circumference
  const gap = circumference - filled

  return (
    <svg width={size} height={size} className="absolute inset-0">
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colorLight}
        strokeWidth={strokeWidth}
      />
      {/* Filled arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${gap}`}
        strokeDashoffset={circumference / 4}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

// ── Types ───────────────────────────────────────────────────

interface SkillRingsProps {
  childId: string
  domainMastery: Partial<Record<Domain, number>>
  domains: string[]
}

// ── Pentagon positions (5 nodes around a center) ────────────

// Positions for rings in the hub layout (relative % from center)
// Pentagon: top, top-right, bottom-right, bottom-left, top-left
const RING_POSITIONS = [
  { x: 50, y: 8 },    // top center
  { x: 88, y: 38 },   // top right
  { x: 74, y: 82 },   // bottom right
  { x: 26, y: 82 },   // bottom left
  { x: 12, y: 38 },   // top left
]

// Fallback for < 5 or > 5 domains: evenly around a circle
function getCirclePositions(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2 // start from top
    return {
      x: 50 + 40 * Math.cos(angle),
      y: 50 + 40 * Math.sin(angle),
    }
  })
}

// ── Component ───────────────────────────────────────────────

export function SkillRings({ childId, domainMastery, domains }: SkillRingsProps) {
  const uniqueDomains = [...new Set(domains)]

  if (uniqueDomains.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">📚</p>
        <p className="text-slate-500 text-sm">No lessons available yet.</p>
      </div>
    )
  }

  // Overall mastery average
  const masteryValues = uniqueDomains.map((d) => domainMastery[d as Domain] ?? 0)
  const overallPct = masteryValues.length > 0
    ? Math.round(masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length)
    : 0

  const positions = uniqueDomains.length === 5
    ? RING_POSITIONS
    : getCirclePositions(uniqueDomains.length)

  const ringSize = 80 // px for each skill ring

  return (
    <div className="flex flex-col items-center gap-6">
      {/* ── Skill rings hub ──────────────── */}
      <div className="relative w-full max-w-[340px] mx-auto" style={{ aspectRatio: '1' }}>
        {/* Center: CTA button + overall mastery */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 w-36">
            {/* Overall ring */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <SkillRingSVG pct={overallPct} color="#3678FF" colorLight="#dbeafe" size={80} />
              <div className="flex flex-col items-center">
                <span className="text-xl font-extrabold text-slate-800 leading-none">{overallPct}%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-0.5">Overall</span>
              </div>
            </div>
          </div>
        </div>

        {/* Domain rings positioned around the center */}
        {uniqueDomains.map((domain, i) => {
          const style = DOMAIN_STYLE[domain] ?? FALLBACK_STYLE
          const mastery = domainMastery[domain as Domain] ?? 0
          const pos = positions[i]
          const isMastered = mastery >= 95

          return (
            <div
              key={domain}
              className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
            >
              {/* Ring node */}
              <div
                className={`relative flex items-center justify-center ${
                  isMastered ? 'animate-pulse-ring' : ''
                }`}
                style={{
                  width: ringSize,
                  height: ringSize,
                  ['--ring-color' as string]: isMastered ? 'rgba(245,158,11,0.5)' : `${style.color}40`,
                }}
              >
                <SkillRingSVG
                  pct={mastery}
                  color={isMastered ? '#f59e0b' : style.color}
                  colorLight={style.colorLight}
                  size={ringSize}
                />
                {/* Inner icon */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm ${
                  isMastered ? 'bg-gradient-to-br from-amber-50 to-white' : 'bg-white'
                }`}>
                  <span className="text-2xl leading-none select-none">
                    {isMastered ? '👑' : style.icon}
                  </span>
                </div>

                {/* Mastery badge */}
                <div
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full shadow-sm"
                  style={{ backgroundColor: isMastered ? '#f59e0b' : style.color }}
                >
                  {mastery}%
                </div>

                {/* Mastered glow */}
                {isMastered && (
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ boxShadow: '0 0 18px rgba(245,158,11,0.4)' }}
                  />
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] font-bold text-slate-600 text-center leading-tight whitespace-nowrap">
                {style.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── CTA button ───────────────────── */}
      <div className="w-full max-w-sm">
        <StartPracticeButton childId={childId} />
      </div>
    </div>
  )
}
