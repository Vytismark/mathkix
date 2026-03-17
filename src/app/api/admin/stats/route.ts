import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin/auth'
import os from 'os'

export async function GET() {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = createAdminClient()

  const [
    { count: totalUsers },
    { count: totalChildren },
    { count: openTickets },
    { count: awaitingTickets },
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('children').select('*', { count: 'exact', head: true }),
    adminClient.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    adminClient.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'awaiting_human'),
  ])

  // Subscription breakdown with status
  const { data: subRows } = await adminClient
    .from('subscriptions')
    .select('plan_type, status')

  let paidUsers = 0
  let trialUsers = 0
  let otherUsers = 0

  for (const row of subRows ?? []) {
    if (row.status === 'trialing') {
      trialUsers++
    } else if (['active'].includes(row.status) && row.plan_type !== 'free') {
      paidUsers++
    } else {
      otherUsers++
    }
  }

  // Recent tickets
  const { data: recentTickets } = await adminClient
    .from('support_tickets')
    .select('id, subject, status, priority, created_at, profiles!support_tickets_profile_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Server info
  const cpus = os.cpus()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const loadAvg = os.loadavg()
  const uptimeSeconds = os.uptime()

  const server = {
    platform: os.platform(),
    hostname: os.hostname(),
    cpuCount: cpus.length,
    cpuModel: cpus[0]?.model ?? 'Unknown',
    memoryUsedGB: +(usedMem / 1073741824).toFixed(2),
    memoryTotalGB: +(totalMem / 1073741824).toFixed(2),
    memoryPct: +((usedMem / totalMem) * 100).toFixed(1),
    loadAvg1m: +loadAvg[0].toFixed(2),
    loadAvg5m: +loadAvg[1].toFixed(2),
    loadAvg15m: +loadAvg[2].toFixed(2),
    uptimeHours: +(uptimeSeconds / 3600).toFixed(1),
    nodeVersion: process.version,
  }

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    totalChildren: totalChildren ?? 0,
    openTickets: openTickets ?? 0,
    awaitingTickets: awaitingTickets ?? 0,
    paidUsers,
    trialUsers,
    otherUsers,
    recentTickets: recentTickets ?? [],
    server,
  })
}
