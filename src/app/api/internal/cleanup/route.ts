import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Mark quiz sessions as abandoned if in_progress for > 24 hours
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: abandoned, error: quizError } = await admin
    .from('quiz_sessions')
    .update({ status: 'abandoned' })
    .eq('status', 'in_progress')
    .lt('created_at', cutoff)
    .select('id')

  // Mark practice sessions as completed if active for > 24 hours
  const { data: stale, error: practiceError } = await admin
    .from('practice_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('status', 'active')
    .lt('created_at', cutoff)
    .select('id')

  const result = {
    quiz_sessions_abandoned: abandoned?.length ?? 0,
    practice_sessions_completed: stale?.length ?? 0,
    errors: [quizError?.message, practiceError?.message].filter(Boolean),
  }

  console.log('cleanup:', result)
  return NextResponse.json(result)
}
