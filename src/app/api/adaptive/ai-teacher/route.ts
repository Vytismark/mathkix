import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  buildTeacherSystemPrompt,
  buildTeacherUserMessage,
  buildClickToExplainPrompt,
  buildAutoGreetPrompt,
  buildWrongAnswerExplainPrompt,
} from '@/lib/anthropic/teacher-prompts'
import type { AITeacherRequest, EmotionSignal, ProblemType } from '@/types/adaptive'
import type { Json } from '@/types/database'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: AITeacherRequest & {
    sessionId?: string
    currentQuestion?: string
    correctAnswer?: string
    autoGreet?: boolean
    wrongExplain?: boolean
  } = await request.json()

  const {
    childId, message, contextHint, currentQuestion, correctAnswer,
    history, sessionId, autoGreet, wrongExplain,
    struggleCount: rawStruggle, emotionSignal: rawEmotion, problemType: rawProblem,
    progressSummary,
  } = body

  if (!childId || !message) {
    return NextResponse.json({ error: 'childId and message required' }, { status: 400 })
  }

  // Defaults for new optional fields (backward compatible)
  const struggleCount = rawStruggle ?? 0
  const emotionSignal: EmotionSignal = rawEmotion ?? 'neutral'
  const problemType: ProblemType = rawProblem ?? 'other'

  // Verify child ownership and get grade level
  const { data: child } = await supabase
    .from('children')
    .select('id, name, grade_level')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()
  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  const gradeLevel = child.grade_level ?? 2
  const childName = child.name ?? 'there'

  // Build the hidden context block appended to most prompts
  function buildContextBlock(q: string, ans?: string): string {
    const ansLine = ans
      ? `\nCORRECT ANSWER (NEVER reveal this - use it only to judge if the child is on the right track or heading in the wrong direction): "${ans}"`
      : ''
    return `\n\nCONTEXT FOR YOU ONLY - do not repeat any of this to the child:
- The problem on their screen is: "${q}"${ansLine}
- IMPORTANT: The child types their quiz answer in a SEPARATE answer box on the left side of the screen. This chat is only for asking questions and getting help. When the child types something here they are talking to you, NOT submitting their answer. Never treat a number or phrase they type here as their quiz submission.
- If the child types something that happens to be the correct answer, acknowledge that their thinking is right but still guide them to submit it in the answer box.`
  }

  // Shared prompt options for scaffolding + emotion + problem type
  const promptOptions = { struggleCount, emotionSignal, problemType }

  // Build system prompt adapted to grade level
  // Priority: wrongExplain > auto-greet > click-to-explain > regular message
  let systemPrompt: string
  if (wrongExplain && currentQuestion && correctAnswer) {
    systemPrompt = buildWrongAnswerExplainPrompt(gradeLevel, childName, currentQuestion, correctAnswer, problemType)
  } else if (autoGreet && currentQuestion) {
    const greetBase = buildAutoGreetPrompt(gradeLevel, childName, currentQuestion, problemType)
    systemPrompt = correctAnswer
      ? `${greetBase}\n\nCORRECT ANSWER (NEVER reveal): "${correctAnswer}"`
      : greetBase
  } else if (contextHint && !message.trim()) {
    const base = buildClickToExplainPrompt(gradeLevel, childName, contextHint, emotionSignal)
    systemPrompt = currentQuestion
      ? `${base}${buildContextBlock(currentQuestion, correctAnswer)}`
      : base
  } else {
    const base = buildTeacherSystemPrompt(gradeLevel, childName, promptOptions)
    systemPrompt = currentQuestion
      ? `${base}${buildContextBlock(currentQuestion, correctAnswer)}`
      : base
  }

  // Inject progress summary as context before conversation
  if (progressSummary) {
    systemPrompt = `[PROGRESS: ${progressSummary}. Struggle count: ${struggleCount}. Emotion: ${emotionSignal}.]\n\n${systemPrompt}`
  }

  const userContent = buildTeacherUserMessage(message, contextHint)

  // Keep last 6 turns of history to stay within context budget
  const recentHistory = (history ?? []).slice(-6)

  // Stream response from Claude
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = await anthropic.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: wrongExplain ? 300 : 200,
          system: systemPrompt,
          messages: [
            ...recentHistory.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
            { role: 'user', content: userContent },
          ],
        })

        let fullResponse = ''

        for await (const chunk of claudeStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const text = chunk.delta.text
            fullResponse += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()

        // Log hint_requested event (fire-and-forget)
        if (sessionId) {
          supabase.from('behavioral_events').insert({
            child_id:   childId,
            session_id: sessionId,
            event_type: 'hint_requested',
            metadata: {
              context_hint:    contextHint,
              response_length: fullResponse.length,
              struggle_count:  struggleCount,
              emotion_signal:  emotionSignal,
              problem_type:    problemType,
            } as Json,
          }).then(() => {})
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'AI unavailable' })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':       'text/event-stream',
      'Cache-Control':      'no-cache',
      'Connection':         'keep-alive',
      'X-Accel-Buffering':  'no',
    },
  })
}
