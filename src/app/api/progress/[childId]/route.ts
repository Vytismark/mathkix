import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDomainPoolStatus } from '@/lib/questions/pool-tracker'

type Params = { params: Promise<{ childId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { childId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const { data: child } = await supabase
    .from('children')
    .select('id, name, xp_total, streak_days, school_grade')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Weekly snapshots (last 8 weeks)
  const { data: snapshots } = await supabase
    .from('progress_snapshots')
    .select('*')
    .eq('child_id', childId)
    .order('week_start', { ascending: false })
    .limit(8)

  // Mastery by domain
  const { data: mastery } = await supabase
    .from('child_standard_mastery')
    .select('standard_code, mastery_level')
    .eq('child_id', childId)

  // Recent attempts
  const { data: recentAttempts } = await supabase
    .from('lesson_attempts')
    .select('id, score_pct, xp_earned, completed_at, lessons(title, domain)')
    .eq('child_id', childId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10)

  // Aggregate mastery by domain
  const domainMastery: Record<string, { total: number; sum: number }> = {}
  for (const m of mastery ?? []) {
    const domain = m.standard_code?.split('.')[1] ?? 'Unknown'
    if (!domainMastery[domain]) domainMastery[domain] = { total: 0, sum: 0 }
    domainMastery[domain].total++
    domainMastery[domain].sum += m.mastery_level
  }

  const domainStats = Object.entries(domainMastery).map(([domain, { total, sum }]) => ({
    domain,
    avg_mastery: total > 0 ? Math.round((sum / (total * 3)) * 100) : 0,
  }))

  // Pool status per domain
  const poolStatus = await getDomainPoolStatus(supabase, childId, child.school_grade ?? 2)

  return NextResponse.json({
    child,
    snapshots: snapshots ?? [],
    domainStats,
    recentAttempts: recentAttempts ?? [],
    poolStatus,
  })
}
