import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOMAIN_HERO: Record<string, { gradient: string; icon: string; iconClass?: string }> = {
  OA:  { gradient: 'from-blue-500 to-blue-700',       icon: '➕' },
  NBT: { gradient: 'from-violet-500 to-violet-700',   icon: '🔢' },
  NF:  { gradient: 'from-emerald-500 to-emerald-700', icon: '½',  iconClass: 'font-extrabold' },
  MD:  { gradient: 'from-orange-500 to-orange-700',   icon: '📏' },
  G:   { gradient: 'from-pink-500 to-pink-700',       icon: '🔷' },
  CC:  { gradient: 'from-amber-500 to-amber-700',     icon: '🔤' },
}

const FALLBACK_HERO = { gradient: 'from-slate-500 to-slate-700', icon: '📘' }

interface HeroLessonCardProps {
  lesson: {
    title: string
    domain: string
    lesson_type: string
    difficulty: number
    xp_reward: number
  }
}

export function HeroLessonCard({ lesson }: HeroLessonCardProps) {
  const style = DOMAIN_HERO[lesson.domain] ?? FALLBACK_HERO

  return (
    <div className={cn('relative w-full rounded-3xl bg-gradient-to-br overflow-hidden shadow-xl', style.gradient)}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glowing orb behind icon */}
      <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10 blur-2xl" />

      <div className="relative p-7 flex items-center gap-6">
        {/* Domain icon */}
        <div className={cn(
          'w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl shrink-0 shadow-lg border border-white/30',
          style.iconClass
        )}>
          {style.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Next Up</p>
          <h2 className="text-white text-2xl font-extrabold leading-tight">
            {lesson.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white/70 text-xs capitalize bg-white/15 px-2 py-0.5 rounded-md">
              {lesson.lesson_type}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3 h-3',
                    i < lesson.difficulty
                      ? 'text-yellow-300 fill-yellow-300'
                      : 'text-white/25 fill-white/25'
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* XP badge */}
        <div className="shrink-0 self-start">
          <span className="inline-block bg-yellow-400 text-yellow-900 text-sm font-extrabold px-3 py-1.5 rounded-xl shadow-md">
            +{lesson.xp_reward} XP
          </span>
        </div>
      </div>
    </div>
  )
}
