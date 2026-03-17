import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Domain } from '@/types/quiz'
import { getDomainsForGrade } from '@/types/quiz'

export const dynamic = 'force-dynamic'

/**
 * Returns SR items due in the next 24 hours, grouped by domain.
 * Used by the home page to show a "reviews due" badge.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const childId = searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  // Verify child ownership
  const { data: child } = await supabase
    .from('children')
    .select('id, school_grade')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()
  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data: dueItems } = await supabase
    .from('spaced_repetition_items')
    .select('id, domain, next_review_at')
    .eq('child_id', childId)
    .lte('next_review_at', cutoff)
    .order('next_review_at')

  const gradeDomains = getDomainsForGrade(child.school_grade ?? 0)
  const dueCounts = gradeDomains.reduce(
    (acc, d) => ({ ...acc, [d]: 0 }),
    {} as Partial<Record<Domain, number>>
  )

  let nextDueAt: string | null = null

  for (const item of dueItems ?? []) {
    const d = item.domain as Domain
    if (gradeDomains.includes(d)) {
      dueCounts[d] = (dueCounts[d] ?? 0) + 1
    }
    if (!nextDueAt || item.next_review_at < nextDueAt) {
      nextDueAt = item.next_review_at
    }
  }

  const totalDue = Object.values(dueCounts).reduce((s, n) => s + n, 0)

  return NextResponse.json({ dueCounts, totalDue, nextDueAt })
}
