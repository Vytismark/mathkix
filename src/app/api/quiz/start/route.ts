import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireActiveSubscription } from '@/lib/subscription-guard'
import {
  createDomainAdaptiveState,
  getCurrentDomain,
  getDomainProgress,
  getDomainsForGrade,
  getQuestionsPerDomain,
} from '@/lib/quiz/adaptive'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocked = await requireActiveSubscription(user.id)
  if (blocked) return blocked

  const { childId } = await request.json()
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  // Verify child belongs to parent; get school_grade for adaptive start point
  const { data: child } = await supabase
    .from('children')
    .select('id, school_grade, grade_level')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  const schoolGrade = child.school_grade ?? child.grade_level ?? 2
  const totalQuestions = getDomainsForGrade(schoolGrade).length * getQuestionsPerDomain(schoolGrade)

  // Create quiz session
  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .insert({ child_id: childId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Build domain state - first domain is OA at difficulty 2
  const state = createDomainAdaptiveState(schoolGrade)
  const firstDomain = getCurrentDomain(state)
  const ds = state.domains[firstDomain]!

  // Fetch first question: OA, schoolGrade, difficulty 2
  const { data: question } = await supabase
    .from('diagnostic_questions')
    .select('*')
    .eq('domain', firstDomain)
    .eq('grade_level', ds.currentGrade)
    .eq('difficulty', ds.currentDifficulty)
    .limit(1)
    .maybeSingle()

  // Fallback 1: relax difficulty, keep grade
  let firstQuestion = question
  if (!firstQuestion) {
    const { data: relaxDiff } = await supabase
      .from('diagnostic_questions')
      .select('*')
      .eq('domain', firstDomain)
      .eq('grade_level', ds.currentGrade)
      .order('difficulty', { ascending: true })
      .limit(1)
      .maybeSingle()
    firstQuestion = relaxDiff ?? null
  }

  // Fallback 2: any OA question at or below school grade, easiest first
  if (!firstQuestion) {
    const { data: belowGrade } = await supabase
      .from('diagnostic_questions')
      .select('*')
      .eq('domain', firstDomain)
      .lte('grade_level', ds.currentGrade)
      .order('grade_level', { ascending: false })
      .order('difficulty', { ascending: true })
      .limit(1)
      .maybeSingle()
    firstQuestion = belowGrade ?? null
  }

  // Last resort: any OA question, lowest grade first
  if (!firstQuestion) {
    const { data: anyOA } = await supabase
      .from('diagnostic_questions')
      .select('*')
      .eq('domain', firstDomain)
      .order('grade_level', { ascending: true })
      .order('difficulty', { ascending: true })
      .limit(1)
      .maybeSingle()
    firstQuestion = anyOA ?? null
  }

  if (!firstQuestion) {
    return NextResponse.json(
      { error: 'No diagnostic questions found. Please seed the question bank first.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    sessionId: session.id,
    question: {
      id:            firstQuestion.id,
      grade_level:   firstQuestion.grade_level,
      domain:        firstQuestion.domain,
      question_text: firstQuestion.question_text,
      question_type: firstQuestion.question_type,
      options:       firstQuestion.options,
      difficulty:    firstQuestion.difficulty,
    },
    currentDomain:  firstDomain,
    domainProgress: getDomainProgress(state),
    questionsAsked: 0,
    totalQuestions: totalQuestions,
  })
}
