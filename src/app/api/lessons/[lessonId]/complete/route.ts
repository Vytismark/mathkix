import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireActiveSubscription } from '@/lib/subscription-guard'
import { enqueueEmail, DRIP_KEYS } from '@/lib/email/drip-queue'
import { scoreLesson, calculateXP, getMasteryDelta } from '@/lib/quiz/scoring'
import { scoreToSRQuality, applyReview, createInitialSRItem } from '@/lib/adaptive/spaced-repetition'
import type { LessonQuestion } from '@/types/curriculum'
import type { Domain } from '@/types/quiz'
import type { SRItem } from '@/types/adaptive'
import type { Json } from '@/types/database'

type Params = { params: Promise<{ lessonId: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocked = await requireActiveSubscription(user.id)
  if (blocked) return blocked

  const { childId, answers, timeSpentSec } = await request.json()
  // answers: Record<number, string> - {questionId: answerGiven}

  // Verify child ownership
  const { data: child } = await supabase
    .from('children')
    .select('id, name, xp_total, streak_days, last_active')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  // Fetch the lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  // Check for duplicate submission (same child + lesson completed in last 60 seconds)
  const { data: recentAttempt } = await supabase
    .from('lesson_attempts')
    .select('id, completed_at')
    .eq('child_id', childId)
    .eq('lesson_id', lessonId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (recentAttempt?.completed_at) {
    const timeSince = Date.now() - new Date(recentAttempt.completed_at).getTime()
    if (timeSince < 60_000) {
      return NextResponse.json(
        { error: 'This lesson was just completed. Please wait before retrying.' },
        { status: 409 },
      )
    }
  }

  const questions = lesson.questions as unknown as LessonQuestion[]
  const { results, score_pct, correct_count } = scoreLesson(questions, answers)
  const xpEarned = calculateXP(lesson.xp_reward, score_pct)
  const masteryDelta = getMasteryDelta(score_pct)

  // Save lesson attempt
  await supabase.from('lesson_attempts').insert({
    child_id: childId,
    lesson_id: lessonId,
    status: 'completed',
    score_pct,
    answers: results as unknown as Json,
    xp_earned: xpEarned,
    time_spent_sec: timeSpentSec ?? null,
    completed_at: new Date().toISOString(),
  })

  // ── Streak calculation ────────────────────────────────────
  const now = new Date()
  const lastActive = child.last_active ? new Date(child.last_active) : null
  const daysSinceLast = lastActive
    ? Math.floor((now.getTime() - lastActive.getTime()) / 86_400_000)
    : 999

  const newStreak =
    daysSinceLast === 0 ? (child.streak_days ?? 0)       // already practiced today
    : daysSinceLast === 1 ? (child.streak_days ?? 0) + 1 // continued streak
    : 1                                                    // streak broken, restart

  // ── Update XP, streak, last_active ───────────────────────
  const oldXP = child.xp_total ?? 0
  const newXP = oldXP + xpEarned

  await supabase
    .from('children')
    .update({
      xp_total: newXP,
      last_active: now.toISOString(),
      streak_days: newStreak,
    })
    .eq('id', childId)

  // Upsert mastery for this standard
  if (lesson.standard_code && masteryDelta > 0) {
    const { data: existing } = await supabase
      .from('child_standard_mastery')
      .select('mastery_level, attempts')
      .eq('child_id', childId)
      .eq('standard_code', lesson.standard_code)
      .maybeSingle()

    const currentMastery = existing?.mastery_level ?? 0
    const newMastery = Math.min(3, currentMastery + masteryDelta)

    await supabase.from('child_standard_mastery').upsert({
      child_id: childId,
      standard_code: lesson.standard_code,
      mastery_level: newMastery,
      attempts: (existing?.attempts ?? 0) + 1,
      last_attempted: new Date().toISOString(),
    })
  }

  // Upsert spaced repetition item for this standard
  if (lesson.standard_code) {
    const { data: existingSR } = await supabase
      .from('spaced_repetition_items')
      .select('*')
      .eq('child_id', childId)
      .eq('standard_code', lesson.standard_code)
      .maybeSingle()

    const quality = scoreToSRQuality(score_pct)

    if (existingSR) {
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
    } else if (score_pct >= 60) {
      const newItem = createInitialSRItem(
        childId,
        lesson.standard_code,
        lesson.domain as Domain,
        lesson.grade_level,
        score_pct
      )
      await supabase.from('spaced_repetition_items').insert(newItem)
    }
  }

  // ── Progress snapshot (weekly XP tracking) ─────────────────
  // Compute the Monday (start of ISO week) for today in UTC
  const weekStart = new Date(now)
  weekStart.setUTCHours(0, 0, 0, 0)
  const dayOfWeek = weekStart.getUTCDay() // 0=Sun, 1=Mon, ...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  weekStart.setUTCDate(weekStart.getUTCDate() + diff)
  const weekStartStr = weekStart.toISOString().slice(0, 10) // 'YYYY-MM-DD'

  // Fetch existing snapshot for this week to accumulate values
  const { data: existingSnapshot } = await supabase
    .from('progress_snapshots')
    .select('lessons_completed, xp_earned, avg_score_pct, domains_practiced')
    .eq('child_id', childId)
    .eq('week_start', weekStartStr)
    .maybeSingle()

  const snapPrevLessons = existingSnapshot?.lessons_completed ?? 0
  const snapPrevXP = existingSnapshot?.xp_earned ?? 0
  const snapPrevAvg = existingSnapshot?.avg_score_pct ?? null
  const snapPrevDomains = existingSnapshot?.domains_practiced ?? []

  const snapLessons = snapPrevLessons + 1
  const snapXP = snapPrevXP + xpEarned
  // Running average of score_pct
  const snapAvg = snapPrevAvg !== null
    ? Math.round((snapPrevAvg * snapPrevLessons + score_pct) / snapLessons)
    : score_pct
  // Merge domain if not already present
  const snapDomains = lesson.domain && !snapPrevDomains.includes(lesson.domain as string)
    ? [...snapPrevDomains, lesson.domain as string]
    : snapPrevDomains

  await supabase.from('progress_snapshots').upsert(
    {
      child_id: childId,
      week_start: weekStartStr,
      lessons_completed: snapLessons,
      xp_earned: snapXP,
      avg_score_pct: snapAvg,
      domains_practiced: snapDomains,
    },
    { onConflict: 'child_id,week_start' },
  )

  // Enqueue first-lesson-complete email (idempotent via UNIQUE key)
  enqueueEmail(
    user.id,
    DRIP_KEYS.FIRST_LESSON_COMPLETE,
    new Date(),
    { childName: child.name ?? null, xpEarned },
  ).catch(() => {})

  return NextResponse.json({
    score_pct,
    correct_count,
    total_questions: questions.length,
    xp_earned: xpEarned,
    results,
    streak_days: newStreak,
    lesson_domain: lesson.domain,
  })
}
