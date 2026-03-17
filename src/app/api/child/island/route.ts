// Returns the island data (domain mastery, streak, grade) for a child.
// Used by celebrate page and home page to render the IslandView.

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Domain } from '@/types/quiz'
import { getDomainsForGrade } from '@/types/quiz'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const childId = request.nextUrl.searchParams.get('child')
  if (!childId) return NextResponse.json({ error: 'child param required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch child
  const { data: child } = await supabase
    .from('children')
    .select('id, name, school_grade, xp_total, streak_days, last_active')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Fetch lessons to get domain per standard_code
  const { data: lessons } = await supabase
    .from('lessons')
    .select('standard_code, domain')
    .eq('grade_level', child.school_grade ?? 0)
    .eq('is_active', true)

  const standardToDomain = new Map<string, Domain>()
  for (const l of lessons ?? []) {
    if (l.standard_code) standardToDomain.set(l.standard_code, l.domain as Domain)
  }

  // Fetch standard mastery
  const standardCodes = [...standardToDomain.keys()]
  const { data: masteryRows } = standardCodes.length > 0
    ? await supabase
        .from('child_standard_mastery')
        .select('standard_code, mastery_level')
        .eq('child_id', childId)
        .in('standard_code', standardCodes)
    : { data: [] }

  // Compute per-domain mastery (average mastery_level / 3 * 100)
  const domainTotals: Record<string, { sum: number; count: number }> = {}
  for (const row of masteryRows ?? []) {
    const domain = standardToDomain.get(row.standard_code)
    if (!domain) continue
    if (!domainTotals[domain]) domainTotals[domain] = { sum: 0, count: 0 }
    domainTotals[domain].sum += row.mastery_level
    domainTotals[domain].count++
  }

  const domainMastery: Partial<Record<Domain, number>> = {}
  for (const domain of getDomainsForGrade(child.school_grade ?? 0)) {
    const t = domainTotals[domain]
    domainMastery[domain] = t
      ? Math.round((t.sum / t.count / 3) * 100)
      : 0
  }

  // Last active → days ago
  const lastActiveDaysAgo = child.last_active
    ? Math.floor((Date.now() - new Date(child.last_active).getTime()) / 86_400_000)
    : 999

  return NextResponse.json({
    gradeLevel: child.school_grade ?? 0,
    domainMastery,
    streakDays: child.streak_days ?? 0,
    lastActiveDaysAgo,
    childName: child.name,
    xpTotal: child.xp_total ?? 0,
  })
}
