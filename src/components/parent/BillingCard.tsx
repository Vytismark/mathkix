'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, ExternalLink, ShieldCheck, RotateCcw, TrendingUp } from 'lucide-react'
import { PRICING_PLANS } from '@/types/stripe'

interface BillingCardProps {
  justPurchased?: boolean
  subscription: {
    plan_type: string
    status: string
    current_period_start: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
  } | null
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  active:     { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', label: 'Active' },
  trialing:   { bg: 'rgba(14,165,233,0.15)',  text: '#38bdf8', label: 'Free trial' },
  past_due:   { bg: 'rgba(239,68,68,0.15)',   text: '#f87171', label: 'Past due' },
  canceled:   { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', label: 'Canceled' },
  incomplete: { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', label: 'Incomplete' },
}

const PLAN_META: Record<string, { tagline: string; priceNote: string }> = {
  monthly:  { tagline: 'Flexible, no commitment',     priceNote: 'Billed every month' },
  annual:   { tagline: 'How most families subscribe', priceNote: '$6.67 / mo \u00b7 2 months free' },
  lifetime: { tagline: 'Pay once, done forever',      priceNote: 'One-time, never renews' },
}

export function BillingCard({ subscription, justPurchased }: BillingCardProps) {
  const router = useRouter()
  const [loadingPortal, setLoadingPortal]     = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null)
  const [verifying, setVerifying]             = useState(justPurchased && !subscription?.status?.match(/^active$/))

  useEffect(() => {
    if (!verifying) return
    // Auto-refresh after 3 seconds to pick up the Stripe webhook update
    const timer = setTimeout(() => {
      router.refresh()
      setVerifying(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [verifying, router])

  const isPaidActive = (
    subscription?.status === 'active' &&
    ['monthly', 'annual', 'lifetime'].includes(subscription?.plan_type ?? '')
  )
  const isTrialing    = subscription?.status === 'trialing'
  const currentPlanId = subscription?.plan_type ?? null

  async function handlePortal() {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/stripe/create-portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) { toast.error(error); setLoadingPortal(false); return }
      window.location.href = url
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoadingPortal(false)
    }
  }

  async function handleSubscribe(stripePriceId: string) {
    setLoadingCheckout(stripePriceId)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: stripePriceId }),
      })
      const { url, error } = await res.json()
      if (error) { toast.error(error); setLoadingCheckout(null); return }
      if (url) window.location.href = url
      else { toast.error('Could not open checkout'); setLoadingCheckout(null) }
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoadingCheckout(null)
    }
  }

  const trialEndDate = isTrialing && subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null
  const trialStartDate = isTrialing && subscription?.current_period_start
    ? new Date(subscription.current_period_start)
    : null
  const trialDaysLeft = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / 86_400_000))
    : null
  const trialTotal = (trialEndDate && trialStartDate)
    ? Math.round((trialEndDate.getTime() - trialStartDate.getTime()) / 86_400_000)
    : 30
  const trialProgress = trialDaysLeft !== null
    ? Math.max(0, Math.min(100, ((trialTotal - trialDaysLeft) / trialTotal) * 100))
    : 0

  const badge = subscription ? (STATUS_BADGE[subscription.status] ?? STATUS_BADGE.canceled) : null

  return (
    <div className="space-y-10">

      {/* ── Payment verification banner ── */}
      {verifying && (
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
          style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' }}
        >
          <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0" />
          <p className="text-emerald-300 text-sm font-medium">
            Confirming your payment… This will refresh automatically.
          </p>
        </div>
      )}

      {/* ── Trial / current plan status ── */}
      {subscription && (
        <div
          className="animate-fade-in-up rounded-2xl border border-white/10 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5"
          style={{ background: 'rgba(255,255,255,0.03)', animationDelay: '0ms' }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-white font-semibold capitalize">
                {currentPlanId === 'free' ? 'Free Trial' : currentPlanId + ' plan'}
              </p>
              {badge && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: badge.bg, color: badge.text }}
                >
                  {badge.label}
                </span>
              )}
            </div>

            {isTrialing && trialDaysLeft !== null ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  {trialDaysLeft > 0 ? (
                    <>
                      <span
                        className="font-semibold"
                        style={{ color: trialDaysLeft <= 3 ? '#f87171' : trialDaysLeft <= 7 ? '#fbbf24' : '#38bdf8' }}
                      >
                        {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining
                      </span>
                      {' \u00b7 ends '}{trialEndDate?.toLocaleDateString()}
                    </>
                  ) : (
                    <span className="text-red-400 font-semibold">
                      Trial ended \u2014 subscribe below to continue
                    </span>
                  )}
                </p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="progress-bar-animated h-full rounded-full"
                    style={{
                      '--progress-target': trialProgress + '%',
                      background: trialDaysLeft <= 3
                        ? 'linear-gradient(90deg,#ef4444,#f87171)'
                        : trialDaysLeft <= 7
                        ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                        : 'linear-gradient(90deg,#38bdf8,#818cf8)',
                    } as React.CSSProperties}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  {trialTotal - (trialDaysLeft ?? 0)} of {trialTotal} trial days used
                </p>
              </div>
            ) : isPaidActive && subscription.current_period_end ? (
              <p className="text-sm text-slate-500">
                {subscription.cancel_at_period_end ? 'Cancels' : 'Renews'}{' '}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            ) : null}
          </div>

          {isPaidActive && (
            <button
              onClick={handlePortal}
              disabled={loadingPortal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all disabled:opacity-50 shrink-0"
            >
              {loadingPortal ? 'Opening...' : 'Manage subscription'}
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* ── Section header ── */}
      <div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <h2 className="text-2xl font-bold text-white mb-1.5">
          {isPaidActive ? 'Switch plans' : 'Simple, honest pricing'}
        </h2>
        <p className="text-slate-500 text-sm">
          {isPaidActive
            ? 'Upgrade to annual or lifetime and keep more money in your pocket.'
            : 'Less than a single tutoring session. Everything included, no surprise fees.'}
        </p>
      </div>

      {/* ── Plan cards ── annual is elevated ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-start">
        {PRICING_PLANS.map((plan, i) => {
          const isCurrent  = currentPlanId === plan.id && isPaidActive
          const isHigher   =
            (plan.id === 'annual'   && currentPlanId === 'monthly') ||
            (plan.id === 'lifetime' && (currentPlanId === 'monthly' || currentPlanId === 'annual'))
          const isAnnual   = !!plan.highlighted
          const isLifetime = plan.id === 'lifetime'
          const meta       = PLAN_META[plan.id] ?? { tagline: '', priceNote: '' }

          const accentColor = isAnnual ? '#818cf8' : isLifetime ? '#fbbf24' : '#3678FF'
          const checkBg     = isAnnual
            ? 'rgba(99,102,241,0.22)'
            : isLifetime
            ? 'rgba(217,119,6,0.2)'
            : 'rgba(16,185,129,0.15)'
          const checkColor  = isAnnual ? '#818cf8' : isLifetime ? '#fbbf24' : '#34d399'
          const ctaBg       = isAnnual
            ? 'linear-gradient(135deg,#6366f1,#4f46e5)'
            : isLifetime
            ? 'linear-gradient(135deg,#d97706,#b45309)'
            : 'linear-gradient(135deg,#2557CC,#3678FF)'

          const cardBorder = isCurrent
            ? '1.5px solid rgba(16,185,129,0.45)'
            : isAnnual
            ? '1.5px solid rgba(99,102,241,0.55)'
            : isLifetime
            ? '1px solid rgba(217,119,6,0.28)'
            : '1px solid rgba(255,255,255,0.09)'

          const cardBg = isCurrent
            ? 'rgba(16,185,129,0.05)'
            : isAnnual
            ? 'rgba(99,102,241,0.09)'
            : isLifetime
            ? 'rgba(217,119,6,0.06)'
            : 'rgba(255,255,255,0.04)'

          const cardShadow = isAnnual
            ? '0 24px 64px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.12)'
            : 'none'

          // Annual uses its own CSS class that manages the base -12px + hover -20px in one go
          const cardClass = isAnnual ? 'plan-card-annual' : 'plan-card'

          return (
            <div
              key={plan.id}
              className={`group animate-fade-in-up relative rounded-3xl overflow-hidden flex flex-col ${cardClass}`}
              style={{
                background: cardBg,
                border: cardBorder,
                boxShadow: cardShadow,
                animationDelay: `${160 + i * 80}ms`,
              }}
            >
              {/* Top accent line for annual */}
              {isAnnual && (
                <div
                  className="absolute top-0 inset-x-0 h-[2px]"
                  style={{ background: 'linear-gradient(90deg,transparent,#6366f1,#818cf8,#6366f1,transparent)' }}
                />
              )}

              {/* Header */}
              <div className="px-6 pt-7 pb-5 border-b border-white/[0.06]">
                <div className="flex items-start justify-between gap-2 mb-5">
                  <div>
                    <p className="text-white font-bold text-base leading-tight">{plan.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{meta.tagline}</p>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                      Your plan
                    </span>
                  )}
                  {!isCurrent && isAnnual && (
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                      style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
                    >
                      Most popular
                    </span>
                  )}
                  {!isCurrent && isLifetime && (
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                      style={{ background: 'rgba(217,119,6,0.18)', color: '#fbbf24' }}
                    >
                      Best value
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-end gap-0.5 mb-1">
                  <span className="text-lg font-bold self-start mt-1.5" style={{ color: accentColor }}>$</span>
                  <span className="text-[52px] font-black text-white leading-none tracking-tighter">
                    {(plan.price / 100).toFixed(2).replace(/\.?0+$/, '')}
                  </span>
                  <span className="text-slate-500 text-sm mb-2 ml-0.5">
                    {plan.interval === 'month' ? '/mo' : plan.interval === 'year' ? '/yr' : ''}
                  </span>
                </div>
                <p className="text-xs font-semibold" style={{ color: isAnnual ? '#818cf8' : isLifetime ? '#d97706' : 'rgba(148,163,184,0.7)' }}>
                  {meta.priceNote}
                </p>
              </div>

              {/* Features */}
              <div className="px-6 py-5 flex-1 space-y-3">
                {plan.features.map((f, fi) => (
                  <div
                    key={f}
                    className="flex items-start gap-3 animate-fade-in-up"
                    style={{ animationDelay: `${240 + i * 80 + fi * 40}ms` }}
                  >
                    <div
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110"
                      style={{ background: checkBg }}
                    >
                      <Check className="w-2.5 h-2.5" style={{ color: checkColor, strokeWidth: 3 }} />
                    </div>
                    <span className="text-sm leading-snug" style={{ color: 'rgba(203,213,225,0.85)' }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-6 pb-6 pt-1">
                {isCurrent ? (
                  <div className="w-full py-3 rounded-xl text-sm font-semibold text-slate-600 border border-white/[0.08] text-center">
                    Your current plan
                  </div>
                ) : (
                  <button
                    className="cta-btn w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                    style={{
                      background: ctaBg,
                      boxShadow: isAnnual
                        ? '0 4px 24px rgba(99,102,241,0.35)'
                        : isLifetime
                        ? '0 4px 20px rgba(217,119,6,0.3)'
                        : '0 4px 20px rgba(192,57,43,0.3)',
                    }}
                    disabled={loadingCheckout === plan.stripePriceId}
                    onClick={() => handleSubscribe(plan.stripePriceId)}
                  >
                    {loadingCheckout === plan.stripePriceId
                      ? 'Loading...'
                      : isHigher     ? 'Upgrade to ' + plan.name
                      : isPaidActive ? 'Switch to ' + plan.name
                      : isAnnual     ? 'Start with Annual'
                      : isLifetime   ? 'Get Lifetime Access'
                                     : 'Start Monthly'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Footer trust row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { Icon: ShieldCheck, color: '#34d399', bg: 'rgba(16,185,129,0.12)', title: 'Stripe-secured',    body: 'Industry-standard checkout. We never touch your card details.' },
          { Icon: RotateCcw,   color: '#38bdf8', bg: 'rgba(14,165,233,0.12)', title: 'Cancel any time',   body: 'Monthly and annual plans cancel instantly - no phone calls.' },
          { Icon: TrendingUp,  color: '#818cf8', bg: 'rgba(99,102,241,0.12)', title: 'Progress is yours', body: "Grades, streaks and XP stay in your account no matter what." },
        ].map(({ Icon, color, bg, title, body }, ti) => (
          <div
            key={title}
            className="trust-tile animate-fade-in-up flex items-start gap-3 px-4 py-4 rounded-2xl cursor-default"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)',
              animationDelay: `${480 + ti * 60}ms`,
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200"
              style={{ background: bg, color }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-0.5">{title}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
