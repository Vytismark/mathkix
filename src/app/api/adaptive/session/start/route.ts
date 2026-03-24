// ============================================================
// Session Start - Structured Adaptive Sessions
//
// Uses the session composer to build a structured sequence of:
//   - Instruction segments (teaching new standards)
//   - Practice segments (reinforcement)
//   - Review segments (spaced repetition)
//
// Falls back to flat practice-only sessions when no authored
// lesson content exists for the selected standards.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireActiveSubscription } from '@/lib/subscription-guard'
import { captureServerEvent } from '@/lib/posthog/server'
import type { Domain } from '@/types/quiz'
import type { SRItem, TopicAffinity, MixedQuestion } from '@/types/adaptive'
import {
  createEngineState,
  serialiseEngineState,
} from '@/lib/adaptive/engine'
import { composeSession } from '@/lib/adaptive/session-composer'
import { createDefaultModalityScores, type ModalityScores } from '@/types/lesson-content'
import type { Json } from '@/types/database'

export const dynamic = 'force-dynamic'

// ── Interleave questions from multiple domains ─────────────

function interleave<T extends { domain: string }>(items: T[]): T[] {
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

  // Parallelize subscription check + child profile
  const [blocked, { data: child, error: childError }] = await Promise.all([
    requireActiveSubscription(user.id),
    supabase.from('children')
      .select('id, domain_mastery, school_grade, attention_span, span_question_offset, learning_pace, challenge_preference, motivation_style, modality_scores, preferred_modality')
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
  const overallGrade = child.school_grade ?? 2
  const attentionSpan = (child.attention_span ?? 'medium') as 'short' | 'medium' | 'long'
  const spanQuestionOffset = child.span_question_offset ?? 0

  // Parallelize SR items, affinity, session creation, mastery, and recent sessions
  const [
    { data: srItems },
    { data: affinityRows },
    { data: session, error: sessionError },
    { data: masteryRows },
    { data: recentSessions },
  ] = await Promise.all([
    supabase.from('spaced_repetition_items').select('*').eq('child_id', childId).lte('next_review_at', lookahead).order('next_review_at'),
    supabase.from('topic_affinity').select('*').eq('child_id', childId),
    supabase.from('practice_sessions')
      .insert({ child_id: childId, status: 'active', engine_state: {} as Json, engagement_summary: {} as Json })
      .select('id')
      .single(),
    supabase.from('child_standard_mastery').select('standard_code, mastery_level').eq('child_id', childId),
    // Fetch last 3 sessions for staleness/recency data
    supabase.from('practice_sessions')
      .select('engine_state')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(3),
  ])

  if (sessionError || !session) {
    return NextResponse.json({ error: sessionError?.message ?? 'Failed to create session' }, { status: 500 })
  }

  const masteryMap = new Map((masteryRows ?? []).map((m) => [m.standard_code, m.mastery_level]))

  // Build recent standards set from last 3 sessions
  const recentStandards = new Set<string>()
  for (const rs of recentSessions ?? []) {
    const state = rs.engine_state as { mixedQuestions?: Array<{ standard_code?: string }> } | null
    if (state?.mixedQuestions) {
      for (const q of state.mixedQuestions) {
        if (q.standard_code) recentStandards.add(q.standard_code)
      }
    }
  }

  // Parse modality scores (with fallback to defaults)
  const modalityScores: ModalityScores = (child.modality_scores as ModalityScores | null)
    ?? createDefaultModalityScores()

  // ── Compose session (new structured approach) ─────────────
  const composed = await composeSession(supabase, {
    childId,
    gradeLevel: overallGrade,
    attentionSpan,
    spanQuestionOffset,
    domainMastery,
    masteryMap,
    srItems: (srItems ?? []) as SRItem[],
    affinityRows: (affinityRows ?? []) as TopicAffinity[],
    modalityScores,
    childPreferences: {
      learning_pace: child.learning_pace ?? 'average',
      challenge_preference: child.challenge_preference ?? 'balanced',
      motivation_style: child.motivation_style ?? 'encouragement',
    },
    lastUsedModality: (child.preferred_modality as 'visual' | 'story' | 'procedural' | 'interactive' | 'challenge') ?? null,
    recentStandards,
    sessionsSinceMap: new Map(),
  })

  // ── Build engine state ──────────────────────────────────
  const engineState = createEngineState(
    childId,
    session.id,
    domainMastery,
    (srItems ?? []) as SRItem[],
    (affinityRows ?? []) as TopicAffinity[],
    overallGrade
  )

  if (composed.isSegmented) {
    // ── New: segment-based session ──────────────────────────
    const engineStateWithSegments = {
      ...serialiseEngineState(engineState),
      segments: composed.segments,
      isSegmented: true,
    }

    await supabase
      .from('practice_sessions')
      .update({ engine_state: engineStateWithSegments as unknown as Json })
      .eq('id', session.id)

    // Count total questions across all segments
    const totalQuestions = composed.segments.reduce((sum, seg) => {
      if (seg.type === 'practice' || seg.type === 'review') return sum + seg.questions.length
      if (seg.type === 'instruction') return sum + (seg.content.practiceQuestions?.length ?? 0)
      return sum
    }, 0)

    // Analytics (fire-and-forget)
    fireAnalytics(supabase, user.id, childId, session.id, child.school_grade ?? 0, totalQuestions, engineState.srDueThisSession.length, composed.segments)

    return NextResponse.json({
      sessionId: session.id,
      segments: composed.segments,
      isSegmented: true,
      totalEstimatedMinutes: composed.totalEstimatedMinutes,
      srDueCount: engineState.srDueThisSession.length,
      gradeLevel: child.school_grade ?? 0,
      // Backward compat: also send flat questions for old clients
      questions: [],
      totalXP: 0,
    })
  }

  // ── Fallback: practice-only session (current behavior) ────
  const fallback = composed.fallbackQuestions ?? []

  if (fallback.length === 0) {
    return NextResponse.json(
      { error: 'No questions found. Please add lesson content first.' },
      { status: 500 }
    )
  }

  const mixed: MixedQuestion[] = fallback.map((q) => ({
    id: q.id,
    text: q.text,
    type: q.type,
    options: q.options,
    correct_answer: q.correct_answer,
    domain: q.domain,
    standard_code: q.standard_code,
    difficulty: q.difficulty,
    xp_per_correct: Math.round(q.xp_reward / 5),
    lesson_id: q.lesson_id,
  }))

  const final = renumber(interleave(mixed))

  const engineStateWithQuestions = {
    ...serialiseEngineState(engineState),
    mixedQuestions: final,
    isSegmented: false,
  }

  await supabase
    .from('practice_sessions')
    .update({ engine_state: engineStateWithQuestions as unknown as Json })
    .eq('id', session.id)

  fireAnalytics(supabase, user.id, childId, session.id, child.school_grade ?? 0, final.length, engineState.srDueThisSession.length, null)

  return NextResponse.json({
    sessionId: session.id,
    questions: final,
    isSegmented: false,
    totalXP: final.reduce((s, q) => s + q.xp_per_correct, 0),
    srDueCount: engineState.srDueThisSession.length,
    gradeLevel: child.school_grade ?? 0,
  })
}

// ── Analytics helper (fire-and-forget) ───────────────────────

function fireAnalytics(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  userId: string,
  childId: string,
  sessionId: string,
  grade: number,
  questionCount: number,
  srDueCount: number,
  segments: unknown[] | null,
) {
  ;(async () => {
    try {
      const { count: prevSessionCount } = await supabase
        .from('practice_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', childId)
        .neq('id', sessionId)
      const isFirst = (prevSessionCount ?? 0) === 0
      await captureServerEvent(userId, isFirst ? 'first_session_started' : 'session_started', {
        child_id: childId,
        session_id: sessionId,
        question_count: questionCount,
        grade,
        is_first: isFirst,
        is_segmented: segments !== null,
        segment_count: segments?.length ?? 0,
      })
    } catch {}
  })()

  supabase.from('behavioral_events').insert({
    child_id: childId,
    session_id: sessionId,
    event_type: 'session_start',
    metadata: {
      sr_due_count: srDueCount,
      question_count: questionCount,
      is_segmented: segments !== null,
    } as Json,
  }).then(() => {})
}
