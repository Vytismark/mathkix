'use client'

import { useState } from 'react'
import {
  UserPlus, ClipboardList, Rocket, LayoutDashboard,
  Star, Flame, BookOpen, ChevronDown, CheckCircle2,
  BarChart2, Settings, CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Step-by-step getting-started ─────────────────────────────────────── */
const STEPS = [
  {
    icon: UserPlus,
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.35)',
    title: 'Add a child profile',
    description:
      'Click "Add child" on your dashboard or go to the Children page. Enter your child\'s name, age, and grade level. You can add up to 2 children on the free trial, or up to 10 on a paid plan.',
    tips: [
      'Each child gets their own profile and progress tracking',
      'You can customise their avatar after creation',
    ],
  },
  {
    icon: ClipboardList,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    title: 'Complete the placement quiz',
    description:
      'After creating a profile, have your child take the short placement quiz. Our AI uses the results to figure out exactly where they are in maths and sets the right starting level - no guesswork.',
    tips: [
      'The quiz takes about 5–10 minutes',
      'Sit with your child for the first time so they feel comfortable',
      'They can retake it later from their settings if needed',
    ],
  },
  {
    icon: Rocket,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.35)',
    title: 'Let your child start learning',
    description:
      'Once placement is done, your child can log in and go to their play area. Lessons and quizzes are automatically chosen based on their level. The AI adapts difficulty as they improve.',
    tips: [
      'Encourage short daily sessions (10–15 min) for best results',
      'Streaks reward consistent daily practice',
      'XP points motivate kids to keep going',
    ],
  },
]

/* ─── FAQ sections ──────────────────────────────────────────────────────── */
const SECTIONS = [
  {
    icon: LayoutDashboard,
    color: '#7c3aed',
    title: 'Understanding the Dashboard',
    items: [
      {
        q: 'What do the stat cards show?',
        a: 'The four stat cards at the top give you a quick overview: total children added, combined XP earned across all children, number of lessons completed, and how many children have an active daily streak.',
      },
      {
        q: 'What is a streak?',
        a: 'A streak counts how many consecutive days a child has practised. Streaks reset to zero if a day is skipped, so they\'re a great way to encourage daily habits.',
      },
      {
        q: 'What does the yellow warning banner mean?',
        a: 'If a child hasn\'t taken the placement quiz yet, a banner appears to remind you. Click it to navigate to that child\'s profile and start the quiz.',
      },
    ],
  },
  {
    icon: BookOpen,
    color: '#10b981',
    title: 'How Learning Works',
    items: [
      {
        q: 'How are lessons chosen?',
        a: 'Our adaptive engine picks lessons based on your child\'s current level, recent performance, and spaced-repetition scheduling - so topics they struggle with appear more often until mastered.',
      },
      {
        q: 'What is XP?',
        a: 'XP (experience points) are earned by completing lessons and quizzes correctly. They\'re purely motivational - kids see them accumulate and feel proud of their progress.',
      },
      {
        q: 'Can my child replay lessons?',
        a: 'Yes - from their play home they can revisit any topic. The AI teacher will present new question variations so it never feels repetitive.',
      },
    ],
  },
  {
    icon: BarChart2,
    color: '#3b82f6',
    title: 'Tracking Progress',
    items: [
      {
        q: 'Where can I see detailed progress?',
        a: 'Go to Children → select a child → Progress. You\'ll see a breakdown by maths domain (Number, Geometry, etc.), lessons attempted, accuracy rates, and XP over time.',
      },
      {
        q: 'How do I know if my child is struggling?',
        a: 'The progress page highlights domains with lower accuracy. The AI will automatically slow down and revisit those areas, but you can also contact support if you\'re concerned.',
      },
    ],
  },
  {
    icon: Settings,
    color: '#f97316',
    title: 'Managing Children & Settings',
    items: [
      {
        q: 'How do I change a child\'s grade or avatar?',
        a: 'Go to Children → select the child → Settings. You can update their name, grade, avatar, and daily goal from there.',
      },
      {
        q: 'Can I add more than 2 children?',
        a: 'The free trial allows 2 child profiles. Upgrading to a paid plan increases the limit to 10.',
      },
      {
        q: 'How does my child log in?',
        a: 'From the child-select screen (the page shown after you log in), tap your child\'s avatar. No separate password is needed - they\'re linked to your account.',
      },
    ],
  },
  {
    icon: CreditCard,
    color: '#ec4899',
    title: 'Billing & Subscription',
    items: [
      {
        q: 'What happens after the free trial?',
        a: 'After the trial ends, your dashboard will show a paywall. You can upgrade on the Billing page to restore full access. Your children\'s progress is always saved.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes - go to Billing and click "Manage subscription" to cancel or change your plan at any time. You keep access until the end of the billing period.',
      },
    ],
  },
]

/* ─── FAQ accordion item ────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="border-b border-white/[0.07] last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
      >
        <span className={cn('text-sm font-medium transition-colors', open ? 'text-white' : 'text-slate-300')}>
          {q}
        </span>
        <ChevronDown
          className={cn('w-4 h-4 shrink-0 mt-0.5 text-slate-500 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <p className="text-slate-400 text-sm pb-4 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

/* ─── Section accordion ─────────────────────────────────────────────────── */
function GuideSection({
  section,
  defaultOpen,
}: {
  section: typeof SECTIONS[number]
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const Icon = section.icon

  return (
    <div
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${section.color}22`, boxShadow: `0 0 12px ${section.color}44` }}
          >
            <Icon className="w-4 h-4" style={{ color: section.color }} />
          </div>
          <span className="text-white font-semibold text-sm">{section.title}</span>
        </div>
        <ChevronDown
          className={cn('w-4 h-4 shrink-0 text-slate-500 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="px-5 pb-2">
          {section.items.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function HowToPage() {
  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="animate-fade-in-up mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">How it works</h1>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          Everything you need to get your child learning maths today.
        </p>
      </div>

      {/* Getting started steps */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Getting started - 3 steps
        </h2>
        <div className="flex flex-col gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="animate-fade-in-up flex gap-4 p-5 rounded-2xl border border-white/10"
                style={{ background: 'rgba(255,255,255,0.04)', animationDelay: `${i * 80}ms` }}
              >
                {/* Step number + icon */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.color}22`, boxShadow: `0 0 16px ${step.glow}` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: step.color }}
                  >
                    {i + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1.5">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">{step.description}</p>
                  <ul className="flex flex-col gap-1.5">
                    {step.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" />
                        <span className="text-slate-500 text-xs leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Quick stat legend */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Dashboard stats at a glance
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Star,     color: '#f59e0b', label: 'XP',       desc: 'Points earned across all children' },
            { icon: BookOpen, color: '#10b981', label: 'Lessons',   desc: 'Total lessons completed' },
            { icon: Flame,    color: '#f97316', label: 'Streaks',   desc: 'Children with an active daily streak' },
          ].map(({ icon: Icon, color, label, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3 p-4 rounded-2xl border border-white/10"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}22` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-white text-xs font-semibold">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ accordions */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Common questions
        </h2>
        <div className="flex flex-col gap-3">
          {SECTIONS.map((s, i) => (
            <GuideSection key={s.title} section={s} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      {/* Support nudge */}
      <div
        className="mt-8 p-5 rounded-2xl border border-white/10 flex items-start gap-4"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <span className="text-2xl shrink-0">💬</span>
        <div>
          <p className="text-white font-semibold text-sm mb-1">Still have questions?</p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Our AI support assistant is available 24/7 and can escalate to a human if needed.{' '}
            <a href="/support/new" className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors">
              Open a support ticket
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
