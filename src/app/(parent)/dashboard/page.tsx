import Link from 'next/link'
import { Plus, Users, Star, Flame, BookOpen, ChevronRight, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ChildCard } from '@/components/parent/ChildCard'
import { getTrialState } from '@/lib/trial'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('profile_id', user!.id)
    .order('created_at', { ascending: true })

  // Aggregate stats across all children
  const childIds = (children ?? []).map((c) => c.id)

  const { count: lessonsCompleted } = childIds.length > 0
    ? await supabase
        .from('lesson_attempts')
        .select('*', { count: 'exact', head: true })
        .in('child_id', childIds)
        .eq('status', 'completed')
    : { count: 0 }

  const totalXP = (children ?? []).reduce((sum, c) => sum + (c.xp_total ?? 0), 0)
  const activeSreaks = (children ?? []).filter((c) => (c.streak_days ?? 0) > 0).length
  const placedChildren = (children ?? []).filter((c) => c.placement_done).length

  const trialState = await getTrialState(user!.id)
  const isPaid = trialState.status === 'active_paid'
  const maxChildren = isPaid ? 10 : 2
  const childCount = children?.length ?? 0
  const atLimit = childCount >= maxChildren

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const hasChildren = children && children.length > 0

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Hi, {firstName}! 👋</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Here&apos;s an overview of your children&apos;s progress</p>
        </div>
        {atLimit ? (
          <div className="flex items-center gap-2 text-sm shrink-0">
            <span className="text-slate-500">{childCount}/{maxChildren} profiles</span>
            {!isPaid && (
              <Link
                href="/billing"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-amber-300 border border-amber-500/30"
                style={{ background: 'rgba(245,158,11,0.08)' }}
              >
                <Lock className="w-3.5 h-3.5" />
                Upgrade for more
              </Link>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-600">{childCount}/{maxChildren}</span>
            <Link href="/children/new">
              <button
                className="cta-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white w-full sm:w-auto justify-center"
                style={{
                  background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
                  boxShadow: '0 4px 18px rgba(192,57,43,0.35)',
                }}
              >
                <Plus className="w-4 h-4" />
                Add child
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="stat-grid grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Users,     label: 'Children',          value: children?.length ?? 0,    color: '#7c3aed', glow: 'rgba(124,58,237,0.3)'  },
          { icon: Star,      label: 'Total XP earned',   value: totalXP.toLocaleString(), color: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
          { icon: BookOpen,  label: 'Lessons completed', value: lessonsCompleted ?? 0,     color: '#10b981', glow: 'rgba(16,185,129,0.3)'  },
          { icon: Flame,     label: 'Active streaks',    value: activeSreaks,              color: '#f97316', glow: 'rgba(249,115,22,0.3)'  },
        ].map(({ icon: Icon, label, value, color, glow }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 rounded-2xl border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}22`, boxShadow: `0 0 14px ${glow}` }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color, width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-xl font-bold text-white leading-tight">{value}</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {!hasChildren ? (
        /* Empty state */
        <div
          className="text-center py-24 rounded-3xl border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="text-6xl mb-5">👶</div>
          <h2 className="text-xl font-semibold text-white mb-2">Add your first child</h2>
          <p className="text-slate-500 mb-2 text-sm max-w-xs mx-auto">
            Create a child profile to get started with personalized math learning.
          </p>
          <p className="text-slate-600 text-xs mb-8">
            {isPaid ? 'Up to 10 child profiles' : 'Free trial includes 2 child profiles'}
          </p>
          <Link href="/children/new">
            <button
              className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #C0392B, #E74C3C)' }}
            >
              <Plus className="w-4 h-4" />
              Add child
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Children not yet placed */}
          {children!.filter((c) => !c.placement_done).length > 0 && (
            <div
              className="flex items-center gap-3 p-4 rounded-2xl border border-amber-500/25 mb-6"
              style={{ background: 'rgba(245,158,11,0.06)' }}
            >
              <span className="text-2xl">⚡</span>
              <div className="flex-1">
                <p className="text-amber-300 font-semibold text-sm">
                  {children!.filter((c) => !c.placement_done).length === 1
                    ? `${children!.find((c) => !c.placement_done)!.name} hasn't taken the placement quiz yet`
                    : `${children!.filter((c) => !c.placement_done).length} children need placement quizzes`}
                </p>
                <p className="text-amber-400/60 text-xs mt-0.5">Complete the quiz to unlock personalized lessons</p>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500/50 shrink-0" />
            </div>
          )}

          {/* Children section */}
          <div className="mb-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              Your children - {children!.length}
            </h2>
            <div className="child-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children!.map((child) => (
                <ChildCard key={child.id} child={child} />
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/children">
              <div
                className="quick-link animate-fade-in-up flex items-center justify-between p-4 rounded-2xl border border-white/10 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', animationDelay: '300ms' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Users className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Manage children</p>
                    <p className="text-slate-500 text-xs">Settings, progress & more</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
            <Link href="/billing">
              <div
                className="quick-link animate-fade-in-up flex items-center justify-between p-4 rounded-2xl border border-white/10 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', animationDelay: '370ms' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Star className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Subscription</p>
                    <p className="text-slate-500 text-xs">View plan & billing</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
