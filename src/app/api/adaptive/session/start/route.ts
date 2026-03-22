// ============================================================
// Session Start - Question-Level Adaptive Selection
//
// Builds a pool of ALL questions for the child's grade, scores
// each individually based on mastery, SR urgency, difficulty fit,
// and domain weight, then picks the best mix for one session.
//
// Result: a session with easy questions for weak standards,
// hard questions for strong standards, across multiple domains.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireActiveSubscription } from '@/lib/subscription-guard'
import { captureServerEvent } from '@/lib/posthog/server'
import type { Domain } from '@/types/quiz'
import type { SRItem, TopicAffinity, MixedQuestion, QuestionScoringContext } from '@/types/adaptive'
import {
  createEngineState,
  serialiseEngineState,
  buildQuestionPool,
  selectSessionQuestions,
} from '@/lib/adaptive/engine'
import { overdueDays } from '@/lib/adaptive/spaced-repetition'
import { applyAffinityDecay } from '@/lib/adaptive/affinity'
import type { Json } from '@/types/database'

export const dynamic = 'force-dynamic'

// ── Question count per sitting ─────────────────────────────

function totalQuestions(span: string | null, offset: number = 0): number {
  const base = span === 'short' ? 5 : span === 'long' ? 9 : 7
  return Math.max(3, Math.min(13, base + offset))
}

// ── Interleave questions from multiple domains ─────────────

function interleave<T extends { domain: string }>(items: T[]): T[] {
  // Group by domain
  const groups = new Map<string, T[]>()
  for (const item of items) {
    if (!groups.has(item.domain)) groups.set(item.domain, [])
    groups.get(item.domain)!.push(item)
  }

  const arrays = [...groups.values()]
  const result: T[] = []
  const maxLen = Math.max(0, ...arrays.map((a) => a.length))
  for (let i = 0; i < maxLen; i++) {
    for (const arr of arrays) {
      if (i < arr.length) result.push(arr[i])
    }
  }
  return result
}

// ── Re-number question IDs after interleaving ─────────────

function renumber(questions: MixedQuestion[]): MixedQuestion[] {
  return questions.map((q, i) => ({ ...q, id: i + 1 }))
}

// ── Main handler ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { childId } = await request.json()
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const lookahead = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()

  // Parallelize subscription check + child profile (both only need user.id / childId)
  const [blocked, { data: child, error: childError }] = await Promise.all([
    requireActiveSubscription(user.id),
    supabase.from('children')
      .select('id, domain_mastery, school_grade, attention_span, span_question_offset')
      .eq('id', childId)
      .eq('profile_id', user.id)
      .single(),
  ])
  if (blocked) return blocked

  if (childError || !child) {
    return NextResponse.json(
      { error: childError?.message ?? 'Child not found' },
      { status: childError ? 500 : 404 }
    )
  }

  const domainMastery = (child.domain_mastery as Record<Domain, number>) ?? {}
  const overallGrade  = child.school_grade ?? 2
  const attentionSpan     = child.attention_span as 'short' | 'medium' | 'long' | null
  const spanQuestionOffset = child.span_question_offset ?? 0

  // Parallelize SR items, affinity, and session creation (all independent)
  const [{ data: srItems }, { data: affinityRows }, { data: session, error: sessionError }] = await Promise.all([
    supabase.from('spaced_repetition_items').select('*').eq('child_id', childId).lte('next_review_at', lookahead).order('next_review_at'),
    supabase.from('topic_affinity').select('*').eq('child_id', childId),
    supabase.from('practice_sessions')
      .insert({ child_id: childId, status: 'active', engine_state: {} as Json, engagement_summary: {} as Json })
      .select('id')
      .single(),
  ])

  if (sessionError || !session) {
    return NextResponse.json({ error: sessionError?.message ?? 'Failed to create session' }, { status: 500 })
  }

  // ── Build engine state ──────────────────────────────────
  const engineState = createEngineState(
    childId,
    session.id,
    domainMastery,
    (srItems ?? []) as SRItem[],
    (affinityRows ?? []) as TopicAffinity[],
    overallGrade
  )

  // ── Build question pool from ALL grade-level lessons ────
  const pool = await buildQuestionPool(supabase, overallGrade)

  if (pool.length === 0) {
    return NextResponse.json(
      { error: 'No questions found. Please add lesson content first.' },
      { status: 500 }
    )
  }

  // ── Load standard mastery for all standards in pool ─────
  const allStandardCodes = [...new Set(pool.map((q) => q.standard_code))]

  const { data: masteryRows } = allStandardCodes.length > 0
    ? await supabase
        .from('child_standard_mastery')
        .select('standard_code, mastery_level')
        .eq('child_id', childId)
        .in('standard_code', allStandardCodes)
    : { data: [] }

  const masteryMap = new Map((masteryRows ?? []).map((m) => [m.standard_code, m.mastery_level]))

  // ── Build SR lookup ─────────────────────────────────────
  const pendingSR = new Set(
    engineState.srDueThisSession.filter(
      (code) => !engineState.srCompletedThisSession.includes(code)
    )
  )

  const srItemMap = new Map(
    ((srItems ?? []) as SRItem[]).map((r) => [r.standard_code, r])
  )

  // ── Build affinity map ──────────────────────────────────
  const affinityMap = new Map<Domain, number>()
  for (const row of (affinityRows ?? []) as TopicAffinity[]) {
    const decayed = applyAffinityDecay(row.affinity_score, row.last_updated)
    affinityMap.set(row.domain, decayed)
  }

  // ── Build scoring context ───────────────────────────────
  const total = totalQuestions(attentionSpan, spanQuestionOffset)

  const ctx: QuestionScoringContext = {
    masteryMap,
    srItemMap,
    pendingSR,
    domainWeightMap: new Map(engineState.domainWeights.map((w) => [w.domain, w.finalWeight])),
    affinityMap,
    usedQuestionKeys: new Set<string>(),
    usedStandardCounts: new Map<string, number>(),
    usedDomainCounts: new Map<Domain, number>(),
    totalQuestions: total,
  }

  // ── Select questions ────────────────────────────────────
  const selected = selectSessionQuestions(pool, total, ctx)

  // ── Convert to MixedQuestion[] ──────────────────────────
  const mixed: MixedQuestion[] = selected.map((q) => ({
    id:             q.id,
    text:           q.text,
    type:           q.type,
    options:        q.options,
    correct_answer: q.correct_answer,
    domain:         q.domain,
    standard_code:  q.standard_code,
    difficulty:     q.difficulty,
    xp_per_correct: Math.round(q.xp_reward / 5),  // 5 questions per lesson
    lesson_id:      q.lesson_id,
  }))

  // ── Interleave across domains + renumber ─────────────────
  const final = renumber(interleave(mixed))

  if (final.length === 0) {
    return NextResponse.json(
      { error: 'No suitable questions found for this child.' },
      { status: 500 }
    )
  }

  // ── Persist engine state in session ───────────────────────
  const engineStateWithQuestions = {
    ...serialiseEngineState(engineState),
    mixedQuestions: final,
  }

  await supabase
    .from('practice_sessions')
    .update({ engine_state: engineStateWithQuestions as unknown as Json })
    .eq('id', session.id)

  // Check first session for analytics — fire-and-forget so it doesn't block response
  // Analytics: fire-and-forget after response is sent
  supabase
    .from('practice_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('child_id', childId)
    .neq('id', session.id)
    .then(({ count: prevSessionCount }) => {
      const isFirst = (prevSessionCount ?? 0) === 0
      captureServerEvent(user.id, isFirst ? 'first_session_started' : 'session_started', {
        child_id: childId,
        session_id: session.id,
        question_count: final.length,
        grade: child.school_grade ?? 0,
        is_first: isFirst,
      }).catch(() => {})
    }).catch(() => {})

  supabase.from('behavioral_events').insert({
    child_id:   childId,
    session_id: session.id,
    event_type: 'session_start',
    metadata:   {
      sr_due_count: engineState.srDueThisSession.length,
      question_count: final.length,
      domains: [...new Set(final.map((q) => q.domain))],
    } as Json,
  }).then(() => {})

  return NextResponse.json({
    sessionId:   session.id,
    questions:   final,
    totalXP:     final.reduce((s, q) => s + q.xp_per_correct, 0),
    srDueCount:  engineState.srDueThisSession.length,
    gradeLevel:  child.school_grade ?? 0,
  })
}
