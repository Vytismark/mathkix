import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateAIResponse } from '@/lib/support/ai-responder'
import type { SupportUserContext } from '@/lib/anthropic/support-prompts'
import { sendNewTicketEmail, sendEscalationEmail } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const subject = String(body.subject ?? '').trim()
  const description = String(body.description ?? '').trim()

  if (!subject || subject.length > 200) {
    return NextResponse.json({ error: 'Subject is required (max 200 chars)' }, { status: 400 })
  }
  if (!description || description.length < 10) {
    return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .insert({ profile_id: user.id, subject, description })
    .select()
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }

  // Insert the initial user message
  await adminClient
    .from('support_messages')
    .insert({ ticket_id: ticket.id, sender_type: 'user', content: description })

  // Fetch user context for AI
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

  // Generate AI response
  const aiResponse = await generateAIResponse(description, [], userContext, 0)

  // Insert AI message via admin client (bypasses RLS)
  await adminClient
    .from('support_messages')
    .insert({ ticket_id: ticket.id, sender_type: 'ai', content: aiResponse.message })

  // Update ticket
  const ticketUpdate: Record<string, unknown> = { ai_message_count: 1 }
  if (aiResponse.escalate) {
    ticketUpdate.status = 'awaiting_human'
    ticketUpdate.escalated = true
    ticketUpdate.escalation_reason = aiResponse.escalation_reason
  }
  await adminClient
    .from('support_tickets')
    .update(ticketUpdate)
    .eq('id', ticket.id)

  // Fire-and-forget emails
  sendNewTicketEmail({
    id: ticket.id,
    subject,
    description,
    parentName: profile?.full_name ?? null,
    parentEmail: profile?.email ?? user.email ?? '',
  }).catch(() => {})

  if (aiResponse.escalate) {
    sendEscalationEmail({
      id: ticket.id,
      subject,
      escalation_reason: aiResponse.escalation_reason,
      parentName: profile?.full_name ?? null,
      parentEmail: profile?.email ?? user.email ?? '',
    }).catch(() => {})
  }

  // Fetch final ticket + messages
  const { data: messages } = await adminClient
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticket.id)
    .order('created_at', { ascending: true })

  const { data: finalTicket } = await adminClient
    .from('support_tickets')
    .select('*')
    .eq('id', ticket.id)
    .single()

  return NextResponse.json({ ticket: finalTicket, messages: messages ?? [] })
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: tickets, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('profile_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }

  return NextResponse.json({ tickets: tickets ?? [] })
}
