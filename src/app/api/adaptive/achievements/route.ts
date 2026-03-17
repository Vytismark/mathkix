import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const childId = searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  // Verify child ownership
  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('profile_id', user.id)
    .single()
  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('child_id', childId)
    .order('earned_at', { ascending: false })

  const totalXPFromAchievements = (achievements ?? []).reduce(
    (sum, a) => sum + (a.xp_bonus ?? 0),
    0
  )

  return NextResponse.json({ achievements: achievements ?? [], totalXPFromAchievements })
}
