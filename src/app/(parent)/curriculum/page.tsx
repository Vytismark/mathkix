import Link from 'next/link'
import { getGradeBank } from '@/data/questions'
import { getDomainsForGrade } from '@/types/quiz'
import type { Domain } from '@/types/quiz'
import {
  DOMAIN_LABELS,
  DOMAIN_ICONS,
  DOMAIN_COLORS,
  DOMAIN_DESCRIPTIONS,
} from '@/lib/quiz/levelMapping'
import { CurriculumView } from '@/components/parent/CurriculumView'
import { createClient } from '@/lib/supabase/server'

export default async function CurriculumPage() {
  // Try to get the first child's grade to default the tab
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let defaultGrade = 1

  if (user) {
    const { data: firstChild } = await supabase
      .from('children')
      .select('school_grade')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (firstChild?.school_grade) {
      defaultGrade = firstChild.school_grade
    }
  }

  // Build grade data from static question bank
  const grades = ([1, 2, 3, 4, 5] as const).map((g) => {
    const bank = getGradeBank(g)
    const activeDomains = getDomainsForGrade(g)

    const domains = activeDomains.map((d: Domain) => {
      const domainPrefix = `${g}.${d}`
      const domainStandards = bank.standards
        .filter((s) => s.domain === domainPrefix)
        .map((s) => ({ code: s.code, title: s.title }))

      return {
        key: d,
        label: DOMAIN_LABELS[d],
        icon: DOMAIN_ICONS[d],
        description: DOMAIN_DESCRIPTIONS[d],
        color: DOMAIN_COLORS[d],
        standards: domainStandards,
      }
    })

    return {
      grade: g,
      totalStandards: bank.totalStandards,
      domains,
    }
  })

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors mb-5"
      >
        ← Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Our Curriculum</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          MathKix teaches the full Common Core Math curriculum for grades 1-5.
          Every standard includes adaptive lessons, practice questions, and spaced
          repetition — all personalized to your child&apos;s level.
        </p>
      </div>

      <CurriculumView grades={grades} defaultGrade={defaultGrade} />
    </div>
  )
}
