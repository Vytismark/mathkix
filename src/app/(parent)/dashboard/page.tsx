import Link from 'next/link'
import {
  Plus, Users, Star, Flame, BookOpen, ChevronRight,
  Lock, TrendingUp, Zap, Trophy, HelpCircle, GraduationCap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ChildCard } from '@/components/parent/ChildCard'
import { getTrialState } from '@/lib/trial'

/* ─── Achievement icon slug → emoji ──────────────────────────────────────── */
const ACHIEVEMENT_EMOJI: Record<string, string> = {
  fire: '🔥', star: '⭐', trophy: '🏆', brain: '🧠',
  lightning: '⚡', rocket: '🚀', gem: '💎', medal: '🥇',
  calendar: '📅', book: '📚', target: '🎯', crown: '👑',
  // type-based fallbacks
  streak: '🔥', mastery: '🏆', performance: '⭐',
  consistency: '📅', spaced_repetition: '🧠',
}

function achievementEmoji(iconSlug: string | null, type?: string) {
  if (iconSlug && ACHIEVEMENT_EMOJI[iconSlug]) return ACHIEVEMENT_EMOJI[iconSlug]
  if (type && ACHIEVEMENT_EMOJI[type]) return ACHIEVEMENT_EMOJI[type]
  return '🏅'
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays}d ago`
}

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

  const childIds = (children ?? []).map((c) => c.id)
  const hasChildren = (children ?? []).length > 0

  // ── Aggregate stats ──────────────────────────────────────────────────────
  const { count: lessonsCompleted } = childIds.length > 0
    ? await supabase
        .from('lesson_attempts')
        .select('*', { count: 'exact', head: true })
        .in('child_id', childIds)
        .eq('status', 'completed')
    : { count: 0 }

  const totalXP = (children ?? []).reduce((sum, c) => sum + (c.xp_total ?? 0), 0)
  const bestStreak = Math.max(0, ...(children ?? []).map((c) => c.streak_days ?? 0))

  // ── This week's progress ─────────────────────────────────────────────────
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay()) // Sunday
  weekStart.setHours(0, 0, 0, 0)
  const weekStartStr = weekStart.toISOString().slice(0, 10)

  const { data: weekSnapshots } = childIds.length > 0
    ? await supabase
        .from('progress_snapshots')
        .select('lessons_completed, xp_earned, avg_score_pct')
        .in('child_id', childIds)
        .gte('week_start', weekStartStr)
    : { data: [] }

  const weekXP = (weekSnapshots ?? []).reduce((s, r) => s + (r.xp_earned ?? 0), 0)
  const weekLessons = (weekSnapshots ?? []).reduce((s, r) => s + (r.lessons_completed ?? 0), 0)
  const weekScores = (weekSnapshots ?? []).filter((r) => r.avg_score_pct != null).map((r) => r.avg_score_pct!)
  const weekAvgScore = weekScores.length > 0 ? Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length) : null
  const hasWeekData = weekXP > 0 || weekLessons > 0

  // ── Recent achievements ──────────────────────────────────────────────────
  const { data: recentAchievements } = childIds.length > 0
    ? await supabase
        .from('achievements')
        .select('id, child_id, title, icon_slug, achievement_type, xp_bonus, earned_at')
        .in('child_id', childIds)
        .order('earned_at', { ascending: false })
        .limit(4)
    : { data: [] }

  // ── Build child name map for achievements ────────────────────────────────
  const childNameMap = Object.fromEntries((children ?? []).map((c) => [c.id, c.name]))

  // ── Inactive children (no practice in 3+ days, placement done) ──────────
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString()
  const inactiveChildren = (children ?? []).filter(
    (c) => c.placement_done && (!c.last_active || c.last_active < threeDaysAgo),
  )

  // ── Plan/trial ──────────────────────────────────────────────────────────
  const trialState = await getTrialState(user!.id)
  const isPaid = trialState.status === 'active_paid'
  const maxChildren = isPaid ? 10 : 2
  const childCount = children?.length ?? 0
  const atLimit = childCount >= maxChildren

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const needsPlacement = (children ?? []).filter((c) => !c.placement_done)

  return (
    <div className="max-w-5xl">

      {/* ── Header ─────────────────────────────────────────────────────── */}
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
                  background: 'linear-gradient(135deg, #2557CC, #3678FF)',
                  boxShadow: '0 4px 18px rgba(54,120,255,0.35)',
                }}
              >
                <Plus className="w-4 h-4" />
                Add child
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* ── All-time stat cards ─────────────────────────────────────────── */}
      <div className="stat-grid grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Users,    label: 'Children',          value: children?.length ?? 0,    color: '#7c3aed', glow: 'rgba(124,58,237,0.3)' },
          { icon: Star,     label: 'Total XP',           value: totalXP.toLocaleString(), color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
          { icon: BookOpen, label: 'Lessons completed',  value: lessonsCompleted ?? 0,    color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
          { icon: Flame,    label: 'Best streak',        value: `${bestStreak}d`,         color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
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

      {/* ── This week highlights ────────────────────────────────────────── */}
      {hasChildren && hasWeekData && (
        <div
          className="animate-fade-in-up flex flex-wrap items-center gap-4 px-5 py-3.5 rounded-2xl border border-white/10 mb-5"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest shrink-0">This week</span>
          <div className="flex flex-wrap gap-5">
            {weekXP > 0 && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                {weekXP.toLocaleString()} XP
              </span>
            )}
            {weekLessons > 0 && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                <BookOpen className="w-3.5 h-3.5" />
                {weekLessons} lesson{weekLessons !== 1 ? 's' : ''}
              </span>
            )}
            {weekAvgScore !== null && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-400">
                <TrendingUp className="w-3.5 h-3.5" />
                {weekAvgScore}% avg accuracy
              </span>
            )}
          </div>
        </div>
      )}

      {!hasChildren ? (
        /* ── Empty state ─────────────────────────────────────────────── */
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
              style={{ background: 'linear-gradient(135deg, #2557CC, #3678FF)' }}
            >
              <Plus className="w-4 h-4" />
              Add child
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* ── Action banners ──────────────────────────────────────── */}

          {/* Placement quiz warning */}
          {needsPlacement.length > 0 && (
            <div
              className="flex items-center gap-3 p-4 rounded-2xl border border-amber-500/25 mb-4"
              style={{ background: 'rgba(245,158,11,0.06)' }}
            >
              <span className="text-2xl">⚡</span>
              <div className="flex-1">
                <p className="text-amber-300 font-semibold text-sm">
                  {needsPlacement.length === 1
                    ? `${needsPlacement[0].name} hasn't taken the placement quiz yet`
                    : `${needsPlacement.length} children need placement quizzes`}
                </p>
                <p className="text-amber-400/60 text-xs mt-0.5">Complete the quiz to unlock personalized lessons</p>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500/50 shrink-0" />
            </div>
          )}

          {/* Inactive children nudge */}
          {inactiveChildren.length > 0 && (
            <div
              className="flex items-center gap-3 p-4 rounded-2xl border border-blue-500/20 mb-4"
              style={{ background: 'rgba(59,130,246,0.05)' }}
            >
              <span className="text-xl">💤</span>
              <div className="flex-1">
                <p className="text-blue-300 font-semibold text-sm">
                  {inactiveChildren.length === 1
                    ? `${inactiveChildren[0].name} hasn't practised in a few days`
                    : `${inactiveChildren.length} children haven't practised recently`}
                </p>
                <p className="text-blue-400/50 text-xs mt-0.5">Daily practice keeps the streak alive!</p>
              </div>
              <Link
                href="/children"
                className="flex items-center gap-1 text-blue-400/70 hover:text-blue-300 text-xs font-medium transition-colors shrink-0"
              >
                View <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* ── Children grid ────────────────────────────────────────── */}
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              Your children — {children!.length}
            </h2>
            <div className="child-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children!.map((child) => (
                <ChildCard key={child.id} child={child} />
              ))}
            </div>
          </div>

          {/* ── Recent achievements ──────────────────────────────────── */}
          {(recentAchievements ?? []).length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5" />
                  Recent achievements
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(recentAchievements ?? []).map((a) => (
                  <Link key={a.id} href={`/children/${a.child_id}`}>
                    <div
                      className="quick-link flex items-center gap-3 p-4 rounded-2xl border border-white/10 cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{ background: 'rgba(245,158,11,0.12)' }}
                      >
                        {achievementEmoji(a.icon_slug, a.achievement_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{a.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {childNameMap[a.child_id] ?? 'Unknown'}
                          {a.xp_bonus > 0 && <span className="text-yellow-500/70 ml-1">+{a.xp_bonus} XP</span>}
                          {a.earned_at && <span className="ml-1">· {timeAgo(a.earned_at)}</span>}
                        </p>
                      </div>
                      <Zap className="w-3.5 h-3.5 text-yellow-500/40 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Quick links ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: '/children', icon: Users, color: '#7c3aed', bg: 'bg-violet-500/20', label: 'Manage children', desc: 'Settings, progress & more' },
              { href: '/billing',  icon: Star,  color: '#10b981', bg: 'bg-emerald-500/20', label: 'Subscription',   desc: 'View plan & billing' },
              { href: '/curriculum', icon: GraduationCap, color: '#3b82f6', bg: 'bg-blue-500/20', label: 'Curriculum', desc: 'Browse grades 1–5 topics' },
              { href: '/how-to', icon: HelpCircle, color: '#f59e0b', bg: 'bg-amber-500/20', label: 'How it works', desc: 'Guides & FAQ' },
            ].map(({ href, icon: Icon, color, bg, label, desc }, i) => (
              <Link key={href} href={href}>
                <div
                  className="quick-link animate-fade-in-up flex items-center justify-between p-4 rounded-2xl border border-white/10 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)', animationDelay: `${300 + i * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{label}</p>
                      <p className="text-slate-500 text-xs">{desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
