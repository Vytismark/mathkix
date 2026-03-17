import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { Domain } from '@/types/quiz'
import { getDomainsForGrade } from '@/types/quiz'

export interface DomainPoolStatus {
  domain: Domain
  total: number
  completed: number
  allCompleted: boolean
}

/**
 * For each domain at the child's grade, count how many static lessons exist
 * vs how many distinct lessons the child has completed.
 * Used by the parent progress page to show pool exhaustion badges.
 */
export async function getDomainPoolStatus(
  supabase: SupabaseClient<Database>,
  childId: string,
  gradeLevel: number,
): Promise<DomainPoolStatus[]> {
  const domains = getDomainsForGrade(gradeLevel)

  // Count total lessons per domain at this grade
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, domain')
    .eq('grade_level', gradeLevel)
    .eq('is_active', true)

  // Count distinct completed lessons per domain
  const { data: attempts } = await supabase
    .from('lesson_attempts')
    .select('lesson_id, lessons!inner(domain, grade_level)')
    .eq('child_id', childId)
    .eq('status', 'completed')
    .eq('lessons.grade_level', gradeLevel)

  const totalByDomain: Partial<Record<Domain, Set<string>>> = {}
  const completedByDomain: Partial<Record<Domain, Set<string>>> = {}

  for (const d of domains) {
    totalByDomain[d] = new Set()
    completedByDomain[d] = new Set()
  }

  for (const l of lessons ?? []) {
    const d = l.domain as Domain
    totalByDomain[d]?.add(l.id)
  }

  for (const a of attempts ?? []) {
    const lessonData = a.lessons as unknown as { domain: string; grade_level: number }
    const d = lessonData.domain as Domain
    completedByDomain[d]?.add(a.lesson_id)
  }

  return domains.map((d) => {
    const total = totalByDomain[d]?.size ?? 0
    const completed = completedByDomain[d]?.size ?? 0
    return {
      domain: d,
      total,
      completed,
      allCompleted: total > 0 && completed >= total,
    }
  })
}
