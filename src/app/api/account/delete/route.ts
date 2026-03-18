import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: Request) {
  try {
    const { confirmation } = await request.json()

    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'You must type DELETE to confirm account deletion' },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = user.id

    // Get stripe_customer_id from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    // Step 1: Cancel Stripe subscriptions and delete customer (external system first)
    if (profile?.stripe_customer_id) {
      try {
        // Cancel all active subscriptions
        const subs = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'all',
        })

        for (const sub of subs.data) {
          if (['active', 'trialing', 'past_due'].includes(sub.status)) {
            await stripe.subscriptions.cancel(sub.id)
          }
        }

        // Delete the Stripe customer entirely
        await stripe.customers.del(profile.stripe_customer_id)
      } catch (stripeError) {
        console.error('Stripe cleanup failed:', stripeError)
        return NextResponse.json(
          { error: 'Failed to cancel subscription. Please try again or contact support.' },
          { status: 500 },
        )
      }
    }

    // Step 2: Delete auth user via admin client
    // Cascade chain: auth.users → profiles → children → all child sub-tables,
    //                profiles → subscriptions,
    //                profiles → support_tickets → support_messages
    const adminClient = createAdminClient()
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Auth user deletion failed:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
