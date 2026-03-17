import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin/auth'
import { sendTicketResolvedEmail } from '@/lib/email/templates'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ticketId } = await params
  const adminClient = createAdminClient()

  const { data: ticket, error: ticketError } = await adminClient
    .from('support_tickets')
    .select('*, profiles!support_tickets_profile_id_fkey(full_name, email)')
    .eq('id', ticketId)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  const { data: messages } = await adminClient
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  // Get parent context
  const { count: childCount } = await adminClient
    .from('children')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', ticket.profile_id)

  const { data: subscription } = await adminClient
    .from('subscriptions')
    .select('plan_type, status')
    .eq('profile_id', ticket.profile_id)
    .single()

  return NextResponse.json({
    ticket,
    messages: messages ?? [],
    parentContext: {
      childCount: childCount ?? 0,
      planType: subscription?.plan_type ?? 'free',
      subscriptionStatus: subscription?.status ?? 'none',
    },
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ticketId } = await params
  const body = await request.json()
  const adminClient = createAdminClient()

  const update: Record<string, unknown> = {}
  if (body.status) update.status = body.status
  if (body.priority) update.priority = body.priority

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  // Fetch ticket before update for email notification
  const { data: existingTicket } = await adminClient
    .from('support_tickets')
    .select('*, profiles!support_tickets_profile_id_fkey(full_name, email)')
    .eq('id', ticketId)
    .single()

  const { data: ticket, error } = await adminClient
    .from('support_tickets')
    .update(update)
    .eq('id', ticketId)
    .select()
    .single()

  if (error || !ticket) {
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }

  // Send resolved email if status changed to resolved
  if (body.status === 'resolved' && existingTicket) {
    const profile = existingTicket.profiles as unknown as { full_name: string | null; email: string } | null
    if (profile?.email) {
      sendTicketResolvedEmail(
        profile.email,
        profile.full_name,
        existingTicket.subject
      ).catch(() => {})
    }
  }

  return NextResponse.json({ ticket })
}
