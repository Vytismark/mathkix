import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const AVATAR_EMOJI: Record<string, string> = {
  bear: '🐻', cat: '🐱', dog: '🐶', fox: '🦊',
  owl: '🦉', penguin: '🐧', rabbit: '🐰', tiger: '🐯', default: '😊',
}

const CARD_COLORS = [
  { bg: 'bg-violet-500', shadow: 'hover:shadow-[0_8px_40px_rgba(139,92,246,0.50)] hover:border-violet-500/50' },
  { bg: 'bg-sky-500',    shadow: 'hover:shadow-[0_8px_40px_rgba(14,165,233,0.50)] hover:border-sky-500/50'    },
  { bg: 'bg-emerald-500',shadow: 'hover:shadow-[0_8px_40px_rgba(16,185,129,0.50)] hover:border-emerald-500/50'},
  { bg: 'bg-pink-500',   shadow: 'hover:shadow-[0_8px_40px_rgba(236,72,153,0.50)] hover:border-pink-500/50'   },
  { bg: 'bg-amber-500',  shadow: 'hover:shadow-[0_8px_40px_rgba(245,158,11,0.50)] hover:border-amber-500/50'  },
]

// Avatar glow shadow (always on, not just hover)
const AVATAR_GLOW = [
  'shadow-[0_0_24px_rgba(139,92,246,0.60)]',
  'shadow-[0_0_24px_rgba(14,165,233,0.60)]',
  'shadow-[0_0_24px_rgba(16,185,129,0.60)]',
  'shadow-[0_0_24px_rgba(236,72,153,0.60)]',
  'shadow-[0_0_24px_rgba(245,158,11,0.60)]',
]

const GRADE_LABEL: Record<number, string> = {
  0: 'K', 1: 'G1', 2: 'G2', 3: 'G3', 4: 'G4', 5: 'G5',
}

export default async function SelectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: children } = await supabase
    .from('children')
    .select('id, name, avatar_id, school_grade, placement_done')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: true })

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Parent'

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden"
      style={{ background: '#07080f' }}
    >
      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[400px] sm:w-[900px] h-[400px] sm:h-[600px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(192,57,43,0.22) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-10%] left-[-8%] w-[280px] sm:w-[500px] h-[280px] sm:h-[500px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(243,156,18,0.12) 0%, transparent 65%)' }} />
        <div className="absolute top-[5%] right-[-5%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.10) 0%, transparent 65%)' }} />
      </div>

      {/* ── Logo ── */}
      <div className="relative mb-3">
        <Image src="/mathkix-logo.svg" alt="MathKix" width={400} height={122} priority className="w-[280px] sm:w-[400px] h-auto" />
      </div>

      {/* ── Tagline ── */}
      <p className="relative text-slate-500 mb-8 sm:mb-14 tracking-[0.28em] uppercase text-[11px] font-semibold">
        Who&apos;s using the app today?
      </p>

      {/* ── Profile cards ── */}
      <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 w-full max-w-3xl">

        {/* Parent card */}
        <Link href="/dashboard">
          <div className="group flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-7 rounded-3xl cursor-pointer transition-all duration-200 hover:scale-[1.07] bg-white/[0.07] border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_40px_rgba(124,58,237,0.45)] hover:border-violet-500/50">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_24px_rgba(124,58,237,0.55)]"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              🏠
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-white">{firstName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 tracking-wide">Parent Dashboard</p>
            </div>
          </div>
        </Link>

        {/* Child cards */}
        {(children ?? []).map((child, i) => {
          const color = CARD_COLORS[i % CARD_COLORS.length]
          const glow = AVATAR_GLOW[i % AVATAR_GLOW.length]
          const emoji = AVATAR_EMOJI[child.avatar_id] ?? AVATAR_EMOJI.default
          const href = child.placement_done
            ? `/play/home?child=${child.id}`
            : `/play/quiz?child=${child.id}`
          const gradeLabel = child.school_grade !== null
            ? (GRADE_LABEL[child.school_grade] ?? '')
            : null

          return (
            <Link key={child.id} href={href}>
              <div className={`group relative flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-7 rounded-3xl cursor-pointer transition-all duration-200 hover:scale-[1.07] bg-white/[0.07] border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] ${color.shadow}`}>
                {gradeLabel && (
                  <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full tracking-wider">
                    {gradeLabel}
                  </span>
                )}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${color.bg} ${glow} flex items-center justify-center text-3xl sm:text-4xl`}>
                  {emoji}
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-white">{child.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 tracking-wide">
                    {child.placement_done ? 'Keep learning!' : 'Take placement quiz'}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}

        {/* Add child card */}
        <Link href="/children/new">
          <div className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-7 rounded-3xl cursor-pointer transition-all duration-200 hover:scale-[1.07] bg-white/[0.03] border border-dashed border-white/20 hover:border-white/35 hover:bg-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl sm:text-4xl">
              ➕
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-400">Add child</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
