'use client'

import type { Domain } from '@/types/quiz'

// ── Grade themes ───────────────────────────────────────────

const GRADE_THEMES = [
  { label: "Beach",       bg: 'from-sky-300 via-cyan-200 to-sky-100',     ground: 'bg-amber-200',  ambient: ['🌊','🦀','🌴','🌊','🐚'],   weatherGood: '☀️', icon: '🏖️' },
  { label: "Valley",      bg: 'from-green-300 via-lime-200 to-green-100',  ground: 'bg-green-300',  ambient: ['🌿','🐰','🌸','🍀','🦋'],   weatherGood: '🌤️', icon: '🌿' },
  { label: "Town",        bg: 'from-amber-300 via-yellow-200 to-orange-100',ground:'bg-amber-300',  ambient: ['🐱','🌻','🌼','☀️','🐦'],   weatherGood: '☀️', icon: '🏘️' },
  { label: "Lake",        bg: 'from-blue-400 via-indigo-200 to-blue-100',  ground: 'bg-blue-200',   ambient: ['🦦','💎','🌙','🐟','✨'],   weatherGood: '🌟', icon: '💎' },
  { label: "Mountain",    bg: 'from-slate-400 via-zinc-300 to-slate-200',  ground: 'bg-stone-300',  ambient: ['🦅','⛰️','❄️','🌨️','🐺'], weatherGood: '⛰️', icon: '⛰️' },
  { label: "Sky Kingdom", bg: 'from-purple-500 via-violet-300 to-indigo-200',ground:'bg-violet-200',ambient: ['🐉','☁️','✨','🌈','⚡'],  weatherGood: '✨', icon: '🏰' },
] as const

// ── Domain buildings ───────────────────────────────────────

const DOMAIN_META: Record<Domain, {
  label: string
  area: string
  stages: [string, string, string, string]
  color: string
}> = {
  OA:  { label: 'Operations',  area: 'Town Center',  stages: ['🏗️','🏚️','🏪','🏛️'], color: 'bg-blue-500' },
  NBT: { label: 'Numbers',     area: 'Tower',        stages: ['🪨','🏗️','🗼','🏰'], color: 'bg-violet-500' },
  NF:  { label: 'Fractions',   area: 'Garden',       stages: ['🌱','🌿','🌳','🌺'], color: 'bg-emerald-500' },
  MD:  { label: 'Measurement', area: 'Observatory',  stages: ['⚓','🔭','🏗️','🕰️'], color: 'bg-orange-500' },
  G:   { label: 'Geometry',    area: 'Monument',     stages: ['🪵','🌉','⛩️','🗽'], color: 'bg-pink-500' },
}

const DOMAIN_ORDER: Domain[] = ['OA', 'NBT', 'NF', 'MD', 'G']

// ── Weather derivation ─────────────────────────────────────

type WeatherState = 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'stormy'

function getWeather(streakDays: number, lastActiveDaysAgo: number): WeatherState {
  if (lastActiveDaysAgo === 0 && streakDays >= 3) return 'sunny'
  if (lastActiveDaysAgo === 0) return 'cloudy'
  if (lastActiveDaysAgo === 1) return 'overcast'
  if (lastActiveDaysAgo === 2) return 'rainy'
  return 'stormy'
}

const WEATHER_META: Record<WeatherState, { icon: string; label: string; overlay: string }> = {
  sunny:   { icon: '☀️',  label: 'Sunny',           overlay: '' },
  cloudy:  { icon: '🌤️',  label: 'Looking good!',   overlay: '' },
  overcast:{ icon: '🌥️',  label: 'Your island misses you!', overlay: 'bg-slate-400/10' },
  rainy:   { icon: '🌧️',  label: 'Come back soon!', overlay: 'bg-blue-900/10' },
  stormy:  { icon: '⛈️',  label: 'Your island needs you!',  overlay: 'bg-slate-900/15' },
}

// ── Building stage from mastery pct ───────────────────────

function masteryToStage(masteryPct: number): 0 | 1 | 2 | 3 {
  if (masteryPct >= 75) return 3
  if (masteryPct >= 50) return 2
  if (masteryPct >= 25) return 1
  return 0
}

// ── Props ──────────────────────────────────────────────────

export interface IslandViewProps {
  gradeLevel: number
  domainMastery: Partial<Record<Domain, number>>  // 0-100 per domain
  streakDays: number
  lastActiveDaysAgo: number
  childName?: string
  compact?: boolean
  highlightDomain?: Domain | null
  onAreaClick?: (domain: Domain) => void
}

// ── Component ──────────────────────────────────────────────

export function IslandView({
  gradeLevel,
  domainMastery,
  streakDays,
  lastActiveDaysAgo,
  childName,
  compact = false,
  highlightDomain = null,
  onAreaClick,
}: IslandViewProps) {
  const grade = Math.min(5, Math.max(0, gradeLevel))
  const theme = GRADE_THEMES[grade]
  const weather = getWeather(streakDays, lastActiveDaysAgo)
  const weatherMeta = WEATHER_META[weather]

  const islandLabel = childName
    ? `${theme.icon} ${childName}'s ${theme.label}`
    : `${theme.icon} ${theme.label}`

  if (compact) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${theme.bg} p-3 select-none`}>
        {/* Weather overlay */}
        {weatherMeta.overlay && (
          <div className={`absolute inset-0 ${weatherMeta.overlay} pointer-events-none`} />
        )}
        {/* Title */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white drop-shadow">{islandLabel}</span>
          <span className="text-sm">{weatherMeta.icon}</span>
        </div>
        {/* Mini building row */}
        <div className="flex gap-1.5 justify-center">
          {DOMAIN_ORDER.map((domain) => {
            const pct = domainMastery[domain] ?? 0
            const stage = masteryToStage(pct)
            const meta = DOMAIN_META[domain]
            const isHighlighted = highlightDomain === domain
            return (
              <div
                key={domain}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all duration-500 ${
                  isHighlighted ? 'bg-white/30 ring-2 ring-white scale-110' : 'bg-white/10'
                }`}
              >
                <span className="text-lg leading-none">{meta.stages[stage]}</span>
                {isHighlighted && (
                  <span className="text-[8px] text-white font-bold">✨</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-br ${theme.bg} select-none shadow-lg`}>
      {/* Weather overlay */}
      {weatherMeta.overlay && (
        <div className={`absolute inset-0 ${weatherMeta.overlay} pointer-events-none z-10`} />
      )}

      {/* Animated ambient particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {theme.ambient.map((emoji, i) => (
          <span
            key={i}
            className="absolute text-lg opacity-60 animate-bounce"
            style={{
              left: `${10 + i * 18}%`,
              top: `${8 + (i % 3) * 12}%`,
              animationDuration: `${2 + i * 0.4}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Header row: island name + weather */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-1">
        <div>
          <span className="text-sm font-extrabold text-white drop-shadow-md">{islandLabel}</span>
          {weather !== 'sunny' && weather !== 'cloudy' && (
            <p className="text-[10px] text-white/80 mt-0.5">{weatherMeta.label}</p>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
          <span className="text-base">{weatherMeta.icon}</span>
          {streakDays > 0 && (
            <span className="text-xs font-bold text-white">{streakDays}🔥</span>
          )}
        </div>
      </div>

      {/* Domain area grid - 2 top, 1 center, 2 bottom */}
      <div className="relative z-20 px-3 pb-4 pt-1">
        {/* Top row */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {DOMAIN_ORDER.slice(0, 2).map((domain) => (
            <DomainTile
              key={domain}
              domain={domain}
              masteryPct={domainMastery[domain] ?? 0}
              highlighted={highlightDomain === domain}
              onClick={onAreaClick}
            />
          ))}
        </div>
        {/* Center */}
        <div className="flex justify-center mb-2">
          <div className="w-1/2">
            <DomainTile
              domain={DOMAIN_ORDER[2]}
              masteryPct={domainMastery[DOMAIN_ORDER[2]] ?? 0}
              highlighted={highlightDomain === DOMAIN_ORDER[2]}
              onClick={onAreaClick}
            />
          </div>
        </div>
        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-2">
          {DOMAIN_ORDER.slice(3).map((domain) => (
            <DomainTile
              key={domain}
              domain={domain}
              masteryPct={domainMastery[domain] ?? 0}
              highlighted={highlightDomain === domain}
              onClick={onAreaClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Domain tile ────────────────────────────────────────────

function DomainTile({
  domain,
  masteryPct,
  highlighted,
  onClick,
}: {
  domain: Domain
  masteryPct: number
  highlighted: boolean
  onClick?: (domain: Domain) => void
}) {
  const meta = DOMAIN_META[domain]
  const stage = masteryToStage(masteryPct)
  const isClickable = !!onClick

  return (
    <button
      onClick={() => onClick?.(domain)}
      disabled={!isClickable}
      className={`
        flex flex-col items-center gap-1 p-2 rounded-xl
        transition-all duration-300
        ${highlighted
          ? 'bg-white/40 ring-2 ring-white shadow-lg scale-105'
          : 'bg-white/20 hover:bg-white/30'
        }
        ${isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default'}
      `}
    >
      {/* Building emoji with stage indicator */}
      <div className="relative">
        <span className="text-3xl leading-none">{meta.stages[stage]}</span>
        {highlighted && (
          <span className="absolute -top-1 -right-1 text-xs animate-spin" style={{ animationDuration: '3s' }}>✨</span>
        )}
        {stage === 3 && !highlighted && (
          <span className="absolute -top-1 -right-1 text-xs">⭐</span>
        )}
      </div>

      {/* Label */}
      <span className="text-[9px] font-bold text-white/90 uppercase tracking-wide leading-none text-center">
        {meta.label}
      </span>

      {/* Mastery progress bar */}
      <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            stage === 3 ? 'bg-yellow-300' : 'bg-white/80'
          }`}
          style={{ width: `${Math.max(4, masteryPct)}%` }}
        />
      </div>
    </button>
  )
}
