import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireActiveSubscription } from '@/lib/subscription-guard'
import { checkAnswer } from '@/lib/quiz/scoring'
import {
  getDomainProgress,
  getCurrentDomain,
  processDomainAnswer,
  shouldStopQuiz,
  rebuildDomainStateFromHistory,
  getDomainsForGrade,
  getQuestionsPerDomain,
} from '@/lib/quiz/adaptive'
import type { QuizAnswerRecord } from '@/types/quiz'
import type { Json } from '@/types/database'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocked = await requireActiveSubscription(user.id)
  if (blocked) return blocked

  const { sessionId, questionId, answerGiven, timeMs } = await request.json()

  // Load session + child's school_grade for state rebuild
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('*, children!inner(profile_id, school_grade)')
    .eq('id', sessionId)
    .single()

  if (!session || (session.children as unknown as { profile_id: string }).profile_id !== user.id) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (session.status !== 'in_progress') {
    return NextResponse.json({ error: 'Session is not active' }, { status: 400 })
  }

  // Fetch the question being answered
  const { data: question } = await supabase
    .from('diagnostic_questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

  const isCorrect = checkAnswer(
    question.question_type as 'multiple_choice' | 'numeric' | 'fraction',
    answerGiven,
    question.correct_answer
  )

  const answerRecord: QuizAnswerRecord = {
    question_id:   questionId,
    answer_given:  answerGiven,
    correct:       isCorrect,
    time_ms:       timeMs ?? 0,
    grade_level:   question.grade_level,
    domain:        question.domain,
    difficulty:    question.difficulty,
    standard_code: question.standard_code ?? undefined,
  }

  // Rebuild domain state from history, then apply this answer
  const schoolGrade = (session.children as unknown as { school_grade: number | null }).school_grade
  const effectiveGrade = schoolGrade ?? 2
  const totalQuestions = getDomainsForGrade(effectiveGrade).length * getQuestionsPerDomain(effectiveGrade)
  const existingAnswers = (session.questions_asked as unknown as QuizAnswerRecord[]) ?? []

  let state = rebuildDomainStateFromHistory(existingAnswers, schoolGrade)
  state = processDomainAnswer(state, answerRecord)

  // Persist updated session
  const updatedAnswers = [...existingAnswers, answerRecord]
  await supabase
    .from('quiz_sessions')
    .update({
      questions_asked: updatedAnswers as unknown as Json,
      total_correct:   updatedAnswers.filter((a) => a.correct).length,
      total_asked:     updatedAnswers.length,
    })
    .eq('id', sessionId)

  // Quiz done?
  if (shouldStopQuiz(state)) {
    return NextResponse.json({
      done:       true,
      correct:    isCorrect,
      totalAsked: updatedAnswers.length,
    })
  }

  // Pick next question for current domain
  const currentDomain = getCurrentDomain(state)
  const domainState   = state.domains[currentDomain]!
  const usedIds       = Array.from(state.usedQuestionIds)

  // Helper: apply exclude filter only when there are used IDs
  function excludeUsed(query: ReturnType<typeof supabase.from>) {
    return usedIds.length > 0 ? query.not('id', 'in', `(${usedIds.join(',')})`) : query
  }

  const base = supabase.from('diagnostic_questions').select('*')

  const { data: nextQuestion } = await excludeUsed(
    base
      .eq('domain', currentDomain)
      .eq('grade_level', domainState.currentGrade)
      .eq('difficulty', domainState.currentDifficulty)
  ).limit(1).maybeSingle()

  // Fallback: relax difficulty → relax grade → any question in domain
  let finalQuestion = nextQuestion
  if (!finalQuestion) {
    const { data: relaxDiff } = await excludeUsed(
      supabase.from('diagnostic_questions').select('*')
        .eq('domain', currentDomain)
        .eq('grade_level', domainState.currentGrade)
    ).limit(1).maybeSingle()
    finalQuestion = relaxDiff ?? null
  }
  if (!finalQuestion) {
    // Prefer questions at or below child's current grade
    const { data: anyInDomain } = await excludeUsed(
      supabase.from('diagnostic_questions').select('*')
        .eq('domain', currentDomain)
        .lte('grade_level', domainState.currentGrade)
        .order('grade_level', { ascending: false })
        .order('difficulty', { ascending: true })
    ).limit(1).maybeSingle()
    finalQuestion = anyInDomain ?? null
  }
  if (!finalQuestion) {
    const { data: anyInDomainAny } = await excludeUsed(
      supabase.from('diagnostic_questions').select('*')
        .eq('domain', currentDomain)
        .order('grade_level', { ascending: true })
        .order('difficulty', { ascending: true })
    ).limit(1).maybeSingle()
    finalQuestion = anyInDomainAny ?? null
  }

  // Absolute last resort: any unused question across all domains
  if (!finalQuestion) {
    const { data: anyQuestion } = await excludeUsed(
      supabase.from('diagnostic_questions').select('*')
        .order('grade_level', { ascending: true })
    ).limit(1).maybeSingle()
    finalQuestion = anyQuestion ?? null
  }

  if (!finalQuestion) {
    return NextResponse.json({ done: true, correct: isCorrect, totalAsked: updatedAnswers.length })
  }

  return NextResponse.json({
    done:    false,
    correct: isCorrect,
    question: {
      id:            finalQuestion.id,
      grade_level:   finalQuestion.grade_level,
      domain:        finalQuestion.domain,
      question_text: finalQuestion.question_text,
      question_type: finalQuestion.question_type,
      options:       finalQuestion.options,
      difficulty:    finalQuestion.difficulty,
    },
    currentDomain:  currentDomain,
    domainProgress: getDomainProgress(state),
    questionsAsked: updatedAnswers.length,
    totalQuestions: totalQuestions,
  })
}
