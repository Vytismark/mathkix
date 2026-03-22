import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { XPBar } from '@/components/child/XPBar'
import { GreetingBanner } from '@/components/child/GreetingBanner'
import { SkillRings } from '@/components/child/SkillRings'
import type { Domain } from '@/types/quiz'
import { getDomainsForGrade } from '@/types/quiz'

export default async function PlayHomePage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>
}) {
  const { child: childId } = await searchParams
  if (!childId) notFound()

  const supabase = await createClient()
  const srCutoff = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data: { user } } = await supabase.auth.getUser()

  // Run child profile + SR due count in parallel (both only need childId from URL)
  const [{ data: child }, { data: srDueItems }] = await Promise.all([
    supabase.from('children').select('*').eq('id', childId).eq('profile_id', user!.id).single(),
    supabase.from('spaced_repetition_items').select('id').eq('child_id', childId).lte('next_review_at', srCutoff),
  ])

  if (!child) notFound()

  const gradeLevel = child.school_grade ?? 0

  // Fetch lessons + all child mastery in parallel (mastery filtered client-side)
  const [{ data: lessons }, { data: masteryRows }] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, domain, standard_code, title, lesson_type, difficulty, xp_reward, sort_order')
      .eq('grade_level', gradeLevel)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('child_standard_mastery')
      .select('standard_code, mastery_level')
      .eq('child_id', childId),
  ])

  const masteryMap = Object.fromEntries(
    (masteryRows ?? []).map((m) => [m.standard_code, m.mastery_level])
  )

  const enrichedLessons = (lessons ?? []).map((l) => ({
    ...l,
    mastery_level: l.standard_code ? (masteryMap[l.standard_code] ?? 0) : 0,
  })).sort((a, b) => a.mastery_level - b.mastery_level || a.sort_order - b.sort_order)

  // ── Domain mastery (0-100 per domain) ───────────────
  const standardToDomain = new Map<string, Domain>()
  for (const l of lessons ?? []) {
    if (l.standard_code) standardToDomain.set(l.standard_code, l.domain as Domain)
  }

  const domainTotals: Record<string, { sum: number; count: number }> = {}
  for (const row of masteryRows ?? []) {
    const domain = standardToDomain.get(row.standard_code)
    if (!domain) continue
    if (!domainTotals[domain]) domainTotals[domain] = { sum: 0, count: 0 }
    domainTotals[domain].sum += row.mastery_level
    domainTotals[domain].count++
  }

  const domainMastery: Partial<Record<Domain, number>> = {}
  for (const domain of getDomainsForGrade(gradeLevel)) {
    const t = domainTotals[domain]
    domainMastery[domain] = t ? Math.round((t.sum / t.count / 3) * 100) : 0
  }

  // ── Streak / activity ───────────────────────────────
  const streakDays = child.streak_days ?? 0
  const lastActiveDaysAgo = child.last_active
    ? Math.floor((Date.now() - new Date(child.last_active).getTime()) / 86_400_000)
    : 999

  const srDueCount = srDueItems?.length ?? 0

  const masteredCount = enrichedLessons.filter((l) => l.mastery_level >= 3).length

  // ── Stats data ──────────────────────────────────────
  const stats = [
    { emoji: '🔥', value: String(streakDays), label: 'Day Streak', gradient: 'from-orange-500 to-red-500', show: streakDays > 0 },
    { emoji: '⭐', value: child.xp_total.toLocaleString(), label: 'Total XP', gradient: 'from-amber-400 to-yellow-500', show: true },
    { emoji: '🏆', value: String(masteredCount), label: 'Mastered', gradient: 'from-emerald-500 to-green-600', show: true },
    { emoji: '🧠', value: String(srDueCount), label: 'Due Today', gradient: 'from-blue-500 to-blue-600', show: srDueCount > 0, pulse: true },
  ].filter((s) => s.show)

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFF' }}>
      {/* ── Sticky HUD bar ───────────────────────── */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur shadow-md border-b-2 border-blue-200/80 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/select"
            className="text-slate-400 text-sm hover:text-slate-700 font-semibold shrink-0 transition-colors"
          >
            ← Switch
          </Link>
          <div className="flex-1">
            <XPBar
              xpTotal={child.xp_total}
              gradeLevel={child.school_grade}
              childName={child.name}
              streakDays={streakDays}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-14">

        {/* ── Greeting banner ──────────────────────── */}
        <div className="mt-5 animate-fade-in-up">
          <GreetingBanner
            childName={child.name}
            streakDays={streakDays}
            lastActiveDaysAgo={lastActiveDaysAgo}
            srDueCount={srDueCount}
            childId={childId}
            xpTotal={child.xp_total}
            masteredCount={masteredCount}
          />
        </div>

        {/* ── Stats cards ──────────────────────────── */}
        <div className="mt-4 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory justify-center scrollbar-hide">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`snap-center shrink-0 w-24 sm:w-28 min-h-[76px] sm:min-h-[80px] rounded-2xl shadow-lg border-2 border-white/20 bg-gradient-to-br ${stat.gradient} flex flex-col items-center justify-center gap-1 p-2.5 sm:p-3 ${
                  stat.pulse ? 'animate-pulse' : ''
                }`}
              >
                <span className="text-2xl leading-none">{stat.emoji}</span>
                <span className="text-xl font-extrabold text-white leading-none">{stat.value}</span>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide leading-none">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Skill rings hub ──────────────────────── */}
        {enrichedLessons.length > 0 && (
          <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                Your Skills
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <SkillRings
              childId={childId}
              domainMastery={domainMastery}
              domains={enrichedLessons.map((l) => l.domain)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
