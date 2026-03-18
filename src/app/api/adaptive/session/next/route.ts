import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireActiveSubscription } from '@/lib/subscription-guard'
import type { Domain } from '@/types/quiz'
import type { SRItem, TopicAffinity, EngagementWindow, EarnedAchievement } from '@/types/adaptive'
import {
  deserialiseEngineState,
} from '@/lib/adaptive/engine'
import {
  processAnswer,
  shouldSuggestSessionEnd,
} from '@/lib/adaptive/engagement'
import {
  applyReview,
  scoreToSRQuality,
  createInitialSRItem,
} from '@/lib/adaptive/spaced-repetition'
import {
  computeAffinityDelta,
  applyScoreAdjustment,
} from '@/lib/adaptive/affinity'
import {
  checkAchievements,
  buildAchievementRow,
} from '@/lib/adaptive/achievements'
import type { Json } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocked = await requireActiveSubscription(user.id)
  if (blocked) return blocked

  const {
    sessionId,
    childId,
    lessonId,
    score_pct,
    time_spent_ms,
    emoji,              // 'positive' | 'negative' | null
    isSRReview,
    engagementWindowJson, // serialised EngagementWindow from client
  }: {
    sessionId: string
    childId: string
    lessonId: string
    score_pct: number
    time_spent_ms: number
    emoji: 'positive' | 'negative' | null
    isSRReview: boolean
    engagementWindowJson: EngagementWindow
  } = await request.json()

  if (!sessionId || !childId || !lessonId) {
    return NextResponse.json({ error: 'sessionId, childId, lessonId required' }, { status: 400 })
  }

  // Verify child ownership
  const { data: child } = await supabase
    .from('children')
    .select('id, domain_mastery, school_grade, xp_total, streak_days')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()
  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  // Load session
  const { data: session } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('child_id', childId)
    .single()
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  // Load the lesson that was just completed
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, domain, standard_code, grade_level')
    .eq('id', lessonId)
    .single()
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  const correct = score_pct >= 60
  const domain = lesson.domain as Domain

  // ── 1. Update engagement window ──────────────────────────
  const { window: updatedEngagement, signal } = processAnswer(
    engagementWindowJson,
    time_spent_ms,
    correct
  )

  // ── 2. Spaced repetition update ───────────────────────────
  if (lesson.standard_code) {
    const quality = scoreToSRQuality(score_pct)
    const { data: existingSR } = await supabase
      .from('spaced_repetition_items')
      .select('*')
      .eq('child_id', childId)
      .eq('standard_code', lesson.standard_code)
      .maybeSingle()

    if (existingSR && isSRReview) {
      // Apply SM-2 review
      const updated = applyReview(existingSR as SRItem, quality)
      await supabase.from('spaced_repetition_items').update({
        ease_factor:      updated.ease_factor,
        interval_days:    updated.interval_days,
        repetitions:      updated.repetitions,
        next_review_at:   updated.next_review_at.toISOString(),
        last_reviewed_at: updated.last_reviewed_at.toISOString(),
        last_score_pct:   score_pct,
        times_reviewed:   (existingSR.times_reviewed ?? 0) + 1,
      }).eq('id', existingSR.id)
    } else if (!existingSR && score_pct >= 60) {
      // First time encountering this standard successfully - create SR item
      const newItem = createInitialSRItem(
        childId,
        lesson.standard_code,
        domain,
        lesson.grade_level,
        score_pct
      )
      await supabase.from('spaced_repetition_items').insert(newItem)
    } else if (existingSR && !isSRReview && score_pct >= 60) {
      // Regular lesson on already-tracked standard - update last score
      await supabase.from('spaced_repetition_items')
        .update({ last_score_pct: score_pct })
        .eq('id', existingSR.id)
    }
  }

  // ── 3. Behavioral event ───────────────────────────────────
  const eventType = correct ? 'answer_correct' : 'answer_wrong'
  supabase.from('behavioral_events').insert({
    child_id:      childId,
    session_id:    sessionId,
    event_type:    eventType,
    domain:        domain,
    standard_code: lesson.standard_code,
    question_id:   lessonId,
    time_ms:       time_spent_ms,
    metadata: {
      score_pct,
      is_sr_review: isSRReview,
      emoji: emoji ?? null,
    } as Json,
  }).then(() => {})

  // Emoji event if provided
  if (emoji) {
    supabase.from('behavioral_events').insert({
      child_id:   childId,
      session_id: sessionId,
      event_type: 'emoji_reaction',
      domain:     domain,
      metadata:   { emoji } as Json,
    }).then(() => {})
  }

  // ── 4. Topic affinity update ──────────────────────────────
  const { data: currentAffinity } = await supabase
    .from('topic_affinity')
    .select('*')
    .eq('child_id', childId)
    .eq('domain', domain)
    .maybeSingle()

  const affinityEvents = [
    {
      child_id: childId, session_id: sessionId,
      event_type: eventType as import('@/types/adaptive').BehavioralEventType,
      domain, standard_code: lesson.standard_code,
      question_id: lessonId, time_ms: time_spent_ms,
      metadata: { emoji } as Record<string, unknown>,
    },
    ...(emoji ? [{
      child_id: childId, session_id: sessionId,
      event_type: 'emoji_reaction' as import('@/types/adaptive').BehavioralEventType,
      domain, standard_code: null as string | null, question_id: null as string | null,
      time_ms: null as number | null,
      metadata: { emoji } as Record<string, unknown>,
    }] : []),
  ]

  const avgResponseMs = currentAffinity?.avg_response_ms ?? time_spent_ms
  const delta = computeAffinityDelta(affinityEvents, avgResponseMs)
  const scoreAdj = (delta as Record<string, unknown>)._scoreAdjustment as number | undefined

  if (currentAffinity) {
    const newScore = scoreAdj
      ? applyScoreAdjustment(currentAffinity.affinity_score, scoreAdj, currentAffinity.sessions_in_domain)
      : currentAffinity.affinity_score
    await supabase.from('topic_affinity').update({
      affinity_score:     newScore,
      emoji_positive:     (currentAffinity.emoji_positive ?? 0) + (emoji === 'positive' ? 1 : 0),
      emoji_negative:     (currentAffinity.emoji_negative ?? 0) + (emoji === 'negative' ? 1 : 0),
      avg_response_ms:    Math.round(((currentAffinity.avg_response_ms ?? time_spent_ms) + time_spent_ms) / 2),
      correct_streak_best: Math.max(currentAffinity.correct_streak_best ?? 0, updatedEngagement.correctStreak),
      last_updated:       new Date().toISOString(),
    }).eq('id', currentAffinity.id)
  } else {
    await supabase.from('topic_affinity').insert({
      child_id:            childId,
      domain:              domain,
      affinity_score:      50 + (scoreAdj ?? 0),
      sessions_in_domain:  1,
      correct_streak_best: updatedEngagement.correctStreak,
      avg_response_ms:     time_spent_ms,
      emoji_positive:      emoji === 'positive' ? 1 : 0,
      emoji_negative:      emoji === 'negative' ? 1 : 0,
    })
  }

  // ── 5. Achievement check ──────────────────────────────────
  const { data: existingAchievements } = await supabase
    .from('achievements')
    .select('achievement_code')
    .eq('child_id', childId)

  const existingCodes = (existingAchievements ?? []).map((a) => a.achievement_code)

  // Load data needed for achievement check
  const { data: lessonAttempts } = await supabase
    .from('lesson_attempts')
    .select('score_pct, standard_code:lesson_id')
    .eq('child_id', childId)
    .eq('status', 'completed')

  const perfectLessons = (lessonAttempts ?? []).filter((a) => a.score_pct === 100).length

  // Lessons in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentAttempts } = await supabase
    .from('lesson_attempts')
    .select('id')
    .eq('child_id', childId)
    .gte('completed_at', weekAgo)

  const { data: srReviewed } = await supabase
    .from('spaced_repetition_items')
    .select('times_reviewed')
    .eq('child_id', childId)

  const totalSRReviewed = (srReviewed ?? []).reduce((s, i) => s + (i.times_reviewed ?? 0), 0)

  const domainMastery = (child.domain_mastery as Record<Domain, number>) ?? {}

  const achievementState = {
    streak_days:          child.streak_days ?? 0,
    domain_mastery:       domainMastery,
    sr_items_reviewed:    totalSRReviewed,
    perfect_lessons:      perfectLessons,
    lessons_completed:    lessonAttempts?.length ?? 0,
    last_lesson_score:    score_pct,
    last_lesson_standard: lesson.standard_code,
    standard_best_scores: {},
    avg_response_ms:      time_spent_ms,
    existing_codes:       existingCodes,
    recent_week_lessons:  recentAttempts?.length ?? 0,
  }

  const newAchievementDefs = checkAchievements(achievementState, existingCodes)
  const newAchievements: EarnedAchievement[] = []

  if (newAchievementDefs.length > 0) {
    const rows = newAchievementDefs.map((def) => buildAchievementRow(childId, def))
    type AchievementInsert = import('@/types/database').Database['public']['Tables']['achievements']['Insert']
    const { data: inserted } = await supabase
      .from('achievements')
      .insert(rows.map((r) => ({ ...r, metadata: r.metadata as import('@/types/database').Json })) as AchievementInsert[])
      .select()

    if (inserted) {
      newAchievements.push(...(inserted as unknown as EarnedAchievement[]))
    }

    // Award XP for achievements
    const achievementXP = newAchievementDefs.reduce((s, d) => s + d.xp_bonus, 0)
    if (achievementXP > 0) {
      await supabase
        .from('children')
        .update({ xp_total: (child.xp_total ?? 0) + achievementXP })
        .eq('id', childId)
    }
  }

  // ── 6. Update session counters ────────────────────────────
  const newQuestionsAnswered = (session.questions_answered ?? 0) + 1
  const newCorrectCount = (session.correct_count ?? 0) + (correct ? 1 : 0)

  await supabase.from('practice_sessions').update({
    questions_answered: newQuestionsAnswered,
    correct_count:      newCorrectCount,
    engine_state:       deserialiseEngineState(session.engine_state) as unknown as Json,
  }).eq('id', sessionId)

  // ── 7. Session state ─────────────────────────────────────
  // Questions are pre-selected at session start. No need to
  // pick the next lesson here - the client already has all questions.
  const sessionComplete = shouldSuggestSessionEnd(updatedEngagement, newQuestionsAnswered)

  return NextResponse.json({
    nextLesson:       null,
    sessionComplete,
    engagementSignal: signal,
    newAchievements,
    domainSwitched:   false,
    engagementWindow: updatedEngagement,
  })
}
