import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin/auth'
import { sendAdminReplyEmail } from '@/lib/email/templates'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ticketId } = await params
  const body = await request.json()
  const content = String(body.content ?? '').trim()
  if (!content) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Verify ticket exists
  const { data: ticket, error: ticketError } = await adminClient
    .from('support_tickets')
    .select('*, profiles!support_tickets_profile_id_fkey(full_name, email)')
    .eq('id', ticketId)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  // Insert admin message
  await adminClient
    .from('support_messages')
    .insert({ ticket_id: ticketId, sender_type: 'admin', content })

  // If ticket was awaiting_human, move back to open
  if (ticket.status === 'awaiting_human') {
    await adminClient
      .from('support_tickets')
      .update({ status: 'open' })
      .eq('id', ticketId)
  }

  // Email the parent
  const profile = ticket.profiles as unknown as { full_name: string | null; email: string } | null
  if (profile?.email) {
    sendAdminReplyEmail(
      profile.email,
      profile.full_name,
      ticket.subject
    ).catch(() => {})
  }

  // Return updated messages
  const { data: messages } = await adminClient
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  return NextResponse.json({ messages: messages ?? [] })
}
