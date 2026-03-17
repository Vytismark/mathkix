import Link from 'next/link'
import { Star, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOMAIN_STYLE: Record<string, {
  topBar: string
  iconBg: string
  icon: string
  masteryFill: string
  iconText: string
}> = {
  OA:  { topBar: 'bg-blue-500',    iconBg: 'bg-blue-500',    icon: '➕', masteryFill: 'bg-blue-400',    iconText: 'text-white' },
  NBT: { topBar: 'bg-violet-500',  iconBg: 'bg-violet-500',  icon: '🔢', masteryFill: 'bg-violet-400',  iconText: 'text-white' },
  NF:  { topBar: 'bg-emerald-500', iconBg: 'bg-emerald-500', icon: '½',  masteryFill: 'bg-emerald-400', iconText: 'text-white font-extrabold text-xl' },
  MD:  { topBar: 'bg-orange-500',  iconBg: 'bg-orange-500',  icon: '📏', masteryFill: 'bg-orange-400',  iconText: 'text-white' },
  G:   { topBar: 'bg-pink-500',    iconBg: 'bg-pink-500',    icon: '🔷', masteryFill: 'bg-pink-400',    iconText: 'text-white' },
  CC:  { topBar: 'bg-amber-500',   iconBg: 'bg-amber-500',   icon: '🔤', masteryFill: 'bg-amber-400',   iconText: 'text-white' },
}

const FALLBACK = {
  topBar: 'bg-slate-400', iconBg: 'bg-slate-400', icon: '📘',
  masteryFill: 'bg-slate-400', iconText: 'text-white',
}

const MASTERY_LABEL = ['New', 'Learning', 'Practiced', 'Mastered']

interface LessonCardProps {
  lesson: {
    id: string
    title: string
    domain: string
    lesson_type: string
    difficulty: number
    xp_reward: number
  }
  childId: string
  masteryLevel?: number
  isRecommended?: boolean
}

export function LessonCard({ lesson, childId, masteryLevel = 0, isRecommended }: LessonCardProps) {
  const style = DOMAIN_STYLE[lesson.domain] ?? FALLBACK
  const mastered = masteryLevel >= 3

  return (
    <Link href={`/play/lesson/${lesson.id}?child=${childId}`}>
      <div
        className={cn(
          'relative rounded-2xl bg-white shadow-sm border overflow-hidden cursor-pointer',
          'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]',
          isRecommended ? 'border-indigo-300 ring-2 ring-indigo-300/60' : 'border-slate-100'
        )}
      >
        {/* Domain color accent bar */}
        <div className={cn('h-1.5 w-full', style.topBar)} />

        {/* Recommended ribbon */}
        {isRecommended && (
          <div className="absolute top-4 right-3 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
            ⭐ Next up
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* iOS-style icon */}
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md shrink-0',
                style.iconBg, style.iconText
              )}
            >
              {style.icon}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="font-extrabold text-slate-800 text-sm leading-tight line-clamp-2 pr-12">
                {lesson.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3 h-3',
                        i < lesson.difficulty
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-200 fill-slate-200'
                      )}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 capitalize bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {lesson.lesson_type}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom row: mastery + XP */}
          <div className="mt-3 flex items-center gap-2">
            {/* Mastery bar */}
            <div className="flex gap-1 flex-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-all duration-500',
                    i < masteryLevel ? style.masteryFill : 'bg-slate-100'
                  )}
                />
              ))}
            </div>

            {/* Mastery label or checkmark */}
            {mastered ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <span className="text-[10px] text-slate-400 shrink-0 min-w-[48px] text-right">
                {MASTERY_LABEL[masteryLevel] ?? 'New'}
              </span>
            )}

            {/* XP badge */}
            <span className="shrink-0 text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-200">
              +{lesson.xp_reward} XP
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
