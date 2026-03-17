'use client'

interface XPBarProps {
  xpTotal: number
  gradeLevel: number | null
  childName: string
  streakDays?: number
}

const XP_PER_LEVEL = 500

const GRADE_COLORS: Record<number, string> = {
  1: '#22c55e', // green-500
  2: '#f59e0b', // amber-500
  3: '#3b82f6', // blue-500
  4: '#6b7280', // gray-500
  5: '#8b5cf6', // violet-500
}

export function XPBar({ xpTotal, gradeLevel, childName, streakDays = 0 }: XPBarProps) {
  const level = Math.floor(xpTotal / XP_PER_LEVEL) + 1
  const xpInLevel = xpTotal % XP_PER_LEVEL
  const pct = Math.min(100, Math.round((xpInLevel / XP_PER_LEVEL) * 100))
  const initial = childName[0]?.toUpperCase() ?? '?'
  const gradeColor = GRADE_COLORS[gradeLevel ?? 1] ?? '#8b5cf6'

  return (
    <div className="flex items-center gap-3">
      {/* Avatar with level badge */}
      <div className="relative shrink-0">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-extrabold shadow-md select-none ring-[3px] ring-white"
          style={{ background: `linear-gradient(135deg, ${gradeColor}, ${gradeColor}cc)` }}
        >
          {initial}
        </div>
        {/* Level badge */}
        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ring-2 ring-white shadow-sm leading-none">
          {level}
        </div>
      </div>

      {/* Name + XP bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-extrabold text-slate-800 truncate leading-none">{childName}</span>
          <span className="text-xs font-bold text-amber-600 shrink-0 ml-2 flex items-center gap-0.5 leading-none">
            ⭐ {xpTotal.toLocaleString()}
          </span>
        </div>
        <div className="relative h-4 bg-slate-200/80 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-full transition-all duration-700 flex items-center justify-end"
            style={{ width: `${Math.max(pct, 8)}%` }}
          >
            {pct >= 20 && (
              <span className="text-[9px] font-extrabold text-white/90 pr-1.5 drop-shadow-sm leading-none">
                {xpInLevel}/{XP_PER_LEVEL}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Streak flame */}
      {streakDays > 0 && (
        <div className="shrink-0 flex flex-col items-center gap-0.5">
          <span className="text-xl leading-none animate-streak-flame">🔥</span>
          <span className="text-[10px] font-extrabold text-orange-500 leading-none">{streakDays}</span>
        </div>
      )}

      {/* Grade badge */}
      {gradeLevel !== null && (
        <div
          className="shrink-0 text-sm font-extrabold text-white px-3 py-1.5 rounded-xl shadow-md tracking-wide"
          style={{ backgroundColor: gradeColor }}
        >
          {`G${gradeLevel}`}
        </div>
      )}
    </div>
  )
}
