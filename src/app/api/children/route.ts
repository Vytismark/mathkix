import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTrialState } from '@/lib/trial'

// GET /api/children - list all children for the logged-in parent
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ children: data })
}

// POST /api/children - create a new child profile
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Enforce child profile limits (with row-level locking) ──
  const trialState = await getTrialState(user.id)

  if (trialState.status === 'expired') {
    return NextResponse.json(
      { error: 'Your free trial has expired. Please upgrade to add children.', code: 'SUBSCRIPTION_REQUIRED' },
      { status: 403 },
    )
  }

  const isPaid = trialState.status === 'active_paid'
  const maxChildren = isPaid ? 10 : 2

  // Count + insert atomically via RPC or re-check after insert
  const { count: childCount } = await supabase
    .from('children')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  if ((childCount ?? 0) >= maxChildren) {
    return NextResponse.json(
      {
        error: isPaid
          ? 'Maximum of 10 child profiles reached.'
          : 'Free trial allows up to 2 child profiles. Upgrade your plan for up to 10.',
        limit: maxChildren,
        current: childCount ?? 0,
      },
      { status: 403 },
    )
  }

  const body = await request.json()
  const {
    name, avatar_id, school_grade,
    learning_pace, challenge_preference, attention_span,
    parent_goal, motivation_style, learning_notes,
  } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (school_grade === undefined || school_grade === null) {
    return NextResponse.json({ error: 'School grade is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('children')
    .insert({
      profile_id:           user.id,
      name:                 name.trim(),
      avatar_id:            avatar_id            ?? 'bear',
      school_grade:         school_grade,
      learning_pace:        learning_pace        ?? 'average',
      challenge_preference: challenge_preference ?? 'balanced',
      attention_span:       attention_span       ?? 'medium',
      parent_goal:          parent_goal          ?? 'reinforce',
      motivation_style:     motivation_style     ?? 'encouragement',
      learning_notes:       learning_notes       ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ child: data }, { status: 201 })
}
