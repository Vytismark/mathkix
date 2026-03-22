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
    color: '#3678FF',
    glow: 'rgba(54,120,255,0.28)',
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
      'Each child gets their own path. No siblings sharing a score, no one-size-fits-all grade. Add unlimited children under one account.',
  },
  {
    icon: Gamepad2,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.28)',
    title: 'Built for Ages 5-11',
    description:
      'Built around how kids actually learn: fast sessions, XP rewards, daily streaks, and a number pad made for small fingers.',
  },
  {
    icon: BookOpen,
    color: '#0ea5e9',
    glow: 'rgba(14,165,233,0.28)',
    title: 'Full CCSSM Coverage',
    description:
      'Every question maps to the same standards your child\'s teacher uses. Progress in MathKix means progress in class.',
  },
  {
    icon: Shield,
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.28)',
    title: 'Safe, Private & Ad-Free',
    description:
      'No ads. No data selling. Your child\'s profile is theirs - invisible to everyone except you.',
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
      'A 3-minute AI quiz pinpoints exactly where your child stands - across every skill, not just their grade.',
  },
  {
    number: '03',
    title: 'Watch them grow',
    description:
      'Your child builds a daily streak. You get a weekly report showing exactly what they\'ve mastered.',
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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mathkix.com'

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MathKix',
  url: BASE_URL,
  logo: `${BASE_URL}/mathkix-logo.svg`,
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
        text: 'That\'s completely fine - and it\'s one of the main reasons parents use MathKix. The placement quiz detects gaps automatically, and the adaptive engine serves questions from earlier standards until your child masters them. There\'s no "grade shaming" - your child only sees encouragement and progress.',
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
            background: 'radial-gradient(ellipse at 50% 30%, rgba(54,120,255,0.10) 0%, transparent 68%)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <div
            className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border"
            style={{
              background: 'rgba(54,120,255,0.10)',
              borderColor: 'rgba(54,120,255,0.28)',
              color: '#93bbff',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            30-day free trial - no credit card required
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] mb-6"
            style={{ animationDelay: '60ms' }}
          >
            Higher standards.<br />
            <span style={{ color: '#3678FF' }}>
              Your child&apos;s pace.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="animate-fade-in-up text-lg sm:text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ animationDelay: '120ms' }}
          >
            A 3-minute quiz finds your child&apos;s exact level across every
            math skill. Then builds a custom path forward - standard by standard.
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
                background: 'linear-gradient(135deg, #2557CC, #3678FF)',
                boxShadow: '0 4px 28px rgba(54,120,255,0.40)',
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
            No credit card&nbsp;&nbsp;·&nbsp;&nbsp;Cancel anytime&nbsp;&nbsp;·&nbsp;&nbsp;No ads, ever
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
            <p className="text-slate-400 text-lg">Built for one kid: yours.</p>
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
              Most apps guess. MathKix measures.
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Generic math apps give every kid the same questions. MathKix starts with where your child actually is - then moves from there.
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
                  'Rewards that don\'t make kids actually learn more',
                  'Explanations that miss if your kid is above or below grade',
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
                background: 'rgba(54,120,255,0.05)',
                borderColor: 'rgba(54,120,255,0.20)',
              }}
            >
              <p className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: '#3678FF' }}>MathKix</p>
              <ul className="space-y-4">
                {[
                  { icon: Brain, text: 'AI placement finds their exact level in 3 minutes' },
                  { icon: Shuffle, text: 'Adaptive engine adjusts difficulty after every answer' },
                  { icon: BarChart3, text: 'Designed to make knowledge stick, not just practice it' },
                  { icon: MessageCircle, text: 'AI tutor adapts language to your child\'s grade' },
                  { icon: CheckCircle, text: 'You can see exactly what they know - and what\'s next' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-slate-200">
                    <span
                      className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(54,120,255,0.18)' }}
                    >
                      <Icon className="w-3 h-3" style={{ color: '#3678FF' }} />
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
              Three steps. Then it runs itself.
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
                    background: 'linear-gradient(135deg, rgba(54,120,255,0.55), rgba(37,87,204,0.18))',
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

      {/* ── Testimonials ─────────────────────────────── */}
      <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold mb-3">
              Parents love it. Kids actually use it.
            </h2>
            <p className="text-slate-400">Real feedback from families in their first month.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: "My son was almost a full grade behind and too embarrassed to admit it. MathKix figured that out on its own in the placement quiz and just started him where he needed to be. No drama.",
                name: 'Rachel T.',
                detail: 'Mom of a 3rd grader, Ohio',
              },
              {
                quote: "I've tried three other math apps. This is the first one my daughter asks to open. The streak thing is annoyingly effective. She reminds me if we forget.",
                name: 'James K.',
                detail: 'Dad of two, Texas',
              },
              {
                quote: "Worth it just for the parent dashboard. I can actually see which standards she's mastered versus where she's still shaky. Her teacher was impressed I knew the specifics.",
                name: 'Priya M.',
                detail: 'Mom of a 4th grader, California',
              },
            ].map(({ quote, name, detail }, i) => (
              <div
                key={name}
                className="animate-fade-in-up flex flex-col gap-5 p-7 rounded-2xl border"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="w-4 h-4" viewBox="0 0 20 20" fill="#f59e0b">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-slate-300 text-sm leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
                {/* Author */}
                <div>
                  <p className="text-white font-semibold text-sm">{name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{detail}</p>
                </div>
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
                  { color: '#3678FF', text: 'Wrong answers teach, never punish' },
                  { color: '#7c3aed', text: 'Ms. Owl explains mistakes in plain language - no red X and move on' },
                  { color: '#f59e0b', text: 'XP and streaks keep them coming back' },
                  { color: '#10b981', text: 'Large tap targets built for small fingers' },
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
            Every standard. Grades 1–5. Nothing skipped.
          </h2>
          <p className="text-slate-400 mb-12">
            The same standards your child's teacher uses, built into every question.
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
                  style={{ background: 'rgba(54,120,255,0.15)', boxShadow: '0 0 12px rgba(54,120,255,0.20)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#3678FF' }} />
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
            <p className="text-slate-400">Answered.</p>
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
            background: 'radial-gradient(ellipse at 50% 80%, rgba(54,120,255,0.09) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2
            className="animate-fade-in-up text-4xl sm:text-5xl font-extrabold mb-5 leading-[1.1]"
          >
            Exact level from day one.{' '}
            <span style={{ color: '#3678FF' }}>
              Free for 30 days.
            </span>
          </h2>
          <p
            className="animate-fade-in-up text-slate-400 text-lg mb-6"
            style={{ animationDelay: '80ms' }}
          >
            No credit card. No commitment. Cancel with one click.
          </p>
          <p
            className="animate-fade-in-up text-slate-300 text-base font-medium mb-10"
            style={{ animationDelay: '110ms' }}
          >
            Then just $9.99/month - less than a single tutoring hour.
          </p>
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '160ms' }}
          >
            <Link
              href="/signup"
              className="cta-btn inline-flex items-center justify-center gap-2 text-white font-bold text-lg px-10 py-4 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #2557CC, #3678FF)',
                boxShadow: '0 4px 32px rgba(54,120,255,0.45)',
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
            <Image src="/mathkix-icon.svg" alt="MathKix logo" width={28} height={28} className="h-7 w-7" />
            <span className="text-base font-extrabold tracking-tight">
              <span className="text-white">Math</span>
              <span style={{ color: '#3678FF' }}>Kix</span>
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
