// Legacy endpoint - domain assessment is now handled by /api/quiz/complete.
// Kept to avoid breaking any older clients; delegates to the same Claude logic.
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'
import {
  buildDomainAssessmentSystemPrompt,
  buildDomainAssessmentPrompt,
  parseDomainAssessmentResponse,
  computeFallbackDomainScores,
} from '@/lib/anthropic/prompts'
import type { QuizAnswerRecord } from '@/types/quiz'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = await request.json()

  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('*, children!inner(profile_id, school_grade)')
    .eq('id', sessionId)
    .single()

  if (!session || (session.children as unknown as { profile_id: string }).profile_id !== user.id) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const questionsAsked = session.questions_asked as unknown as QuizAnswerRecord[]

  if (questionsAsked.length === 0) {
    return NextResponse.json({ error: 'No questions answered' }, { status: 400 })
  }

  const schoolGrade = (session.children as unknown as { school_grade: number | null }).school_grade
  const effectiveGrade = schoolGrade ?? 2

  const prompt  = buildDomainAssessmentPrompt(questionsAsked, effectiveGrade)
  let rawText   = ''
  let domainScores = computeFallbackDomainScores(questionsAsked, effectiveGrade)
  let reasoning    = 'Based on your quiz performance.'

  try {
    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 512,
      system:     buildDomainAssessmentSystemPrompt(effectiveGrade),
      messages:   [{ role: 'user', content: prompt }],
    })
    rawText      = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = parseDomainAssessmentResponse(rawText, effectiveGrade)
    if (parsed) {
      domainScores = parsed.domain_scores
      reasoning    = parsed.reasoning
    }
  } catch { /* fallback already set */ }

  return NextResponse.json({
    result: { domain_scores: domainScores, reasoning },
    rawText,
  })
}
