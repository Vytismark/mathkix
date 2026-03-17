import { createClient } from '@/lib/supabase/server'

export type TrialState =
  | { status: 'active_paid' }
  | { status: 'in_trial';  daysLeft: number }
  | { status: 'warning_7'; daysLeft: number }
  | { status: 'warning_1'; daysLeft: number }
  | { status: 'expired' }

export async function getTrialState(userId: string): Promise<TrialState> {
  // Dev-only override: set TRIAL_STATE_OVERRIDE in .env.local to test UI states
  // Values: expired | warning_1 | warning_7 | in_trial | active_paid
  // if (process.env.NODE_ENV === 'development' && process.env.TRIAL_STATE_OVERRIDE) {
  //   const override = process.env.TRIAL_STATE_OVERRIDE
  //   if (override === 'expired')    return { status: 'expired' }
  //   if (override === 'warning_1')  return { status: 'warning_1', daysLeft: 1 }
  //   if (override === 'warning_7')  return { status: 'warning_7', daysLeft: 5 }
  //   if (override === 'in_trial')   return { status: 'in_trial',  daysLeft: 20 }
  //   if (override === 'active_paid') return { status: 'active_paid' }
  // }

  const supabase = await createClient()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_type, status, current_period_end')
    .eq('profile_id', userId)
    .single()

  // Paid and active → no trial UI
  if (
    sub &&
    ['monthly', 'annual', 'lifetime'].includes(sub.plan_type) &&
    sub.status === 'active'
  ) {
    return { status: 'active_paid' }
  }

  // Determine trial end date
  let trialEnd: Date

  if (sub?.current_period_end) {
    trialEnd = new Date(sub.current_period_end)
  } else {
    // Fallback: derive from profile created_at
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .single()

    const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date()
    trialEnd = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000)
  }

  const msLeft = trialEnd.getTime() - Date.now()
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))

  if (daysLeft <= 0) return { status: 'expired' }
  if (daysLeft <= 1) return { status: 'warning_1', daysLeft }
  if (daysLeft <= 7) return { status: 'warning_7', daysLeft }
  return { status: 'in_trial', daysLeft }
}
