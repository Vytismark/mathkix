import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BehavioralEvent } from '@/types/adaptive'
import type { Json } from '@/types/database'

export const dynamic = 'force-dynamic'

/**
 * Fire-and-forget behavioral event endpoint.
 * Used for pause events, emoji reactions, and other lightweight signals
 * that don't go through the main session/next flow.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: Partial<BehavioralEvent> = await request.json()

  if (!body.child_id || !body.event_type) {
    return NextResponse.json({ error: 'child_id and event_type required' }, { status: 400 })
  }

  // Verify child ownership
  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('id', body.child_id)
    .eq('profile_id', user.id)
    .single()
  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  await supabase.from('behavioral_events').insert({
    child_id:      body.child_id,
    session_id:    body.session_id ?? null,
    event_type:    body.event_type,
    domain:        body.domain ?? null,
    standard_code: body.standard_code ?? null,
    question_id:   body.question_id ?? null,
    time_ms:       body.time_ms ?? null,
    metadata:      (body.metadata ?? {}) as Json,
  })

  return NextResponse.json({ ok: true })
}
