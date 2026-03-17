import { anthropic } from '@/lib/anthropic/client'
import {
  buildSupportSystemPrompt,
  type SupportUserContext,
} from '@/lib/anthropic/support-prompts'

export interface AIResponse {
  message: string
  escalate: boolean
  escalation_reason: string | null
}

interface ConversationMessage {
  sender_type: 'user' | 'ai' | 'admin'
  content: string
}

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  userContext: SupportUserContext,
  aiMessageCount: number
): Promise<AIResponse> {
  const systemPrompt = buildSupportSystemPrompt(userContext, aiMessageCount)

  // Build conversation messages for Claude
  const messages = conversationHistory.map((msg) => ({
    role: (msg.sender_type === 'user' ? 'user' : 'assistant') as
      | 'user'
      | 'assistant',
    content:
      msg.sender_type === 'admin'
        ? `[Human Support Agent]: ${msg.content}`
        : msg.content,
  }))

  // Add the new user message
  messages.push({ role: 'user', content: userMessage })

  // Deduplicate consecutive same-role messages (Claude API requires alternating)
  const dedupedMessages: { role: 'user' | 'assistant'; content: string }[] = []
  for (const msg of messages) {
    if (
      dedupedMessages.length > 0 &&
      dedupedMessages[dedupedMessages.length - 1].role === msg.role
    ) {
      dedupedMessages[dedupedMessages.length - 1].content +=
        '\n\n' + msg.content
    } else {
      dedupedMessages.push({ ...msg })
    }
  }

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: dedupedMessages,
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''

  return parseAIResponse(text)
}

function parseAIResponse(text: string): AIResponse {
  try {
    const parsed = JSON.parse(text)
    return {
      message: String(parsed.message ?? ''),
      escalate: Boolean(parsed.escalate),
      escalation_reason: parsed.escalation_reason
        ? String(parsed.escalation_reason)
        : null,
    }
  } catch {
    // Fallback: try to extract message from malformed JSON
    const messageMatch = text.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/)

    const escalateMatch = text.match(/"escalate"\s*:\s*(true|false)/)

    if (messageMatch) {
      return {
        message: messageMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
        escalate: escalateMatch?.[1] === 'true',
        escalation_reason: null,
      }
    }

    // Last resort: use the raw text as the message
    return {
      message: text.slice(0, 500),
      escalate: false,
      escalation_reason: null,
    }
  }
}
