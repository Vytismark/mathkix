import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDomainsForGrade } from '@/types/quiz'
import type { Domain, DomainScores } from '@/types/quiz'

// GET /api/lessons?childId=xxx
// Returns lessons ordered by weakest domain first, using domain_mastery.
// All content served at school_grade (the parent-selected grade).
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const childId = request.nextUrl.searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  // Load child - we need mastery and grade info
  const { data: child } = await supabase
    .from('children')
    .select('school_grade, placement_done, domain_mastery')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  const domainMastery  = child.domain_mastery  as unknown as DomainScores | null
  const placementDone  = child.placement_done  ?? false
  const grade          = child.school_grade ?? 2

  // ── Build an ordered domain list: weakest first ───────────────────────────
  let orderedDomains: { domain: Domain; grade: number }[]

  if (placementDone && domainMastery) {
    // Sort domains by mastery % ascending (weakest first)
    const gradeDomains = getDomainsForGrade(grade)
    orderedDomains = (gradeDomains as readonly Domain[])
      .map((d) => ({
        domain: d,
        mastery: domainMastery[d] ?? 50,
        grade,
      }))
      .sort((a, b) => a.mastery - b.mastery)
      .map(({ domain, grade: g }) => ({ domain, grade: g }))
  } else {
    // No placement yet - serve all domains at school_grade, standard order
    const gradeDomains = getDomainsForGrade(grade)
    orderedDomains = (gradeDomains as readonly Domain[]).map((d) => ({
      domain: d,
      grade,
    }))
  }

  // ── Fetch lessons per domain+grade, collect until we have enough ──────────
  const TARGET_LESSONS = 10
  const allLessons: Record<string, unknown>[] = []
  const seenIds = new Set<string>()

  for (const { domain, grade } of orderedDomains) {
    if (allLessons.length >= TARGET_LESSONS) break

    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, grade_level, domain, standard_code, title, description, lesson_type, difficulty, xp_reward, sort_order')
      .eq('domain',      domain)
      .eq('grade_level', grade)
      .eq('is_active',   true)
      .order('sort_order', { ascending: true })

    for (const lesson of lessons ?? []) {
      if (!seenIds.has(lesson.id)) {
        seenIds.add(lesson.id)
        allLessons.push(lesson)
      }
    }
  }

  // ── If still under target, pad with any remaining active lessons ──────────
  if (allLessons.length < TARGET_LESSONS) {
    const seenArr = Array.from(seenIds)
    const { data: extra } = await supabase
      .from('lessons')
      .select('id, grade_level, domain, standard_code, title, description, lesson_type, difficulty, xp_reward, sort_order')
      .eq('is_active', true)
      .not('id', 'in', seenArr.length > 0 ? `(${seenArr.map((id) => `"${id}"`).join(',')})` : '("")')
      .order('sort_order', { ascending: true })
      .limit(TARGET_LESSONS - allLessons.length)

    for (const lesson of extra ?? []) {
      allLessons.push(lesson)
    }
  }

  // ── Enrich with child's per-standard mastery level ────────────────────────
  const standardCodes = allLessons
    .map((l) => (l as { standard_code?: string | null }).standard_code)
    .filter(Boolean) as string[]

  const { data: mastery } = standardCodes.length > 0
    ? await supabase
        .from('child_standard_mastery')
        .select('standard_code, mastery_level')
        .eq('child_id', childId)
        .in('standard_code', standardCodes)
    : { data: [] }

  const masteryMap = Object.fromEntries(
    (mastery ?? []).map((m) => [m.standard_code, m.mastery_level])
  )

  const enriched = allLessons.map((lesson) => {
    const l = lesson as { standard_code?: string | null; [key: string]: unknown }
    return {
      ...l,
      mastery_level: l.standard_code ? (masteryMap[l.standard_code] ?? 0) : 0,
    }
  })

  // ── Meta: expose which domain is weakest for the UI ───────────────────────
  const weakestDomain = orderedDomains[0]?.domain ?? null

  return NextResponse.json({ lessons: enriched, weakestDomain })
}
