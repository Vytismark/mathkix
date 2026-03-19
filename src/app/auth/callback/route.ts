import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enqueueDripSeries } from '@/lib/email/drip-queue'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/select'

  if (code) {
    const supabase = await createClient()
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Enqueue drip series for new users (idempotent — UNIQUE key prevents duplicates)
      if (sessionData?.user) {
        const userId = sessionData.user.id
        const admin = createAdminClient()
        // Check if this is a genuinely new user (no existing drip emails queued)
        const { count } = await admin
          .from('email_queue')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', userId)
        if ((count ?? 0) === 0) {
          // Fetch trial end from subscriptions
          const { data: sub } = await admin
            .from('subscriptions')
            .select('current_period_end')
            .eq('profile_id', userId)
            .single()
          const trialEnd = sub?.current_period_end
            ? new Date(sub.current_period_end)
            : new Date(Date.now() + 30 * 86_400_000)
          const firstName = sessionData.user.user_metadata?.full_name?.split(' ')[0] ?? null
          enqueueDripSeries(userId, trialEnd, firstName).catch((e) => {
            console.error('Failed to enqueue drip series:', e)
          })
        }
      }
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url))
}
