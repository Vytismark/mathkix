'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { captureEvent } from '@/lib/posthog/client'

export function TrialExpiredModal() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  // Don't block the billing page - user needs to be able to subscribe
  if (pathname.startsWith('/billing')) return null

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? ''

  useEffect(() => {
    captureEvent('trial_expired_modal_shown')
  }, [])

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

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,8,15,0.92)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="animate-scale-in w-full max-w-md rounded-3xl border border-white/10 p-8 text-center"
        style={{ background: '#0f1117' }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(54,120,255,0.15)', boxShadow: '0 0 24px rgba(54,120,255,0.25)' }}
        >
          <Lock className="w-7 h-7" style={{ color: '#3678FF' }} />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Your free trial has ended
        </h2>
        <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
          Subscribe to keep your children&apos;s progress, lessons, and AI-powered
          math learning going.
        </p>

        {/* Primary CTA */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="cta-btn w-full py-4 rounded-2xl text-white font-bold text-lg mb-3 disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #2557CC, #3678FF)',
            boxShadow: '0 4px 20px rgba(54,120,255,0.40)',
          }}
        >
          {loading ? 'Loading…' : 'Subscribe - $9.99 / month'}
        </button>

        {/* Secondary link */}
        <Link
          href="/billing"
          className="block text-sm text-slate-400 hover:text-white transition-colors"
        >
          See all plans (annual & lifetime) →
        </Link>

        <p className="text-xs text-slate-600 mt-6">
          Cancel anytime. No hidden fees.
        </p>
      </div>
    </div>
  )
}
