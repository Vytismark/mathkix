import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')

  const adminClient = createAdminClient()

  let query = adminClient
    .from('support_tickets')
    .select('*, profiles!support_tickets_profile_id_fkey(full_name, email)')
    .order('updated_at', { ascending: false })

  if (status) {
    query = query.eq('status', status as 'open' | 'awaiting_human' | 'resolved' | 'closed')
  }
  if (priority) {
    query = query.eq('priority', priority as 'low' | 'medium' | 'high' | 'urgent')
  }

  const { data: tickets, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }

  // Get counts per status
  const { count: openCount } = await adminClient
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')

  const { count: awaitingCount } = await adminClient
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'awaiting_human')

  const { count: resolvedCount } = await adminClient
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'resolved')

  const { count: closedCount } = await adminClient
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'closed')

  return NextResponse.json({
    tickets: tickets ?? [],
    counts: {
      open: openCount ?? 0,
      awaiting_human: awaitingCount ?? 0,
      resolved: resolvedCount ?? 0,
      closed: closedCount ?? 0,
      total: (openCount ?? 0) + (awaitingCount ?? 0) + (resolvedCount ?? 0) + (closedCount ?? 0),
    },
  })
}
