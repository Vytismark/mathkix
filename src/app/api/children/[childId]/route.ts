import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ childId: string }> }

// GET /api/children/[childId]
export async function GET(_req: NextRequest, { params }: Params) {
  const { childId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ child: data })
}

// PATCH /api/children/[childId]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { childId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    name, avatar_id, school_grade, grade_level,
    learning_pace, challenge_preference, attention_span,
    parent_goal, motivation_style, learning_notes,
  } = body

  const updates: Record<string, unknown> = {}
  if (name                 !== undefined) updates.name                 = name.trim()
  if (avatar_id            !== undefined) updates.avatar_id            = avatar_id
  if (school_grade         !== undefined) updates.school_grade         = school_grade
  if (grade_level          !== undefined) updates.grade_level          = grade_level
  if (learning_pace        !== undefined) updates.learning_pace        = learning_pace
  if (challenge_preference !== undefined) updates.challenge_preference = challenge_preference
  if (attention_span       !== undefined) updates.attention_span       = attention_span
  if (parent_goal          !== undefined) updates.parent_goal          = parent_goal
  if (motivation_style     !== undefined) updates.motivation_style     = motivation_style
  if (learning_notes       !== undefined) updates.learning_notes       = learning_notes

  const { data, error } = await supabase
    .from('children')
    .update(updates)
    .eq('id', childId)
    .eq('profile_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ child: data })
}

// DELETE /api/children/[childId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { childId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('children')
    .delete()
    .eq('id', childId)
    .eq('profile_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
