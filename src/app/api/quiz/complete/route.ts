import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireActiveSubscription } from '@/lib/subscription-guard'
import { captureServerEvent } from '@/lib/posthog/server'
import { enqueueEmail, DRIP_KEYS } from '@/lib/email/drip-queue'
import { anthropic } from '@/lib/anthropic/client'
import {
  buildDomainAssessmentSystemPrompt,
  buildDomainAssessmentPrompt,
  parseDomainAssessmentResponse,
  computeFallbackDomainScores,
} from '@/lib/anthropic/prompts'
import {
  rebuildDomainStateFromHistory,
  computeDomainScores,
} from '@/lib/quiz/adaptive'
import type { QuizAnswerRecord, DomainScores, Domain } from '@/types/quiz'
import type { Json } from '@/types/database'
import { updateProfile } from '@/lib/adaptive/profiler'
import { extractAllSignals, type AnswerRecord, type SessionContext } from '@/lib/adaptive/profile-signals'
import { logDecision } from '@/lib/adaptive/algo-logger'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocked = await requireActiveSubscription(user.id)
  if (blocked) return blocked

  const { sessionId, childId } = await request.json()

  // Load and validate session + school_grade for grade derivation
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('*, children!inner(profile_id, school_grade)')
    .eq('id', sessionId)
    .single()

  if (!session || (session.children as unknown as { profile_id: string }).profile_id !== user.id) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (session.status !== 'in_progress') {
    return NextResponse.json({ error: 'Session already completed' }, { status: 400 })
  }

  const questionsAsked = (session.questions_asked as unknown as QuizAnswerRecord[]) ?? []
  const schoolGrade = (session.children as unknown as { school_grade: number | null }).school_grade

  // ── Compute domain scores two ways ────────────────────────────────────────

  // 1. Local computation (always available)
  const domainState      = rebuildDomainStateFromHistory(questionsAsked, schoolGrade)
  const computedScores   = computeDomainScores(domainState)

  // 2. Claude scoring (primary; fallback to computed if Claude fails)
  let domainScores: DomainScores = computedScores
  let reasoning = 'Based on your quiz performance.'
  let rawText   = ''
  let scoringMethod: 'ai' | 'ai_fallback' | 'local_fallback' = 'local_fallback'

  try {
    const effectiveGrade = schoolGrade ?? 2
    const prompt  = buildDomainAssessmentPrompt(questionsAsked, effectiveGrade)
    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 512,
      system:     buildDomainAssessmentSystemPrompt(effectiveGrade),
      messages:   [{ role: 'user', content: prompt }],
    })
    rawText = message.content[0].type === 'text' ? message.content[0].text : ''

    const parsed = parseDomainAssessmentResponse(rawText, effectiveGrade)
    if (parsed) {
      domainScores  = parsed.domain_scores
      reasoning     = parsed.reasoning
      scoringMethod = 'ai'
    } else {
      // Claude replied but response was malformed - use fallback
      domainScores  = computeFallbackDomainScores(questionsAsked, effectiveGrade)
      scoringMethod = 'ai_fallback'
    }
  } catch {
    // Claude unavailable - use computed fallback scores
    domainScores = computeFallbackDomainScores(questionsAsked, schoolGrade ?? 2)
    scoringMethod = 'local_fallback'
  }

  // ── Persist session ────────────────────────────────────────────────────────
  await supabase
    .from('quiz_sessions')
    .update({
      status:           'completed',
      ai_raw_response:  rawText,
      domain_scores:    domainScores as unknown as Json,
      scoring_method:   scoringMethod,
      completed_at:     new Date().toISOString(),
    })
    .eq('id', sessionId)

  // ── Update child domain mastery (grade stays as parent set it) ───────────
  await supabase
    .from('children')
    .update({
      domain_mastery:  domainScores as unknown as Json,
      placement_done:  true,
    })
    .eq('id', childId)
    .eq('profile_id', user.id)

  // ── Seed per-standard mastery from diagnostic answers ────────────────────
  // Conservative mapping: diagnostics give a starting point, lessons refine it.
  // Mastery 3 ("Mastered") is never set here - requires repeated lesson practice.
  {
    const byStandard = new Map<string, QuizAnswerRecord[]>()
    for (const a of questionsAsked) {
      if (!a.standard_code) continue
      if (!byStandard.has(a.standard_code)) byStandard.set(a.standard_code, [])
      byStandard.get(a.standard_code)!.push(a)
    }

    const now = new Date().toISOString()
    for (const [sc, answers] of byStandard) {
      const correct = answers.filter((a) => a.correct).length
      const total = answers.length
      const scorePct = Math.round((correct / total) * 100)
      const avgDiff = answers.reduce((s, a) => s + a.difficulty, 0) / total

      // Conservative: hard correct → Practicing(2), easy/medium correct → Introduced(1)
      let mastery = 0
      if (scorePct >= 80 && avgDiff >= 2.5) mastery = 2
      else if (scorePct >= 80) mastery = 1
      else if (scorePct >= 50) mastery = 1

      await supabase.from('child_standard_mastery').upsert({
        child_id:       childId,
        standard_code:  sc,
        mastery_level:  mastery,
        attempts:       total,
        last_attempted: now,
      })
    }
  }

  // ── Seed learning profile from diagnostic quiz ──────────────────────────
  // Bootstrap profiler dimensions from quiz signals (partial confidence).
  // This gives the algorithm a head start before the first real session.
  {
    let cumulativeMs = 0
    const quizAnswerRecords: AnswerRecord[] = questionsAsked.map((a) => {
      const startMs = cumulativeMs
      cumulativeMs += a.time_ms ?? 10_000
      return {
        questionId: parseInt(a.question_id) || 0,
        answer: a.answer_given,
        correct: a.correct,
        startMs,
        endMs: cumulativeMs,
        difficulty: a.difficulty,
        domain: (a.domain as Domain) ?? 'OA',
        standardCode: a.standard_code ?? null,
        questionType: 'numeric',
        questionText: '',
        correctAnswer: '',
      }
    })

    const quizContext: SessionContext = {
      childId,
      sessionId,
      gradeLevel: schoolGrade ?? 3,
      totalTimeMs: cumulativeMs,
      isSegmented: false,
      hintRequestCount: 0,
      instructionSkipCount: 0,
      instructionStepsViewed: 0,
      instructionStepsTotal: 0,
      aiTeacherMessages: 0,
    }

    const signals = extractAllSignals(quizAnswerRecords, quizContext, null, [])
    const initialProfile = updateProfile(null, signals)

    await supabase.from('children').update({
      learning_profile: initialProfile as unknown as Json,
    }).eq('id', childId)

    logDecision({ component: 'PROFILER', action: 'quiz_seed', childId, data: {
      questionsAnalyzed: questionsAsked.length,
      avgResponseMs: Math.round(cumulativeMs / questionsAsked.length),
      accuracy: Math.round(questionsAsked.filter(a => a.correct).length / questionsAsked.length * 100),
    }})
  }

  captureServerEvent(user.id, 'quiz_completed', {
    child_id: childId,
    session_id: sessionId,
    scoring_method: scoringMethod,
    questions_answered: questionsAsked.length,
  }).catch(() => {})

  // Enqueue placement-complete email
  {
    const { data: child } = await supabase
      .from('children')
      .select('name, school_grade')
      .eq('id', childId)
      .single()
    const assessedGrade = (session.children as unknown as { school_grade: number | null }).school_grade
    enqueueEmail(
      user.id,
      DRIP_KEYS.PLACEMENT_COMPLETE,
      new Date(),
      { childName: child?.name ?? null, assessedGrade },
    ).catch(() => {})
  }

  return NextResponse.json({
    result: {
      domain_scores: domainScores,
      reasoning,
      scoring_method: scoringMethod,
    },
  })
}
