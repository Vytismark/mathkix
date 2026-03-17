import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId, childId } = await request.json()
  if (!sessionId || !childId) {
    return NextResponse.json({ error: 'sessionId and childId required' }, { status: 400 })
  }

  // Verify child ownership
  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()
  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  // Load session
  const { data: session } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('child_id', childId)
    .single()
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const engagementSummary = {
    questions_answered: session.questions_answered,
    correct_count: session.correct_count,
    xp_earned: session.xp_earned,
    completed_at: new Date().toISOString(),
  }

  await supabase
    .from('practice_sessions')
    .update({
      status: 'completed',
      engagement_summary: engagementSummary as Json,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  // Fire session_end behavioral event
  supabase.from('behavioral_events').insert({
    child_id: childId,
    session_id: sessionId,
    event_type: 'session_end',
    metadata: engagementSummary as Json,
  }).then(() => {})

  // ── Streak tracking ────────────────────────────────────────
  const today     = new Date().toISOString().slice(0, 10)  // YYYY-MM-DD
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

  const [{ data: childStreak }, { data: prevSession }] = await Promise.all([
    supabase.from('children').select('streak_days').eq('id', childId).single(),
    supabase
      .from('practice_sessions')
      .select('completed_at')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .neq('id', sessionId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const lastDate      = prevSession?.completed_at?.slice(0, 10) ?? null
  const currentStreak = childStreak?.streak_days ?? 0
  let newStreak: number

  if (!lastDate) {
    newStreak = 1                        // First ever session
  } else if (lastDate === today) {
    newStreak = currentStreak            // Multiple sessions same day - no change
  } else if (lastDate === yesterday) {
    newStreak = currentStreak + 1        // Consecutive day
  } else {
    newStreak = 1                        // Gap - reset
  }

  if (newStreak !== currentStreak) {
    await supabase.from('children').update({ streak_days: newStreak }).eq('id', childId)
  }

  return NextResponse.json({ ok: true })
}
