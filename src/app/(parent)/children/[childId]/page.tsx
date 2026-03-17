import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Settings, BarChart2, Play, Star, Flame, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getGradeLabel, DOMAIN_LABELS, DOMAIN_ICONS, DOMAIN_COLORS, DOMAIN_DESCRIPTIONS } from '@/lib/quiz/levelMapping'
import { getDomainsForGrade } from '@/types/quiz'
import type { Domain } from '@/types/quiz'
import { DomainProgressGrid } from '@/components/parent/DomainProgressGrid'
import type { DomainData, StandardInfo } from '@/components/parent/DomainProgressGrid'
import { getGradeBank } from '@/data/questions'

const AVATAR_EMOJI: Record<string, string> = {
  bear: '🐻', cat: '🐱', dog: '🐶', fox: '🦊',
  owl: '🦉', penguin: '🐧', rabbit: '🐰', tiger: '🐯', default: '😊',
}

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { childId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .eq('profile_id', user!.id)
    .single()

  if (!child) notFound()

  /* Parallel data fetching */
  const [attemptsResult, masteryResult] = await Promise.all([
    supabase
      .from('lesson_attempts')
      .select('id, score_pct, xp_earned, completed_at, lessons(title)')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5),
    supabase
      .from('child_standard_mastery')
      .select('standard_code, mastery_level, attempts, last_attempted')
      .eq('child_id', childId),
  ])

  const recentAttempts = attemptsResult.data
  const standardRows = masteryResult.data ?? []

  /* Build domain data */
  const grade = child.school_grade ?? 2
  const activeDomains = getDomainsForGrade(grade)
  const domainMastery = (child.domain_mastery ?? {}) as unknown as Record<string, number>
  const domainGrades = (child.domain_grades ?? {}) as unknown as Record<string, number>

  // Build mastery lookup from practiced standards
  const masteryLookup = new Map<string, { mastery_level: number; attempts: number; last_attempted: string | null }>()
  for (const row of standardRows) {
    if (row.standard_code) {
      masteryLookup.set(row.standard_code, {
        mastery_level: row.mastery_level,
        attempts: row.attempts,
        last_attempted: row.last_attempted,
      })
    }
  }

  // Get ALL standards for the grade from the question bank, merge with mastery data
  const safeGrade = (grade >= 1 && grade <= 5 ? grade : 2) as 1 | 2 | 3 | 4 | 5
  const gradeBank = getGradeBank(safeGrade)

  const standardsByDomain: Record<string, StandardInfo[]> = {}
  for (const std of gradeBank.standards) {
    const domainKey = std.code.split('.')[1] ?? ''
    if (!standardsByDomain[domainKey]) standardsByDomain[domainKey] = []
    const practiced = masteryLookup.get(std.code)
    standardsByDomain[domainKey].push({
      code: std.code,
      shortCode: std.code.split('.')[2] ?? '',
      gradeLevel: grade,
      mastery_level: practiced?.mastery_level ?? 0,
      attempts: practiced?.attempts ?? 0,
      last_attempted: practiced?.last_attempted ?? null,
      title: std.title,
      domainName: std.domainName,
    })
  }

  // Sort: mastery high→low, then by code for ties
  for (const arr of Object.values(standardsByDomain)) {
    arr.sort((a, b) => b.mastery_level - a.mastery_level || a.code.localeCompare(b.code, undefined, { numeric: true }))
  }

  const domains: DomainData[] = activeDomains.map((d: Domain) => ({
    domain: d,
    label: DOMAIN_LABELS[d],
    icon: DOMAIN_ICONS[d],
    description: DOMAIN_DESCRIPTIONS[d],
    colors: DOMAIN_COLORS[d],
    overallMastery: Math.round(domainMastery[d] ?? 0),
    effectiveGrade: domainGrades[d] ?? null,
    standards: standardsByDomain[d] ?? [],
  }))

  const totalStandards = gradeBank.totalStandards
  const practicedStandards = standardRows.length

  const emoji = AVATAR_EMOJI[child.avatar_id] ?? AVATAR_EMOJI.default
  const gradeLabel = child.school_grade !== null ? getGradeLabel(child.school_grade) : 'No grade set'

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link
        href="/children"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-5"
      >
        ← Children
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0"
            style={{ background: 'rgba(124,58,237,0.25)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
          >
            {emoji}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{child.name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{gradeLabel}</p>
          </div>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <Link href={`/children/${childId}/progress`}>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all">
              <BarChart2 className="w-4 h-4" />
              Progress
            </button>
          </Link>
          <Link href={`/children/${childId}/settings`}>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Star,          label: 'Total XP',   value: `⭐ ${child.xp_total.toLocaleString()}`, color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
          { icon: Flame,         label: 'Day streak', value: `🔥 ${child.streak_days}`,               color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
          { icon: GraduationCap, label: 'Level',      value: gradeLabel,                              color: '#7c3aed', glow: 'rgba(124,58,237,0.3)' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-4 rounded-2xl border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Domain Progress */}
      <div className="mb-8">
        <DomainProgressGrid
          domains={domains}
          childHasPlacement={child.placement_done}
          childId={childId}
          totalStandards={totalStandards}
          practicedStandards={practicedStandards}
        />
      </div>

      {/* Recent activity */}
      <div
        className="rounded-3xl border border-white/10 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <div className="px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-white font-semibold">Recent Activity</h2>
        </div>
        <div className="px-6 py-4">
          {!recentAttempts || recentAttempts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm mb-4">No lessons completed yet.</p>
              {!child.placement_done && (
                <Link href="/select">
                  <button
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #C0392B, #E74C3C)' }}
                  >
                    <Play className="w-4 h-4" />
                    Start level quiz
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0"
                >
                  <span className="text-sm font-medium text-slate-200">
                    {(attempt.lessons as { title: string } | null)?.title ?? 'Lesson'}
                  </span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-500">{attempt.score_pct?.toFixed(0)}%</span>
                    <span className="text-yellow-400 font-medium">+{attempt.xp_earned} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
