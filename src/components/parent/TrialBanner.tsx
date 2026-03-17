'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface TrialBannerProps {
  daysLeft: number
  urgent: boolean // true = 1 day left (red), false = 7 days (amber)
}

export function TrialBanner({ daysLeft, urgent }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)

  if (dismissed) return null

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? ''

  async function handleSubscribe() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  const dayWord = daysLeft === 1 ? 'day' : 'days'

  return (
    <div
      className={`animate-slide-down relative flex items-center justify-between gap-4 px-5 py-3 text-sm font-medium rounded-xl mb-6 ${
        urgent
          ? 'bg-red-500/15 border border-red-500/30 text-red-300'
          : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
      }`}
    >
      <span>
        ⏳ Your free trial ends in{' '}
        <span className="font-bold">{daysLeft} {dayWord}</span>.{' '}
        Subscribe to keep access.
      </span>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={`cta-btn px-4 py-1.5 rounded-lg text-xs font-bold ${
            urgent ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
          }`}
        >
          {loading ? 'Loading…' : 'Subscribe now'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
