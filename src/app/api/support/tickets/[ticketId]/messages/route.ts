import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateAIResponse } from '@/lib/support/ai-responder'
import type { SupportUserContext } from '@/lib/anthropic/support-prompts'
import { sendEscalationEmail } from '@/lib/email/templates'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const content = String(body.content ?? '').trim()
  if (!content) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
  }

  // Verify ticket belongs to user (RLS)
  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  if (ticket.status === 'closed') {
    return NextResponse.json({ error: 'Ticket is closed' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Insert user message
  await supabase
    .from('support_messages')
    .insert({ ticket_id: ticketId, sender_type: 'user' as const, content })

  const newMessages: Array<{ sender_type: string; content: string; created_at: string }> = []

  // If ticket is still in AI-handled state (not awaiting_human), generate AI response
  if (ticket.status === 'open') {
    // Fetch conversation history
    const { data: history } = await adminClient
      .from('support_messages')
      .select('sender_type, content')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    // Fetch user context
    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('plan_type')
      .eq('profile_id', user.id)
      .single()

    const { count: childCount } = await adminClient
      .from('children')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)

    const userContext: SupportUserContext = {
      name: profile?.full_name ?? null,
      email: profile?.email ?? user.email ?? '',
      planType: subscription?.plan_type ?? 'free',
      childCount: childCount ?? 0,
    }

    const conversationHistory = (history ?? []).map((m) => ({
      sender_type: m.sender_type as 'user' | 'ai' | 'admin',
      content: m.content,
    }))

    const aiResponse = await generateAIResponse(
      content,
      conversationHistory,
      userContext,
      ticket.ai_message_count
    )

    // Insert AI message
    const { data: aiMsg } = await adminClient
      .from('support_messages')
      .insert({ ticket_id: ticketId, sender_type: 'ai', content: aiResponse.message })
      .select()
      .single()

    if (aiMsg) {
      newMessages.push(aiMsg)
    }

    // Update ticket
    const ticketUpdate: Record<string, unknown> = {
      ai_message_count: ticket.ai_message_count + 1,
    }
    if (aiResponse.escalate) {
      ticketUpdate.status = 'awaiting_human'
      ticketUpdate.escalated = true
      ticketUpdate.escalation_reason = aiResponse.escalation_reason

      sendEscalationEmail({
        id: ticketId,
        subject: ticket.subject,
        escalation_reason: aiResponse.escalation_reason,
        parentName: profile?.full_name ?? null,
        parentEmail: profile?.email ?? user.email ?? '',
      }).catch(() => {})
    }

    await adminClient
      .from('support_tickets')
      .update(ticketUpdate)
      .eq('id', ticketId)
  }

  // Return all messages
  const { data: allMessages } = await adminClient
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  return NextResponse.json({ messages: allMessages ?? [] })
}
