import Link from 'next/link'
import type { Domain, DomainScores } from '@/types/quiz'
import { getDomainsForGrade } from '@/types/quiz'
import { createClient } from '@/lib/supabase/server'
import { DOMAIN_LABELS, DOMAIN_ICONS, DOMAIN_COLORS } from '@/lib/quiz/levelMapping'

export default async function QuizResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ scores?: string; reasoning?: string; child?: string; scoring?: string }>
}) {
  const { scores, reasoning, child: childId, scoring } = await searchParams

  // Parse domain scores from URL
  let domainScores: DomainScores | null = null
  try {
    if (scores) domainScores = JSON.parse(decodeURIComponent(scores)) as DomainScores
  } catch { /* ignore */ }

  const decodedReasoning = reasoning ? decodeURIComponent(reasoning) : ''

  // Determine grade-specific domains
  let gradeLevel = 3 // default
  if (childId) {
    const supabase = await createClient()
    const { data: childRow } = await supabase
      .from('children')
      .select('school_grade')
      .eq('id', childId)
      .single()
    if (childRow) gradeLevel = childRow.school_grade ?? 3
  } else if (domainScores) {
    // Infer from scores: if NF is missing, likely G1-2
    const hasNF = domainScores.NF !== undefined
    if (!hasNF) gradeLevel = 2
  }
  const gradeDomains = getDomainsForGrade(gradeLevel)

  // Find weakest domain (lowest score)
  let weakestDomain: Domain = gradeDomains[0]
  if (domainScores) {
    weakestDomain = (gradeDomains as readonly Domain[]).reduce((weakest, d) =>
      (domainScores![d] ?? 100) < (domainScores![weakest] ?? 100) ? d : weakest
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      {/* Header */}
      <div className="text-6xl mb-4 animate-bounce">🎉</div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-1">Quiz complete!</h1>
      <p className="text-gray-500 mb-8">Here&apos;s your math breakdown:</p>

      {/* Domain bars card */}
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl p-6 mb-6 space-y-4 shadow-sm">
        {(gradeDomains as readonly Domain[]).map((d) => {
          const score     = domainScores?.[d] ?? 0
          const color     = DOMAIN_COLORS[d]
          const isWeakest = d === weakestDomain && domainScores !== null

          return (
            <div key={d}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{DOMAIN_ICONS[d]}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {DOMAIN_LABELS[d]}
                  </span>
                  {isWeakest && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: color.bg, color: color.hex, border: `1px solid ${color.border}` }}
                    >
                      Biggest gap
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold" style={{ color: color.hex }}>
                  {score}%
                </span>
              </div>

              {/* Bar */}
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width:      `${score}%`,
                    background: `linear-gradient(90deg, ${color.hex}cc, ${color.hex})`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Claude reasoning */}
      {decodedReasoning && (
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-4 mb-6 text-left shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
            What this means
          </p>
          <p className="text-sm leading-relaxed text-gray-700">{decodedReasoning}</p>
        </div>
      )}

      {/* Scoring method badge (subtle, for parent awareness) */}
      {scoring && (
        <div className="mb-4">
          {scoring === 'ai' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
              AI Scored
            </span>
          )}
          {scoring === 'ai_fallback' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
              AI Partial
            </span>
          )}
          {scoring === 'local_fallback' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              Local Scoring
            </span>
          )}
        </div>
      )}

      {/* Weakest domain callout */}
      {domainScores && (
        <div
          className="w-full max-w-sm rounded-2xl p-4 mb-6 text-left"
          style={{
            background: DOMAIN_COLORS[weakestDomain].bg,
            border:     `1.5px solid ${DOMAIN_COLORS[weakestDomain].border}`,
          }}
        >
          <p className="text-sm font-semibold" style={{ color: DOMAIN_COLORS[weakestDomain].hex }}>
            {DOMAIN_ICONS[weakestDomain]} We&apos;ll start with {DOMAIN_LABELS[weakestDomain]}
          </p>
          <p className="text-xs mt-1 text-gray-600">
            Your lessons will focus here first to close the gap.
          </p>
        </div>
      )}

      {/* CTA */}
      <Link
        href={childId ? `/play/home?child=${childId}` : '/select'}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold px-10 py-4 rounded-2xl transition-all active:scale-95"
      >
        Start learning! ✨
      </Link>
    </div>
  )
}
