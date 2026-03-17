import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BillingCard } from '@/components/parent/BillingCard'

export const metadata: Metadata = { title: 'Billing' }

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status, current_period_start, current_period_end, cancel_at_period_end')
    .eq('profile_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-1.5">Billing & Plans</h1>
      <p className="text-slate-500 text-sm mb-10">
        30-day free trial, then choose a plan. No credit card required to start.
      </p>
      <BillingCard subscription={subscription} />
    </div>
  )
}
