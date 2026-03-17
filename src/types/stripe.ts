export type PlanType = 'free' | 'monthly' | 'annual' | 'lifetime'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'

export interface PricingPlan {
  id: PlanType
  name: string
  price: number       // in cents
  interval: 'month' | 'year' | 'one_time' | null
  stripePriceId: string
  features: string[]
  highlighted?: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 999,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? '',
    features: [
      'Full Grades 1-5 curriculum, all subjects',
      'AI places your child at their exact level',
      'All your kids - no per-child fees',
      'Weekly parent progress reports',
      'Adapts as your child improves',
      'Cancel with one click, anytime',
    ],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 7999,
    interval: 'year',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL ?? '',
    features: [
      'Everything in Monthly',
      'Costs less than one tutoring hour per month',
      '2 months free vs. paying monthly',
      'Priority support with faster responses',
      'Early access to new features',
    ],
    highlighted: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 14999,
    interval: 'one_time',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME ?? '',
    features: [
      'Everything in Annual, forever',
      'One payment - never think about it again',
      'Every new grade & feature, included',
      'Pays for itself in under 15 months',
      'Dedicated priority support for life',
    ],
  },
]
