import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProgressChart } from '@/components/parent/ProgressChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDomainPoolStatus } from '@/lib/questions/pool-tracker'
import { DOMAIN_LABELS, DOMAIN_ICONS } from '@/lib/quiz/levelMapping'
import type { Domain } from '@/types/quiz'

export default async function ChildProgressPage({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { childId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: child } = await supabase
    .from('children')
    .select('id, name, xp_total, streak_days, grade_level, school_grade')
    .eq('id', childId)
    .eq('profile_id', user!.id)
    .single()

  if (!child) notFound()

  const [snapshotsResult, masteryResult, attemptsResult, quizResult] = await Promise.all([
    supabase
      .from('progress_snapshots')
      .select('*')
      .eq('child_id', childId)
      .order('week_start', { ascending: false })
      .limit(8),
    supabase
      .from('child_standard_mastery')
      .select('standard_code, mastery_level')
      .eq('child_id', childId),
    supabase
      .from('lesson_attempts')
      .select('id, score_pct, xp_earned, completed_at, lessons(title, domain)')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10),
    supabase
      .from('quiz_sessions')
      .select('scoring_method')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1),
  ])

  const mastery = masteryResult.data ?? []
  const domainMastery: Record<string, { total: number; sum: number }> = {}
  for (const m of mastery) {
    const domain = m.standard_code?.split('.')[1] ?? 'Unknown'
    if (!domainMastery[domain]) domainMastery[domain] = { total: 0, sum: 0 }
    domainMastery[domain].total++
    domainMastery[domain].sum += m.mastery_level
  }

  const domainStats = Object.entries(domainMastery).map(([domain, { total, sum }]) => ({
    domain,
    avg_mastery: total > 0 ? Math.round((sum / (total * 3)) * 100) : 0,
  }))

  const recentAttempts = attemptsResult.data ?? []
  const latestScoringMethod = quizResult.data?.[0]?.scoring_method as string | null
  const poolStatus = await getDomainPoolStatus(supabase, childId, child.school_grade ?? 2)

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/children/${childId}`} className="text-muted-foreground hover:text-foreground text-sm">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">{child.name}&apos;s Progress</h1>
        {latestScoringMethod && (
          <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full border ${
            latestScoringMethod === 'ai'
              ? 'bg-green-100 text-green-700 border-green-200'
              : latestScoringMethod === 'ai_fallback'
              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {latestScoringMethod === 'ai' ? 'AI Scored' : latestScoringMethod === 'ai_fallback' ? 'AI Partial' : 'Local Scoring'}
          </span>
        )}
      </div>

      <ProgressChart
        snapshots={snapshotsResult.data ?? []}
        domainStats={domainStats}
      />

      {/* Pool status badges */}
      {poolStatus.some((p) => p.allCompleted) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Lesson Pool Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {poolStatus.map((p) => (
                <span
                  key={p.domain}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
                    p.allCompleted
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  {DOMAIN_ICONS[p.domain as Domain]} {DOMAIN_LABELS[p.domain as Domain]}
                  {p.allCompleted
                    ? ' - All done! Fresh practice active'
                    : ` ${p.completed}/${p.total}`}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAttempts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No lessons completed yet.</p>
          ) : (
            <div className="space-y-2">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm font-medium">
                    {(attempt.lessons as { title: string } | null)?.title ?? 'Lesson'}
                  </span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{attempt.score_pct?.toFixed(0)}%</span>
                    <span className="text-yellow-600 font-medium">+{attempt.xp_earned} XP</span>
                    <span>{attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
