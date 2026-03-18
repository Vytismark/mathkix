import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  Target, TrendingUp, Users, Gamepad2, BookOpen, Shield,
  ArrowRight, Sparkles, Zap, CheckCircle, Clock,
  Brain, BarChart3, MessageCircle, Shuffle,
} from 'lucide-react'
import AppPreview from '@/components/marketing/AppPreview'
import FaqSection from '@/components/marketing/FaqSection'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { getGradeBank } from '@/data/questions'
import { getDomainsForGrade } from '@/types/quiz'
import type { Domain } from '@/types/quiz'
import { DOMAIN_LABELS, DOMAIN_ICONS, DOMAIN_COLORS, DOMAIN_DESCRIPTIONS } from '@/lib/quiz/levelMapping'
import { CurriculumView } from '@/components/parent/CurriculumView'

export const metadata: Metadata = {
  title: 'MathKix - Personalized Grades 1-5 Math Learning Powered by AI',
  description:
    'AI-powered math practice for kids from Grade 1 to Grade 5. Places every child at their exact level in 3 minutes. 30-day free trial, no credit card.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MathKix - Personalized Grades 1-5 Math Learning Powered by AI',
    description:
      'AI-powered math practice for Grades 1-5. A 3-minute quiz finds your child\'s exact level, then adapts as they master each skill. 30-day free trial.',
    type: 'website',
  },
  twitter: {
    title: 'MathKix - AI-Powered Math for Grades 1-5',
    description:
      'AI-powered math practice for Grades 1-5. A 3-minute quiz finds your child\'s exact level. 30-day free trial, no credit card.',
  },
}

const FEATURES = [
  {
    icon: Target,
    color: '#E74C3C',
    glow: 'rgba(231,76,60,0.28)',
    title: 'AI Placement in 3 Minutes',
    description:
      'A short diagnostic quiz powered by Claude AI finds your child\'s exact level - no guessing, no wasted time on work that\'s too easy or too hard.',
  },
  {
    icon: TrendingUp,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.28)',
    title: 'Adapts as They Grow',
    description:
      'The app tracks mastery of every CCSSM standard. When your child nails a skill, the next one is ready and waiting.',
  },
  {
    icon: Users,
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.28)',
    title: 'One Account, All Your Kids',
    description:
      'Add unlimited children under one parent account. Each child gets their own profile, progress, and personalized curriculum.',
  },
  {
    icon: Gamepad2,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.28)',
    title: 'Built for Ages 5-11',
    description:
      'Big tap targets, XP rewards, daily streaks, and a custom number pad. Designed for small fingers and short attention spans.',
  },
  {
    icon: BookOpen,
    color: '#0ea5e9',
    glow: 'rgba(14,165,233,0.28)',
    title: 'Full CCSSM Coverage',
    description:
      'Every question maps to a Common Core standard. Operations, Fractions, Measurement, Geometry - Grades 1-5, covered.',
  },
  {
    icon: Shield,
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.28)',
    title: 'Safe, Private & Ad-Free',
    description:
      'No ads. No data selling. Child profiles are protected with row-level security. You control everything.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Create a parent account',
    description:
      'Sign up in 30 seconds. No credit card needed - your 30-day trial starts immediately.',
  },
  {
    number: '02',
    title: 'Add your child & take the quiz',
    description:
      'A 3-minute AI placement quiz finds exactly where your child is in their math journey.',
  },
  {
    number: '03',
    title: 'Watch them grow',
    description:
      'Daily practice, XP rewards, and a streak to maintain. You get weekly progress updates.',
  },
]

const GRADES = [
  { label: 'Grade 1',      color: '#22c55e' },
  { label: 'Grade 2',      color: '#f59e0b' },
  { label: 'Grade 3',      color: '#3b82f6' },
  { label: 'Grade 4',      color: '#7c3aed' },
  { label: 'Grade 5',      color: '#ec4899' },
]

const STATS = [
  { value: '1-5',    label: 'Grades covered'  },
  { value: '3 min',  label: 'AI placement quiz'    },
  { value: '0',      label: 'Ads, ever'            },
]

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MathKix',
  url: 'https://mathkix.com',
  logo: 'https://mathkix.com/mathkix-logo.svg',
  description:
    'AI-powered adaptive math learning platform for children in Grades 1-5, aligned to Common Core State Standards.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@mathkix.com',
    contactType: 'customer support',
  },
}

const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MathKix',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '9.99',
    highPrice: '149.99',
    priceCurrency: 'USD',
    offerCount: 3,
  },
  aggregateRating: undefined,
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
    suggestedMinAge: 5,
    suggestedMaxAge: 11,
  },
}

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the placement quiz work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your child answers a short set of adaptive questions that take about 3 minutes. The quiz starts at their enrolled grade level and adjusts up or down based on each answer. At the end, MathKix maps their strengths and gaps across every Common Core math domain and begins lessons at exactly the right level.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if my child is behind their grade level?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'That is completely fine - and it is one of the main reasons parents use MathKix. The placement quiz detects gaps automatically, and the adaptive engine serves questions from earlier standards until your child masters them. There is no "grade shaming" - your child only sees encouragement and progress.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does MathKix replace school math?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MathKix is designed as a supplement, not a replacement. It reinforces what your child learns at school by providing daily practice aligned to the same Common Core standards their teacher uses. Many parents use it for 5-15 minutes a day after school or on weekends.',
      },
    },
    {
      '@type': 'Question',
      name: 'What devices does it work on?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MathKix runs in any modern web browser - Chrome, Safari, Firefox, or Edge. It works on phones, tablets, laptops, and desktops. No app download required. The interface is optimized for touch on tablets and phones with large tap targets designed for small fingers.',
      },
    },
    {
      '@type': 'Question',
      name: "Can I track my child's progress?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Your parent dashboard shows mastery across every math domain, daily activity, streak data, and which standards your child has completed. You can see exactly where they are strong and where they need more practice.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens after the free trial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "After 30 days, you can choose monthly ($9.99/mo), annual ($79.99/yr), or lifetime ($149.99 one-time) billing. If you cancel, your child's progress is saved for 90 days in case you come back. No cancellation fees, no contracts.",
      },
    },
  ],
}

export default function LandingPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'MathKix'

  const curriculumGrades = ([1, 2, 3, 4, 5] as const).map((g) => {
    const bank = getGradeBank(g)
    const activeDomains = getDomainsForGrade(g)
    const domains = activeDomains.map((d: Domain) => ({
      key: d,
      label: DOMAIN_LABELS[d],
      icon: DOMAIN_ICONS[d],
      description: DOMAIN_DESCRIPTIONS[d],
      color: DOMAIN_COLORS[d],
      standards: bank.standards
        .filter((s) => s.domain === `${g}.${d}`)
        .map((s) => ({ code: s.code, title: s.title })),
    }))
    return { grade: g, totalStandards: bank.totalStandards, domains }
  })

  return (
    <div style={{ background: '#07080f', minHeight: '100vh', color: 'white' }} className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      {/* ── Sticky Nav ───────────────────────────────── */}
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20 text-center">
        {/* Ambient glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '0%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '560px',
            background: 'radial-gradient(ellipse at 50% 30%, rgba(192,57,43,0.13) 0%, transparent 68%)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <div
            className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border"
            style={{
              background: 'rgba(192,57,43,0.1)',
              borderColor: 'rgba(231,76,60,0.3)',
              color: '#f87171',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            30-day free trial - no credit card required
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] mb-6"
            style={{ animationDelay: '60ms' }}
          >
            Ignite your child&apos;s<br />
            math{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #E74C3C 0%, #ff7058 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              potential.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="animate-fade-in-up text-lg sm:text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ animationDelay: '120ms' }}
          >
            AI-powered math for Grades 1-5. A 3-minute quiz finds your
            child&apos;s exact level, then adapts as they master each skill.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-in-up flex flex-col sm:flex-row gap-3 justify-center mb-5"
            style={{ animationDelay: '180ms' }}
          >
            <Link
              href="/signup"
              className="cta-btn inline-flex items-center justify-center gap-2 text-white font-bold text-base px-8 py-4 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
                boxShadow: '0 4px 28px rgba(192,57,43,0.45)',
              }}
            >
              Start free for 30 days
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="ghost-btn inline-flex items-center justify-center gap-2 font-bold text-base px-8 py-4 rounded-2xl border text-slate-300"
              style={{
                borderColor: 'rgba(255,255,255,0.11)',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              See pricing
            </Link>
          </div>

          {/* Trust line */}
          <p
            className="animate-fade-in text-sm text-slate-500"
            style={{ animationDelay: '240ms' }}
          >
            No credit card&nbsp;&nbsp;·&nbsp;&nbsp;Cancel anytime&nbsp;&nbsp;·&nbsp;&nbsp;All Grades 1-5
          </p>

          {/* Stats row */}
          <div
            className="animate-fade-in-up flex flex-wrap justify-center gap-3 mt-14"
            style={{ animationDelay: '320ms' }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center px-8 py-4 rounded-2xl border"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  minWidth: '130px',
                }}
              >
                <span className="text-3xl font-extrabold text-white">{s.value}</span>
                <span className="text-xs text-slate-500 mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold mb-3">
              Everything they need.
            </h2>
            <p className="text-slate-400 text-lg">Nothing generic. Nothing boring.</p>
          </div>

          <div className="feature-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="feature-card rounded-2xl border p-6"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${f.color}20`, boxShadow: `0 0 18px ${f.glow}` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold text-white mb-2 text-[15px]">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Why MathKix (Comparison) ─────────────────── */}
      <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold mb-3">
              Not another math app
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Most math apps give every kid the same questions. MathKix starts where your child actually is.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* "Generic apps" column */}
            <div
              className="rounded-2xl border p-7"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-5">Generic math apps</p>
              <ul className="space-y-4">
                {[
                  'Same questions for every student',
                  'Pick a grade, hope it fits',
                  'Gamification without learning science',
                  'One-size-fits-all explanations',
                  'No visibility into what they actually know',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-500">
                    <span className="mt-0.5 w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center shrink-0">
                      <span className="w-2 h-0.5 bg-slate-600 rounded" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* "MathKix" column */}
            <div
              className="rounded-2xl border p-7"
              style={{
                background: 'rgba(231,76,60,0.04)',
                borderColor: 'rgba(231,76,60,0.18)',
              }}
            >
              <p className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: '#E74C3C' }}>MathKix</p>
              <ul className="space-y-4">
                {[
                  { icon: Brain, text: 'AI placement finds their exact level in 3 minutes' },
                  { icon: Shuffle, text: 'Adaptive engine adjusts difficulty after every answer' },
                  { icon: BarChart3, text: 'Built on spaced repetition and learning science' },
                  { icon: MessageCircle, text: 'AI tutor adapts language to your child\'s grade' },
                  { icon: CheckCircle, text: 'Parent dashboard shows mastery per standard' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-slate-200">
                    <span
                      className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(231,76,60,0.18)' }}
                    >
                      <Icon className="w-3 h-3" style={{ color: '#E74C3C' }} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold mb-3">
              Up and running in minutes
            </h2>
            <p className="text-slate-400">No setup. No curriculum decisions. Just start.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className="step-card animate-fade-in-up relative p-7 rounded-2xl border"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div
                  className="text-5xl font-black mb-5 leading-none select-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(231,76,60,0.55), rgba(192,57,43,0.18))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {step.number}
                </div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Preview ──────────────────────────────── */}
      <section className="px-6 py-20 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold mb-4">
                See what your child sees
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Big numbers, clear choices, and instant feedback. Every lesson is built for ages 5-11 - not shrunk down from an adult app.
              </p>
              <ul className="space-y-4">
                {[
                  { color: '#10b981', text: 'Large tap targets for small fingers' },
                  { color: '#7c3aed', text: 'Ms. Owl AI tutor gives encouragement' },
                  { color: '#f59e0b', text: 'XP and streaks keep them motivated' },
                  { color: '#E74C3C', text: 'Wrong answers teach, never punish' },
                ].map(({ color, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: color, boxShadow: `0 0 8px ${color}50` }}
                    />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <AppPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Grade coverage ────────────────────────────── */}
      <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold mb-3">
            Covers all Grades 1-5 math
          </h2>
          <p className="text-slate-400 mb-12">
            Fully aligned with Common Core State Standards for Mathematics
          </p>

          {/* Curriculum explorer */}
          <div className="mb-14 text-left">
            <CurriculumView grades={curriculumGrades} defaultGrade={3} />
          </div>

          {/* Quick-facts row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Zap,          label: 'AI-powered',      text: 'Placement & lesson selection'        },
              { icon: CheckCircle,  label: 'CCSSM aligned',   text: 'Every question mapped to a standard' },
              { icon: Clock,        label: '5-15 min / day',  text: 'Short sessions designed for kids'    },
            ].map(({ icon: Icon, label, text }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-xl border text-left"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(192,57,43,0.15)', boxShadow: '0 0 12px rgba(192,57,43,0.2)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#E74C3C' }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold mb-3">
              Common questions
            </h2>
            <p className="text-slate-400">Everything parents ask before getting started.</p>
          </div>
          <FaqSection />
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────── */}
      <section
        className="px-6 py-28 relative overflow-hidden"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '500px',
            background: 'radial-gradient(ellipse at 50% 80%, rgba(192,57,43,0.11) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2
            className="animate-fade-in-up text-4xl sm:text-5xl font-extrabold mb-5 leading-[1.1]"
          >
            Give your child a head start -{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #E74C3C, #ff7058)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              free for 30 days.
            </span>
          </h2>
          <p
            className="animate-fade-in-up text-slate-400 text-lg mb-10"
            style={{ animationDelay: '80ms' }}
          >
            No credit card. No commitment. Cancel with one click.
            <br />
            Then just $9.99/month - less than one tutoring hour.
          </p>
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '160ms' }}
          >
            <Link
              href="/signup"
              className="cta-btn inline-flex items-center justify-center gap-2 text-white font-bold text-lg px-10 py-4 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
                boxShadow: '0 4px 32px rgba(192,57,43,0.5)',
              }}
            >
              Start free for 30 days
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p
            className="animate-fade-in text-xs text-slate-600 mt-5"
            style={{ animationDelay: '240ms' }}
          >
            After trial: $9.99/month · $79.99/year · $149.99 lifetime
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer
        className="px-6 py-8"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <Image src="/mathkix-icon.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="text-base font-extrabold tracking-tight">
              <span className="text-white">Math</span>
              <span style={{ color: '#E74C3C' }}>Kix</span>
            </span>
          </span>
          <div className="flex items-center gap-6">
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
