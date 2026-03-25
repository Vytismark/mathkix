// ============================================================
// Session Complete - processes all answers from a mixed session
//
// Replaces the old lesson/complete + session/next cycle.
// Called once when the child finishes all questions in a sitting.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireActiveSubscription } from '@/lib/subscription-guard'
import { captureServerEvent } from '@/lib/posthog/server'
import { scoreToSRQuality, applyReview, createInitialSRItem } from '@/lib/adaptive/spaced-repetition'
import { checkAchievements, buildAchievementRow } from '@/lib/adaptive/achievements'
import { computeAffinityDelta, applyScoreAdjustment } from '@/lib/adaptive/affinity'
import { updateModalityScore, derivePreferredModality } from '@/lib/adaptive/modality'
import { updateProfile } from '@/lib/adaptive/profiler'
import { extractAllSignals, type AnswerRecord, type SessionContext } from '@/lib/adaptive/profile-signals'
import { logDecision, logProfileChanges } from '@/lib/adaptive/algo-logger'
import type { ChildLearningProfile } from '@/types/learning-profile'
import { createDefaultProfile } from '@/types/learning-profile'
import type { Domain } from '@/types/quiz'
import type { MixedQuestion, BehavioralEvent } from '@/types/adaptive'
import type { SRItem, AchievementCheckState } from '@/types/adaptive'
import type { SessionSegment, ModalityScores } from '@/types/lesson-content'
import { createDefaultModalityScores } from '@/types/lesson-content'
import type { Json } from '@/types/database'

export const dynamic = 'force-dynamic'

// ── Extract domain from standard code ─────────────────────
// "3.OA.1" → "OA", "2.NBT.3" → "NBT", "5.G.2" → "G"

function extractDomain(standardCode: string): Domain | null {
  const parts = standardCode.split('.')
  if (parts.length < 2) return null
  const d = parts[1]
  const valid: Domain[] = ['OA', 'NBT', 'NF', 'MD', 'G']
  return valid.includes(d as Domain) ? (d as Domain) : null
}

// ── Mastery delta from score + difficulty ──────────────────
// Mastery 3 (full mastery) requires consistently solving hard
// questions. Easy questions can only get you to mastery 2.

function masteryDelta(scorePct: number, avgDifficulty: number): number {
  if (scorePct >= 90 && avgDifficulty >= 2.5) return 2   // hard questions aced → big jump
  if (scorePct >= 90) return 1                            // easy questions aced → small jump
  if (scorePct >= 70 && avgDifficulty >= 2.0) return 1    // decent on medium → small jump
  if (scorePct >= 70) return 1
  return 0
}

// ── Main handler ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocked = await requireActiveSubscription(user.id)
  if (blocked) return blocked

  const {
    sessionId,
    childId,
    answers,       // Record<number, string>  question.id → answer given
    questions,     // MixedQuestion[] - sent back from client
    timeSpentSec,
    segments,      // SessionSegment[] | undefined - sent for segmented sessions
    timings,       // Record<number|string, { startMs, endMs }> | undefined - per-question timestamps
    engagement,    // { hintRequestCount, emojiPositive, emojiNegative, instructionSkipCount, instructionStepsViewed, instructionStepsTotal, aiTeacherMessages } | undefined
  } = await request.json()

  if (!sessionId || !childId || !answers || !questions) {
    return NextResponse.json({ error: 'sessionId, childId, answers, questions required' }, { status: 400 })
  }

  // Verify child ownership
  const { data: child } = await supabase
    .from('children')
    .select('id, xp_total, streak_days, last_active, school_grade, domain_mastery, attention_span, span_calibration_score, span_question_offset, modality_scores, learning_profile')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  const mixedQuestions = questions as MixedQuestion[]

  // ── Score all answers ────────────────────────────────────
  let totalXP = 0
  let correctCount = 0

  const perQuestion: Array<{
    question: MixedQuestion
    given: string
    correct: boolean
    xpEarned: number
  }> = []

  for (const q of mixedQuestions) {
    const given = String(answers[q.id] ?? '')
    const correct = checkAnswer(q.type, given, q.correct_answer)
    const xpEarned = correct ? q.xp_per_correct : 0
    totalXP += xpEarned
    if (correct) correctCount++
    perQuestion.push({ question: q, given, correct, xpEarned })
  }

  const scorePct = Math.round((correctCount / mixedQuestions.length) * 100)

  logDecision({ component: 'SESSION', action: 'session_scored', childId, sessionId, data: {
    scorePct, correctCount, totalQuestions: mixedQuestions.length, totalXP, timeSpentSec,
    domains: [...new Set(mixedQuestions.map(q => q.domain))],
  }})

  // ── Group by standard_code for mastery + SR updates ──────
  const byStandard = new Map<string, {
    domain: Domain
    questions: typeof perQuestion
    lessonId: string | null
  }>()

  for (const pq of perQuestion) {
    const sc = pq.question.standard_code
    if (!sc) continue
    if (!byStandard.has(sc)) {
      byStandard.set(sc, {
        domain: pq.question.domain,
        questions: [],
        lessonId: pq.question.lesson_id,
      })
    }
    byStandard.get(sc)!.questions.push(pq)
  }

  // ── Update mastery per standard ───────────────────────────
  for (const [sc, group] of byStandard) {
    const correct = group.questions.filter((q) => q.correct).length
    const total = group.questions.length
    const stdScorePct = Math.round((correct / total) * 100)

    // Compute average difficulty of questions answered for this standard
    const avgDifficulty = group.questions.reduce(
      (s, q) => s + (q.question.difficulty ?? 1), 0
    ) / group.questions.length

    const delta = masteryDelta(stdScorePct, avgDifficulty)

    // Always record the attempt even if delta is 0
    const { data: existing } = await supabase
      .from('child_standard_mastery')
      .select('mastery_level, attempts')
      .eq('child_id', childId)
      .eq('standard_code', sc)
      .maybeSingle()

    const currentMastery = existing?.mastery_level ?? 0
    // Cap at 2 unless doing hard questions (mastery 3 = can solve hard)
    const maxMastery = avgDifficulty >= 2.5 ? 3 : 2
    const newMastery = Math.min(maxMastery, currentMastery + delta)

    await supabase.from('child_standard_mastery').upsert({
      child_id: childId,
      standard_code: sc,
      mastery_level: Math.max(currentMastery, newMastery),  // never decrease
      attempts: (existing?.attempts ?? 0) + 1,
      last_attempted: new Date().toISOString(),
    })

    // ── Update SR items ─────────────────────────────────────
    const stdScoreForSR = Math.round((group.questions.filter((q) => q.correct).length / group.questions.length) * 100)
    const quality = scoreToSRQuality(stdScoreForSR)

    const { data: existingSR } = await supabase
      .from('spaced_repetition_items')
      .select('*')
      .eq('child_id', childId)
      .eq('standard_code', sc)
      .maybeSingle()

    if (existingSR) {
      const updated = applyReview(existingSR as SRItem, quality)
      await supabase.from('spaced_repetition_items').update({
        ease_factor:      updated.ease_factor,
        interval_days:    updated.interval_days,
        repetitions:      updated.repetitions,
        next_review_at:   updated.next_review_at.toISOString(),
        last_reviewed_at: updated.last_reviewed_at.toISOString(),
        last_score_pct:   stdScoreForSR,
        times_reviewed:   (existingSR.times_reviewed ?? 0) + 1,
      }).eq('id', existingSR.id)
    } else if (stdScoreForSR >= 60) {
      const newItem = createInitialSRItem(childId, sc, group.domain, child.school_grade ?? 2, stdScoreForSR)
      await supabase.from('spaced_repetition_items').insert(newItem)
    }
  }

  // ── Recompute domain mastery from standard mastery ──────
  // Domain mastery = % of standards at mastery_level 3 (can solve hard questions)
  {
    const { data: allStdMastery } = await supabase
      .from('child_standard_mastery')
      .select('standard_code, mastery_level')
      .eq('child_id', childId)

    const domainCounts = new Map<string, { total: number; mastered: number }>()
    for (const row of allStdMastery ?? []) {
      const domain = extractDomain(row.standard_code)
      if (!domain) continue
      const entry = domainCounts.get(domain) ?? { total: 0, mastered: 0 }
      entry.total++
      if (row.mastery_level >= 3) entry.mastered++
      domainCounts.set(domain, entry)
    }

    const newDomainMastery: Record<string, number> = {}
    for (const [domain, counts] of domainCounts) {
      newDomainMastery[domain] = Math.round((counts.mastered / counts.total) * 100)
    }

    await supabase.from('children')
      .update({ domain_mastery: newDomainMastery as Json })
      .eq('id', childId)
  }

  // ── Streak + XP ─────────────────────────────────────────
  const now = new Date()
  const lastActive = child.last_active ? new Date(child.last_active) : null
  const daysSinceLast = lastActive
    ? Math.floor((now.getTime() - lastActive.getTime()) / 86_400_000)
    : 999

  const newStreak =
    daysSinceLast === 0 ? (child.streak_days ?? 0)
    : daysSinceLast === 1 ? (child.streak_days ?? 0) + 1
    : 1

  const oldXP = child.xp_total ?? 0
  const newXP = oldXP + totalXP

  // ── Attention span calibration ───────────────────────────
  // accumulates a score across sessions; only shifts the question
  // count once a sustained pattern is confirmed over many sessions.
  // attention_span is NEVER modified - that belongs to the parent.
  //
  // Per session:
  //   Breezing  (fast ≤18s/q AND score ≥65%) → +2
  //   Overwhelmed (score <35%)                → -2
  //   Neutral (everything else)               →  0  ← past signal preserved
  //
  // Threshold ±10 → adjust span_question_offset by ±1, reset score to 0.
  // ~5 consistent breezing/overwhelmed sessions needed to shift.
  const BASE_COUNTS: Record<'short' | 'medium' | 'long', number> = { short: 5, medium: 7, long: 9 }
  const currentSpan   = child.attention_span as 'short' | 'medium' | 'long'
  const baseCount     = BASE_COUNTS[currentSpan]
  const currentOffset = child.span_question_offset    ?? 0
  const currentCalib  = child.span_calibration_score  ?? 0

  const avgSecPerQ    = timeSpentSec && mixedQuestions.length > 0
    ? timeSpentSec / mixedQuestions.length
    : null

  const isBreezing    = avgSecPerQ !== null && avgSecPerQ <= 18 && scorePct >= 65
  const isOverwhelmed = scorePct < 35

  const sessionDelta = isBreezing ? 2 : isOverwhelmed ? -2 : 0
  let newCalib  = currentCalib + sessionDelta
  let newOffset = currentOffset

  // Clamp offset so effective count stays within [3, 13]
  const MIN_OFFSET = 3  - baseCount
  const MAX_OFFSET = 13 - baseCount
  const THRESHOLD  = 10

  if (newCalib >= THRESHOLD) {
    newOffset = Math.min(MAX_OFFSET, currentOffset + 1)
    newCalib  = 0
  } else if (newCalib <= -THRESHOLD) {
    newOffset = Math.max(MIN_OFFSET, currentOffset - 1)
    newCalib  = 0
  }

  await supabase.from('children').update({
    xp_total: newXP,
    last_active: now.toISOString(),
    streak_days: newStreak,
    span_calibration_score: newCalib,
    span_question_offset:   newOffset,
  }).eq('id', childId)

  // ── Save lesson attempt record ────────────────────────────
  // One attempt per standard covered
  for (const [sc, group] of byStandard) {
    if (!group.lessonId) continue
    const stdScore = Math.round((group.questions.filter((q) => q.correct).length / group.questions.length) * 100)
    await supabase.from('lesson_attempts').insert({
      child_id: childId,
      lesson_id: group.lessonId,
      status: 'completed',
      score_pct: stdScore,
      answers: group.questions.map((q) => ({
        question_id: q.question.id,
        given: q.given,
        correct: q.correct,
      })) as unknown as Json,
      xp_earned: group.questions.reduce((s, q) => s + q.xpEarned, 0),
      time_spent_sec: timeSpentSec ?? null,
      completed_at: now.toISOString(),
    }).then(() => {}).then(undefined, () => {})
  }

  // ── Mark session complete ─────────────────────────────────
  await supabase.from('practice_sessions').update({
    status: 'completed',
    completed_at: now.toISOString(),
    questions_answered: mixedQuestions.length,
    correct_count: correctCount,
    xp_earned: totalXP,
    engagement_summary: {
      questions_answered: mixedQuestions.length,
      correct_count: correctCount,
      xp_earned: totalXP,
      score_pct: scorePct,
      completed_at: now.toISOString(),
    } as Json,
  }).eq('id', sessionId)

  // ── Check achievements ────────────────────────────────────
  const { data: existingAchievements } = await supabase
    .from('achievements')
    .select('achievement_code')
    .eq('child_id', childId)

  const existingCodes = (existingAchievements ?? []).map((a) => a.achievement_code)

  const { data: srCountRow } = await supabase
    .from('spaced_repetition_items')
    .select('times_reviewed')
    .eq('child_id', childId)

  const srReviewed = (srCountRow ?? []).reduce((s, r) => s + (r.times_reviewed ?? 0), 0)

  const { data: perfectRows } = await supabase
    .from('lesson_attempts')
    .select('id')
    .eq('child_id', childId)
    .eq('score_pct', 100)

  const { data: totalAttempts } = await supabase
    .from('lesson_attempts')
    .select('id')
    .eq('child_id', childId)

  const domainMastery = (child.domain_mastery as Record<Domain, number>) ?? {}

  const achievementState: AchievementCheckState = {
    streak_days: newStreak,
    domain_mastery: domainMastery as Record<Domain, number>,
    sr_items_reviewed: srReviewed,
    perfect_lessons: perfectRows?.length ?? 0,
    lessons_completed: totalAttempts?.length ?? 0,
    last_lesson_score: scorePct,
    last_lesson_standard: null,
    standard_best_scores: {},
    avg_response_ms: null,
    existing_codes: existingCodes,
    recent_week_lessons: (totalAttempts?.length ?? 0),
  }

  const newAchievementDefs = checkAchievements(achievementState, existingCodes)
  // Map AchievementDefinition → EarnedAchievement row shape
  const newAchievements = newAchievementDefs.map((def) => buildAchievementRow(childId, def))

  let achievementXP = 0
  if (newAchievements.length > 0) {
    await supabase.from('achievements').insert(
      newAchievements.map((a) => ({
        child_id: a.child_id,
        achievement_code: a.achievement_code,
        achievement_type: a.achievement_type,
        title: a.title,
        description: a.description,
        icon_slug: a.icon_slug,
        xp_bonus: a.xp_bonus,
        metadata: a.metadata as Json,
        earned_at: a.earned_at,
      }))
    )

    achievementXP = newAchievements.reduce((s, a) => s + a.xp_bonus, 0)
    if (achievementXP > 0) {
      await supabase.from('children')
        .update({ xp_total: newXP + achievementXP })
        .eq('id', childId)
    }
  }

  // ── Update topic affinity per domain ─────────────────────
  // Group answers into BehavioralEvent-like objects, one per domain,
  // then compute and upsert affinity scores.
  const domainAnswerMap = new Map<Domain, typeof perQuestion>()
  for (const pq of perQuestion) {
    const d = pq.question.domain as Domain
    if (!domainAnswerMap.has(d)) domainAnswerMap.set(d, [])
    domainAnswerMap.get(d)!.push(pq)
  }

  // Derive avg ms per question from total session time
  const avgMsPerQuestion = timeSpentSec && mixedQuestions.length > 0
    ? Math.round((timeSpentSec * 1000) / mixedQuestions.length)
    : 8000
  const childAvgResponseMs = avgMsPerQuestion

  for (const [domain, pqs] of domainAnswerMap) {
    const events: BehavioralEvent[] = pqs.map((pq) => ({
      child_id: childId,
      session_id: sessionId,
      event_type: pq.correct ? 'answer_correct' : 'answer_wrong',
      domain,
      standard_code: pq.question.standard_code ?? null,
      question_id: String(pq.question.id),
      time_ms: avgMsPerQuestion,
      metadata: {},
    }))

    const delta = computeAffinityDelta(events, childAvgResponseMs)
    const scoreAdj = (delta as Record<string, unknown>)._scoreAdjustment as number | undefined

    if (scoreAdj !== undefined && scoreAdj !== 0) {
      const { data: existing } = await supabase
        .from('topic_affinity')
        .select('affinity_score, emoji_positive, emoji_negative, correct_streak_best, sessions_in_domain')
        .eq('child_id', childId)
        .eq('domain', domain)
        .maybeSingle()

      const currentScore = existing?.affinity_score ?? 50
      const sessionsInDomain = existing?.sessions_in_domain ?? 0
      const newScore = applyScoreAdjustment(currentScore, scoreAdj, sessionsInDomain)

      await supabase.from('topic_affinity').upsert({
        child_id: childId,
        domain,
        affinity_score: newScore,
        emoji_positive: (existing?.emoji_positive ?? 0) + (delta.emoji_positive ?? 0),
        emoji_negative: (existing?.emoji_negative ?? 0) + (delta.emoji_negative ?? 0),
        correct_streak_best: Math.max(existing?.correct_streak_best ?? 0, delta.correct_streak_best ?? 0),
        sessions_in_domain: sessionsInDomain + 1,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'child_id,domain' })
    }
  }

  // ── PostHog: session completed ───────────────────────────
  {
    const { count: prevCompletedCount } = await supabase
      .from('practice_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('child_id', childId)
      .eq('status', 'completed')
      .neq('id', sessionId)

    const isFirst = (prevCompletedCount ?? 0) === 0
    captureServerEvent(user.id, isFirst ? 'first_session_completed' : 'session_completed', {
      child_id: childId,
      session_id: sessionId,
      score_pct: scorePct,
      xp_earned: totalXP,
      questions_answered: mixedQuestions.length,
      correct_count: correctCount,
      is_first: isFirst,
    }).catch(() => {})
  }

  // ── Fire behavioral event ────────────────────────────────
  supabase.from('behavioral_events').insert({
    child_id: childId,
    session_id: sessionId,
    event_type: 'session_end',
    metadata: {
      questions_answered: mixedQuestions.length,
      correct_count: correctCount,
      score_pct: scorePct,
      xp_earned: totalXP,
      time_spent_sec: timeSpentSec ?? null,
    } as Json,
  }).then(() => {})

  // ── Track modality attempts (segmented sessions only) ────
  if (Array.isArray(segments) && segments.length > 0) {
    const sessionSegments = segments as SessionSegment[]
    const currentModalityScores: ModalityScores =
      (child.modality_scores as ModalityScores | null) ?? createDefaultModalityScores()

    for (const seg of sessionSegments) {
      if (seg.type !== 'instruction') continue

      // Find the practice segment paired with this instruction
      const pairedPractice = sessionSegments.find(
        (s) => s.type === 'practice' && s.standardCode === seg.standardCode
      )

      // Calculate score from the paired practice questions
      let segScorePct = 0
      if (pairedPractice && pairedPractice.type === 'practice') {
        const practiceQs = pairedPractice.questions
        let correct = 0
        for (const q of practiceQs) {
          const given = String(answers[q.id] ?? '')
          if (checkAnswer(q.type, given, q.correct_answer)) correct++
        }
        segScorePct = practiceQs.length > 0 ? Math.round((correct / practiceQs.length) * 100) : 0
      }

      // Record modality attempt
      await supabase.from('modality_attempts').insert({
        child_id: childId,
        standard_code: seg.standardCode,
        modality: seg.modality,
        score_pct: segScorePct,
        time_spent_sec: timeSpentSec ? Math.round(timeSpentSec / sessionSegments.length) : null,
        engagement_signal: 'ok',
      })

      // Update modality scores on child profile
      const updated = updateModalityScore(
        currentModalityScores[seg.modality],
        segScorePct,
        'ok',
      )
      currentModalityScores[seg.modality] = updated
    }

    // Persist updated modality scores + derived preferred modality
    const preferred = derivePreferredModality(currentModalityScores)
    await supabase.from('children').update({
      modality_scores: currentModalityScores as unknown as Json,
      preferred_modality: preferred,
    }).eq('id', childId)
  }

  // ── Update learning profile via profiler ─────────────────
  {
    const sessionSegments = Array.isArray(segments) ? segments as SessionSegment[] : []
    const instructionStandards = sessionSegments
      .filter((s): s is SessionSegment & { type: 'instruction' } => s.type === 'instruction')
      .map(s => s.standardCode)
    const modalityUsedInSession = sessionSegments.find(s => s.type === 'instruction')
      ? (sessionSegments.find(s => s.type === 'instruction') as { modality?: string })?.modality ?? null
      : null

    // Build answer records for signal extraction
    // Use real per-question timestamps if available, otherwise approximate
    const timingMap = (timings ?? {}) as Record<string, { startMs: number; endMs: number }>
    const answerRecords: AnswerRecord[] = perQuestion.map((pq, idx) => {
      const timing = timingMap[String(pq.question.id)]
      return {
        questionId: pq.question.id,
        answer: pq.given,
        correct: pq.correct,
        startMs: timing?.startMs ?? idx * 15_000,
        endMs: timing?.endMs ?? (idx + 1) * 15_000,
        difficulty: pq.question.difficulty ?? 1,
        domain: pq.question.domain,
        standardCode: pq.question.standard_code ?? null,
        questionType: pq.question.type,
        questionText: pq.question.text,
        correctAnswer: pq.question.correct_answer,
      }
    })

    const eng = (engagement ?? {}) as Record<string, number>
    const sessionCtx: SessionContext = {
      childId,
      sessionId,
      gradeLevel: child.school_grade ?? 3,
      totalTimeMs: (timeSpentSec ?? 0) * 1000,
      isSegmented: sessionSegments.length > 0,
      hintRequestCount: eng.hintRequestCount ?? 0,
      instructionSkipCount: eng.instructionSkipCount ?? 0,
      instructionStepsViewed: eng.instructionStepsViewed ?? 0,
      instructionStepsTotal: eng.instructionStepsTotal ?? 0,
      aiTeacherMessages: eng.aiTeacherMessages ?? 0,
    }

    const hasRealTimings = Object.keys(timingMap).length > 0
    logDecision({ component: 'SESSION', action: 'profiler_signals', childId, sessionId, data: {
      answerCount: answerRecords.length, hasRealTimings,
      avgResponseMs: answerRecords.length > 0
        ? Math.round(answerRecords.reduce((s, a) => s + (a.endMs - a.startMs), 0) / answerRecords.length)
        : 0,
      accuracy: answerRecords.length > 0
        ? Math.round(answerRecords.filter(a => a.correct).length / answerRecords.length * 100)
        : 0,
      modalityUsed: modalityUsedInSession,
      engagement: {
        hints: sessionCtx.hintRequestCount,
        instructionSkips: sessionCtx.instructionSkipCount,
        stepsViewed: `${sessionCtx.instructionStepsViewed}/${sessionCtx.instructionStepsTotal}`,
        aiMessages: sessionCtx.aiTeacherMessages,
      },
    }})

    const allSignals = extractAllSignals(answerRecords, sessionCtx, modalityUsedInSession, instructionStandards)
    const currentProfile = (child.learning_profile as ChildLearningProfile | null) ?? createDefaultProfile()
    const updatedProfile = updateProfile(currentProfile, allSignals)

    logProfileChanges(
      childId,
      currentProfile as unknown as Record<string, unknown>,
      updatedProfile as unknown as Record<string, unknown>,
    )

    await supabase.from('children').update({
      learning_profile: updatedProfile as unknown as Json,
    }).eq('id', childId)
  }

  // ── Identify touched domains for island highlight ────────
  const domainsInSession = [...new Set(mixedQuestions.map((q) => q.domain))]

  return NextResponse.json({
    score_pct: scorePct,
    correct_count: correctCount,
    total_questions: mixedQuestions.length,
    xp_earned: totalXP + achievementXP,
    streak_days: newStreak,
    domains: domainsInSession,
    new_achievements: newAchievements,
    per_question: perQuestion.map((pq) => ({
      id: pq.question.id,
      correct: pq.correct,
      given: pq.given,
      correct_answer: pq.question.correct_answer,
      domain: pq.question.domain,
    })),
  })
}

// ── Answer checking (mirrors lesson page logic) ───────────

function checkAnswer(type: string, given: string, correct: string): boolean {
  const g = given.trim().toLowerCase()
  const c = correct.trim().toLowerCase()
  if (g === c) return true

  if (type === 'fraction') {
    // Accept equivalent fractions e.g. 2/4 == 1/2
    const parseFrac = (s: string) => {
      const parts = s.split('/')
      if (parts.length !== 2) return null
      const n = parseFloat(parts[0])
      const d = parseFloat(parts[1])
      return isNaN(n) || isNaN(d) || d === 0 ? null : n / d
    }
    const gv = parseFrac(g)
    const cv = parseFrac(c)
    if (gv !== null && cv !== null) return Math.abs(gv - cv) < 0.0001
  }

  if (type === 'numeric') {
    const gv = parseFloat(g)
    const cv = parseFloat(c)
    if (!isNaN(gv) && !isNaN(cv)) return Math.abs(gv - cv) < 0.0001
  }

  return false
}
