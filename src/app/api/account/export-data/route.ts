import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Rate limit: 1 export per hour per user
    if (isRateLimited(user.id, { namespace: 'export-data', maxRequests: 1, windowMs: 60 * 60 * 1000 })) {
      return NextResponse.json(
        { error: 'You can only export data once per hour. Please try again later.' },
        { status: 429 },
      )
    }

    const userId = user.id

    // Fetch profile and subscription
    const [profileResult, subscriptionResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('subscriptions').select('*').eq('profile_id', userId),
    ])

    // Fetch all children
    const { data: children } = await supabase
      .from('children')
      .select('*')
      .eq('profile_id', userId)

    // For each child, fetch all associated learning data
    const childrenWithData = await Promise.all(
      (children ?? []).map(async (child) => {
        const childId = child.id
        const [
          quizSessions,
          lessonAttempts,
          mastery,
          snapshots,
          practiceSessions,
          events,
          affinity,
          srItems,
          achievements,
        ] = await Promise.all([
          supabase.from('quiz_sessions').select('*').eq('child_id', childId),
          supabase.from('lesson_attempts').select('*').eq('child_id', childId),
          supabase.from('child_standard_mastery').select('*').eq('child_id', childId),
          supabase.from('progress_snapshots').select('*').eq('child_id', childId),
          supabase.from('practice_sessions').select('*').eq('child_id', childId),
          supabase.from('behavioral_events').select('*').eq('child_id', childId),
          supabase.from('topic_affinity').select('*').eq('child_id', childId),
          supabase.from('spaced_repetition_items').select('*').eq('child_id', childId),
          supabase.from('achievements').select('*').eq('child_id', childId),
        ])

        return {
          ...child,
          quiz_sessions: quizSessions.data ?? [],
          lesson_attempts: lessonAttempts.data ?? [],
          standard_mastery: mastery.data ?? [],
          progress_snapshots: snapshots.data ?? [],
          practice_sessions: practiceSessions.data ?? [],
          behavioral_events: events.data ?? [],
          topic_affinity: affinity.data ?? [],
          spaced_repetition: srItems.data ?? [],
          achievements: achievements.data ?? [],
        }
      }),
    )

    // Fetch support tickets with messages
    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('*, support_messages(*)')
      .eq('profile_id', userId)

    const exportData = {
      exported_at: new Date().toISOString(),
      account: {
        profile: profileResult.data,
        subscriptions: subscriptionResult.data ?? [],
      },
      children: childrenWithData,
      support_tickets: tickets ?? [],
    }

    const dateStr = new Date().toISOString().slice(0, 10)

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mathkix-data-export-${dateStr}.json"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
