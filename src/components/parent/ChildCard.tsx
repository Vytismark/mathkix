import Link from 'next/link'
import { Flame, Star } from 'lucide-react'
import { getGradeLabel } from '@/lib/quiz/levelMapping'

interface ChildCardProps {
  child: {
    id: string
    name: string
    avatar_id: string
    school_grade: number | null
    grade_level: number | null
    xp_total: number
    streak_days: number
    placement_done: boolean
    last_active: string | null
  }
}

const AVATAR_EMOJI: Record<string, string> = {
  bear: '🐻', cat: '🐱', dog: '🐶', fox: '🦊',
  owl: '🦉', penguin: '🐧', rabbit: '🐰', tiger: '🐯', default: '😊',
}

const AVATAR_COLORS = [
  { bg: '#7c3aed', glow: 'rgba(139,92,246,0.55)' },
  { bg: '#0ea5e9', glow: 'rgba(14,165,233,0.55)'  },
  { bg: '#10b981', glow: 'rgba(16,185,129,0.55)'  },
  { bg: '#ec4899', glow: 'rgba(236,72,153,0.55)'  },
  { bg: '#f59e0b', glow: 'rgba(245,158,11,0.55)'  },
]

let _colorIndex = 0
const colorMap: Record<string, { bg: string; glow: string }> = {}

function getColor(id: string) {
  if (!colorMap[id]) {
    colorMap[id] = AVATAR_COLORS[_colorIndex % AVATAR_COLORS.length]
    _colorIndex++
  }
  return colorMap[id]
}

function getLastActive(lastActive: string | null): { label: string; color: string } | null {
  if (!lastActive) return null
  const diffMs = Date.now() - new Date(lastActive).getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffHours < 1) return { label: 'Just now',     color: '#10b981' }
  if (diffHours < 24) return { label: 'Active today', color: '#10b981' }
  if (diffDays === 1) return { label: 'Yesterday',    color: '#10b981' }
  if (diffDays <= 3)  return { label: `${diffDays}d ago`, color: '#f59e0b' }
  return                     { label: `${diffDays}d ago`, color: '#ef4444' }
}

export function ChildCard({ child }: ChildCardProps) {
  const emoji = AVATAR_EMOJI[child.avatar_id] ?? AVATAR_EMOJI.default

  const displayGrade = child.school_grade
  const gradeLabel   = displayGrade !== null ? getGradeLabel(displayGrade) : null

  const color = getColor(child.id)
  const lastActive = getLastActive(child.last_active)
  const hotStreak = (child.streak_days ?? 0) >= 7

  return (
    <Link href={`/children/${child.id}`}>
      <div
        className="child-card group relative p-5 rounded-3xl cursor-pointer border border-white/10"
        style={{
          background: 'rgba(255,255,255,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Top-right badges */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          {!child.placement_done && (
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Needs placement
            </span>
          )}
          {hotStreak && child.placement_done && (
            <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              🔥 {child.streak_days}d
            </span>
          )}
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ background: color.bg, boxShadow: `0 0 20px ${color.glow}` }}
          >
            {emoji}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-lg truncate">{child.name}</h3>
            {gradeLabel ? (
              <p className="text-slate-500 text-xs mt-0.5">
                {gradeLabel}
                {!child.placement_done && (
                  <span className="ml-1 text-amber-500/70"> · estimated</span>
                )}
              </p>
            ) : (
              <p className="text-slate-600 text-xs mt-0.5">No grade set</p>
            )}
            {/* Last active indicator */}
            {lastActive && (
              <p className="text-[11px] mt-0.5 font-medium" style={{ color: lastActive.color }}>
                {lastActive.label}
              </p>
            )}
          </div>
        </div>

        {/* Stats footer */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/[0.07]">
          <span className="flex items-center gap-1.5 text-sm font-medium text-yellow-400">
            <Star className="w-3.5 h-3.5 fill-yellow-400" />
            {child.xp_total.toLocaleString()} XP
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-orange-400">
            <Flame className="w-3.5 h-3.5" />
            {child.streak_days} day{child.streak_days !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
