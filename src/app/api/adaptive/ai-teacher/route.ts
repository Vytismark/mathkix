import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireActiveSubscription } from '@/lib/subscription-guard'
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
    gradeLevel?: number
  } = await request.json()

  const {
    childId, message, contextHint, currentQuestion, correctAnswer,
    history, sessionId, autoGreet, wrongExplain,
    struggleCount: rawStruggle, emotionSignal: rawEmotion, problemType: rawProblem,
    progressSummary, gradeLevel: clientGradeLevel,
    profileAdjustments,
  } = body as typeof body & { profileAdjustments?: Record<string, string> }

  if (!childId || !message) {
    return NextResponse.json({ error: 'childId and message required' }, { status: 400 })
  }

  // Defaults for new optional fields (backward compatible)
  const struggleCount = rawStruggle ?? 0
  const emotionSignal: EmotionSignal = rawEmotion ?? 'neutral'
  const problemType: ProblemType = rawProblem ?? 'other'

  // Parallelize subscription check + child lookup (both only need user.id / childId)
  const [blocked, { data: child }] = await Promise.all([
    requireActiveSubscription(user.id),
    supabase.from('children').select('id, name, grade_level').eq('id', childId).eq('profile_id', user.id).single(),
  ])
  if (blocked) return blocked

  // Fall back to client-supplied grade level if DB lookup fails (e.g. during setup)
  const gradeLevel = child?.grade_level ?? clientGradeLevel ?? 2
  const childName = child?.name ?? 'there'

  // Strip trailing parenthetical hints like "(also: rhombus, ...)" from answer
  // before giving it to Claude so it never leaks into responses
  function cleanAnswer(ans: string | undefined | null): string | undefined {
    if (!ans) return undefined
    return ans.replace(/\s*\([^)]*\)\s*\.?\s*$/, '').trim() || ans
  }
  const displayableAnswer = cleanAnswer(correctAnswer)

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
  if (wrongExplain && currentQuestion && displayableAnswer) {
    systemPrompt = buildWrongAnswerExplainPrompt(gradeLevel, childName, currentQuestion, displayableAnswer, problemType)
  } else if (autoGreet && currentQuestion) {
    const greetBase = buildAutoGreetPrompt(gradeLevel, childName, currentQuestion, problemType)
    systemPrompt = displayableAnswer
      ? `${greetBase}\n\nCORRECT ANSWER (NEVER reveal): "${displayableAnswer}"`
      : greetBase
  } else if (contextHint && !message.trim()) {
    const base = buildClickToExplainPrompt(gradeLevel, childName, contextHint, emotionSignal)
    systemPrompt = currentQuestion
      ? `${base}${buildContextBlock(currentQuestion, displayableAnswer)}`
      : base
  } else {
    const base = buildTeacherSystemPrompt(gradeLevel, childName, promptOptions)
    systemPrompt = currentQuestion
      ? `${base}${buildContextBlock(currentQuestion, displayableAnswer)}`
      : base
  }

  // Inject progress summary as context before conversation
  if (progressSummary) {
    systemPrompt = `[PROGRESS: ${progressSummary}. Struggle count: ${struggleCount}. Emotion: ${emotionSignal}.]\n\n${systemPrompt}`
  }

  // Inject profile-based personality adjustments
  if (profileAdjustments) {
    const personalityRules: string[] = []

    if (profileAdjustments.anxietyLevel === 'high') {
      personalityRules.push('This child has MATH ANXIETY. Be extra warm, encouraging, and patient. Celebrate small wins. Never express surprise at mistakes. Use phrases like "That\'s a great try!" and "You\'re getting closer!"')
    }
    if (profileAdjustments.explanationDepth === 'brief') {
      personalityRules.push('This child prefers BRIEF explanations. Keep responses to 1-2 short sentences. Do not over-explain.')
    } else if (profileAdjustments.explanationDepth === 'detailed') {
      personalityRules.push('This child benefits from DETAILED explanations. Break things down step by step. Use examples.')
    }
    if (profileAdjustments.mindset === 'fixed_leaning') {
      personalityRules.push('This child shows FIXED MINDSET tendencies. Frame errors as learning: "You haven\'t got it YET" not "That\'s wrong." Emphasize effort over ability. Never say "this is easy."')
    }
    if (profileAdjustments.errorStrategy === 'slow_down') {
      personalityRules.push('This child makes CARELESS errors (knows the concept but rushes). Encourage them to slow down and double-check. Say things like "Take your time" and "Let\'s check each step."')
    } else if (profileAdjustments.errorStrategy === 'reteach') {
      personalityRules.push('This child makes CONCEPTUAL errors (misunderstands the method). When they\'re wrong, re-explain the concept from the beginning with a simpler example.')
    } else if (profileAdjustments.errorStrategy === 'simplify_language') {
      personalityRules.push('This child struggles with READING COMPREHENSION in math. Use simple words. Break word problems into shorter sentences. Highlight the key numbers and operation.')
    }
    if (profileAdjustments.hintStyle === 'minimal') {
      personalityRules.push('This child is SELF-SUFFICIENT. Give minimal hints — a single nudge like "What operation?" is enough. Do not over-scaffold.')
    } else if (profileAdjustments.hintStyle === 'full_scaffold') {
      personalityRules.push('This child needs FULL SCAFFOLDING. Walk through the problem step by step. Show the first step explicitly, then guide them through the next.')
    }

    if (personalityRules.length > 0) {
      systemPrompt = `[CHILD PROFILE - adapt your teaching style accordingly:\n${personalityRules.join('\n')}\n]\n\n${systemPrompt}`
    }
  }

  const rawUserContent = buildTeacherUserMessage(message, contextHint)
  // For auto-greet and wrong-explain, use directive-style triggers so Claude
  // follows the system prompt instead of treating the placeholder as child speech
  let userContent: string
  if (autoGreet) {
    userContent = '[New question loaded. Greet the student about this math problem.]'
  } else if (wrongExplain) {
    userContent = '[Student answered incorrectly. Explain why the correct answer is right.]'
  } else {
    userContent = rawUserContent.trim() ? rawUserContent : 'Hello!'
  }

  // Keep last 6 turns of history, excluding any empty-content messages
  const recentHistory = (history ?? [])
    .filter((m) => m.content && m.content.trim())
    .slice(-6)

  const claudeMessages = [
    ...recentHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userContent },
  ]

  // ── Prefetch mode: return plain JSON for pre-fetching greetings ──────────
  // Called with ?prefetch=true from the session page to pre-load auto-greet
  // responses during answer-transition animations (no SSE overhead needed)
  const isPrefetch = new URL(request.url).searchParams.get('prefetch') === 'true'
  if (isPrefetch && autoGreet) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: systemPrompt,
        messages: claudeMessages,
      })
      const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
      return NextResponse.json({ text })
    } catch (err) {
      console.error('[ai-teacher] prefetch error:', err)
      return NextResponse.json({ text: '' })
    }
  }

  // Stream response from Claude
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = await anthropic.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: wrongExplain ? 300 : 200,
          system: systemPrompt,
          messages: claudeMessages,
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
        console.error('[ai-teacher] Anthropic error:', err)
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
