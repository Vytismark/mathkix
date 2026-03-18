import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      if (!userId) break

      if (session.mode === 'subscription' && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        await upsertSubscription(supabase, userId, sub)
      } else if (session.mode === 'payment') {
        // Lifetime purchase
        await supabase.from('subscriptions').upsert({
          profile_id: userId,
          plan_type: 'lifetime',
          status: 'active',
          stripe_price_id: session.line_items?.data[0]?.price?.id ?? null,
        })
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer
      const userId = customer.metadata?.supabase_user_id
      if (userId) await upsertSubscription(supabase, userId, sub)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer
      const userId = customer.metadata?.supabase_user_id
      if (userId) {
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

async function upsertSubscription(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  sub: Stripe.Subscription
) {
  const priceId = sub.items.data[0]?.price.id ?? null
  const planType = getPlanType(priceId)

  await supabase.from('subscriptions').upsert({
    profile_id: userId,
    stripe_subscription_id: sub.id,
    stripe_price_id: priceId,
    plan_type: planType,
    status: sub.status as 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete',
    current_period_start: sub.billing_cycle_anchor
      ? new Date(sub.billing_cycle_anchor * 1000).toISOString()
      : null,
    current_period_end: (sub as unknown as { current_period_end?: number }).current_period_end
      ? new Date(((sub as unknown as { current_period_end: number }).current_period_end) * 1000).toISOString()
      : null,
    cancel_at_period_end: sub.cancel_at_period_end,
  })
}

function getPlanType(priceId: string | null): 'free' | 'monthly' | 'annual' | 'lifetime' {
  if (!priceId) return 'free'
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return 'monthly'
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return 'annual'
  if (priceId === process.env.STRIPE_PRICE_LIFETIME) return 'lifetime'
  return 'monthly'
}
