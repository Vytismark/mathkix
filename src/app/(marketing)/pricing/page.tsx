import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Check, ShieldCheck, RotateCcw, Zap, Star } from 'lucide-react'
import { PRICING_PLANS } from '@/types/stripe'
import { MarketingNav } from '@/components/marketing/MarketingNav'

export const metadata: Metadata = {
  title: 'Pricing - MathKix',
  description: 'Simple, transparent pricing. One account, unlimited children. 30-day free trial on every plan.',
}

const PLAN_META: Record<string, {
  tagline: string
  accent: string
  glow: string
  checkColor: string
  ctaLabel: string
  priceNote: string
}> = {
  monthly: {
    tagline: 'Try it out, cancel anytime.',
    accent: '#64748b',
    glow: 'rgba(100,116,139,0.2)',
    checkColor: '#94a3b8',
    ctaLabel: 'Start Monthly',
    priceNote: 'per month, billed monthly',
  },
  annual: {
    tagline: 'The smart choice for most families.',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    checkColor: '#f59e0b',
    ctaLabel: 'Start with Annual',
    priceNote: 'per year - save 33%',
  },
  lifetime: {
    tagline: 'One payment. Forever yours.',
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.25)',
    checkColor: '#10b981',
    ctaLabel: 'Get Lifetime Access',
    priceNote: 'one-time payment',
  },
}

const TRUST = [
  { icon: ShieldCheck, label: '30-day free trial',   text: 'No credit card to start'               },
  { icon: RotateCcw,   label: 'Cancel anytime',       text: 'No questions asked'                    },
  { icon: Zap,         label: 'Instant access',       text: 'Lessons start the moment you sign up'  },
  { icon: Star,        label: 'Unlimited children',   text: 'All kids on one account'               },
]

export default function PricingPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'MathKix'

  return (
    <div style={{ background: '#07080f', minHeight: '100vh', color: 'white' }}>

      {/* ── Nav ──────────────────────────────────────── */}
      <MarketingNav currentPage="pricing" />

      {/* ── Header ───────────────────────────────────── */}
      <div className="px-6 pt-20 pb-14 text-center max-w-2xl mx-auto">
        <h1 className="animate-fade-in-up text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Simple, honest pricing
        </h1>
        <p className="animate-fade-in-up text-slate-400 text-lg mb-3" style={{ animationDelay: '60ms' }}>
          One account. Unlimited children. All Grades 1-5.
        </p>
        <p
          className="animate-fade-in-up text-sm font-semibold px-4 py-1.5 rounded-full inline-block border"
          style={{
            animationDelay: '120ms',
            background: 'rgba(192,57,43,0.1)',
            borderColor: 'rgba(231,76,60,0.3)',
            color: '#f87171',
          }}
        >
          Every plan starts with a free 30-day trial - no credit card required
        </p>
      </div>

      {/* ── Plan cards ───────────────────────────────── */}
      <div className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          {PRICING_PLANS.map((plan, i) => {
            const meta = PLAN_META[plan.id]
            const isAnnual = plan.id === 'annual'
            const price = plan.price / 100

            return (
              <div
                key={plan.id}
                className={`animate-fade-in-up relative rounded-3xl border p-8 flex flex-col ${
                  isAnnual ? 'plan-card-annual' : 'plan-card'
                }`}
                style={{
                  background: isAnnual ? 'rgba(255,255,255,0.065)' : 'rgba(255,255,255,0.04)',
                  borderColor: isAnnual ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.09)',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {/* Top accent line for annual */}
                {isAnnual && (
                  <div
                    className="absolute top-0 left-8 right-8 h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }}
                  />
                )}

                {/* Badge */}
                {isAnnual && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black tracking-wider whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                      color: '#000',
                      boxShadow: '0 2px 12px rgba(245,158,11,0.5)',
                    }}
                  >
                    BEST VALUE
                  </div>
                )}

                {/* Plan name + tagline */}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: meta.accent }}>
                    {plan.name}
                  </p>
                  <p className="text-slate-500 text-sm">{meta.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-1 flex items-end gap-1 leading-none">
                  <span className="text-2xl font-bold" style={{ color: meta.accent }}>$</span>
                  <span className="text-[52px] font-black text-white tracking-tight">{price}</span>
                </div>
                <p className="text-xs text-slate-500 mb-8">{meta.priceNote}</p>

                {/* Features */}
                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: meta.checkColor }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/signup"
                  className="cta-btn flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm"
                  style={
                    isAnnual
                      ? {
                          background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                          color: '#000',
                          boxShadow: `0 4px 20px ${meta.glow}`,
                        }
                      : plan.id === 'lifetime'
                      ? {
                          background: 'rgba(16,185,129,0.15)',
                          color: '#10b981',
                          border: '1px solid rgba(16,185,129,0.3)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.07)',
                          color: '#cbd5e1',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }
                  }
                >
                  {meta.ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* Comparison note */}
        <p className="text-center text-slate-600 text-sm mt-8">
          All plans include every Grade 1-5, unlimited children, and the AI level placement quiz.
        </p>
      </div>

      {/* ── Trust row ────────────────────────────────── */}
      <div
        className="px-6 py-14"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST.map(({ icon: Icon, label, text }, i) => (
            <div
              key={label}
              className="trust-tile animate-fade-in-up flex flex-col items-center text-center p-5 rounded-2xl border gap-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.07)',
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(192,57,43,0.12)', boxShadow: '0 0 14px rgba(192,57,43,0.18)' }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color: '#E74C3C', width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ-style reassurance ─────────────────────── */}
      <div
        className="px-6 py-16"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-500 text-sm">
            Questions?{' '}
            <a
              href="mailto:hello@mathkix.com"
              className="text-slate-300 hover:text-white transition-colors underline underline-offset-2"
            >
              Email us
            </a>
            {' '}- we reply within a few hours.
          </p>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <footer
        className="px-6 py-8"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mathkix-icon.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="text-base font-extrabold tracking-tight">
              <span className="text-white">Math</span>
              <span style={{ color: '#E74C3C' }}>Kix</span>
            </span>
          </span>
          <div className="flex items-center gap-6">
            <Link href="/"        className="hover:text-slate-300 transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
            <Link href="/science" className="hover:text-slate-300 transition-colors">Science</Link>
            <Link href="/terms"   className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/login"   className="hover:text-slate-300 transition-colors">Sign in</Link>
          </div>
          <span>© {new Date().getFullYear()} {appName}. Built for kids.</span>
        </div>
      </footer>
    </div>
  )
}
