import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Brain, RefreshCw, Sparkles, Target, Heart, ArrowRight,
  CheckCircle, GraduationCap, Zap, Clock, BookOpen,
} from 'lucide-react'
import { MarketingNav } from '@/components/marketing/MarketingNav'

/* -- SEO Metadata -------------------------------------------- */

export const metadata: Metadata = {
  title: 'The Science Behind MathKix - Research-Backed Grades 1-5 Math Learning',
  description:
    'Discover how MathKix uses spaced repetition (SM-2), adaptive learning in the zone of proximal development, growth mindset AI tutoring, and real-time engagement detection to help Grades 1-5 students master math.',
  openGraph: {
    title: 'The Science Behind MathKix',
    description:
      'Research-backed adaptive learning for Grades 1-5 math. Spaced repetition, AI tutoring in the zone of proximal development, and growth mindset feedback.',
    type: 'website',
    siteName: 'MathKix',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Science Behind MathKix',
    description:
      'Research-backed adaptive learning for Grades 1-5 math. Spaced repetition, AI tutoring, and growth mindset feedback.',
  },
}

/* -- Data ---------------------------------------------------- */

const PILLARS = [
  {
    icon: RefreshCw,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.28)',
    title: 'Spaced Repetition',
    subtitle: 'Memory science that makes learning stick',
    anchor: 'spaced-repetition',
  },
  {
    icon: Target,
    color: '#E74C3C',
    glow: 'rgba(231,76,60,0.28)',
    title: 'Adaptive Learning',
    subtitle: 'Every question scored individually, mixing domains and difficulties',
    anchor: 'adaptive-learning',
  },
  {
    icon: Sparkles,
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.28)',
    title: 'Growth Mindset AI Tutor',
    subtitle: 'Feedback that builds mathematical confidence',
    anchor: 'growth-mindset',
  },
  {
    icon: Heart,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.28)',
    title: 'Engagement Detection',
    subtitle: 'Adapts before frustration, not after',
    anchor: 'engagement',
  },
]

const DEEP_DIVES = [
  {
    id: 'spaced-repetition',
    title: 'Spaced Repetition',
    accent: '#10b981',
    researchTitle: 'The Forgetting Curve',
    researchBody:
      'Hermann Ebbinghaus discovered in 1885 that memories decay exponentially - unless they are reviewed at strategically increasing intervals. Paul Pimsleur later formalized graduated-interval recall, showing that each successful review pushes the next optimal review further into the future.',
    citations: ['Ebbinghaus, 1885', 'Pimsleur, 1967'],
    implementationTitle: 'SM-2 with child-friendly tuning',
    bullets: [
      'Implements the SM-2 algorithm - the same system used by millions of learners worldwide',
      'Child-friendly modification: the ease factor never decreases on failure, preventing compounding difficulty for struggling learners',
      "Review intervals start at 1-3 days, then 6 days, then multiply by each standard's personal ease factor",
      'Every Common Core standard is tracked independently with full score history',
    ],
  },
  {
    id: 'adaptive-learning',
    title: 'Adaptive Learning',
    accent: '#E74C3C',
    researchTitle: 'Zone of Proximal Development',
    researchBody:
      'Lev Vygotsky proposed in 1978 that learning happens most effectively in the zone of proximal development - the space between what a child can do independently and what they can achieve with guidance. Material that is too easy leads to boredom; material that is too hard leads to frustration.',
    citations: ['Vygotsky, 1978'],
    implementationTitle: 'Question-level adaptive selection engine',
    bullets: [
      'Scores every individual question from the entire grade-level pool across 6 factors: mastery need, spaced repetition urgency, difficulty fit, domain weight, topic affinity, and variety',
      'Each session mixes domains at different difficulties: easy questions for struggling standards, hard questions for strong ones - all in the same sitting',
      'Difficulty targeting is per-standard: a child who struggles with geometry gets difficulty-1 questions while simultaneously receiving difficulty-3 arithmetic to stay sharp',
      'Mastery level 3 (full mastery) is only reachable by consistently solving hard questions - easier questions build toward it but cannot skip the final step',
    ],
  },
  {
    id: 'growth-mindset',
    title: 'Growth Mindset AI Tutor',
    accent: '#7c3aed',
    researchTitle: 'Growth Mindset & Productive Struggle',
    researchBody:
      "Carol Dweck's research demonstrated that praising effort and strategy - rather than innate ability - leads to greater persistence, resilience, and achievement in mathematics. Children with a growth mindset treat mistakes as learning opportunities rather than evidence of failure.",
    citations: ['Dweck, 2006'],
    implementationTitle: 'Ms. Owl - grade-adapted AI scaffolding',
    bullets: [
      'Language adapts to grade level: Grade 1 gets 1-2 sentence, 50-word responses with concrete analogies; Grade 5 gets full mathematical vocabulary',
      'Four-tier scaffolding: Explore (ask a question) - Nudge (small hint) - Scaffold (reveal one fact) - Direct (walk through a step)',
      'Emotion-specific responses: detects frustration, confusion, excitement, and disengagement - then adjusts tone and approach',
      'Never says "wrong" - instead names the specific strategy used, reframes mistakes as progress, and asks guiding questions',
    ],
  },
  {
    id: 'engagement',
    title: 'Engagement Detection',
    accent: '#f59e0b',
    researchTitle: 'Flow State & Productive Struggle',
    researchBody:
      "Mihaly Csikszentmihalyi's flow research showed that optimal engagement occurs when challenge closely matches ability. When the balance tips toward frustration, learners disengage. The key is to detect the shift and adapt in real time - before the child gives up.",
    citations: ['Csikszentmihalyi, 1990'],
    implementationTitle: 'Real-time signal detection',
    bullets: [
      'Monitors response time, error streaks, and session duration in a sliding 5-question window',
      'Detects slowing (response > 2x average), error streaks (3+ wrong), fatigue (20+ minutes), and disengagement',
      'Difficulty and topic adapt before frustration - not after the child has already checked out',
      'Topic affinity system with 14-day half-life tracks which domains naturally engage each child, weighting future lessons toward intrinsic motivation',
    ],
  },
]

const GRADES = [
  { label: 'Grade 1',      color: '#22c55e' },
  { label: 'Grade 2',      color: '#f59e0b' },
  { label: 'Grade 3',      color: '#3b82f6' },
  { label: 'Grade 4',      color: '#7c3aed' },
  { label: 'Grade 5',      color: '#ec4899' },
]

const DOMAINS = [
  { code: 'OA',  name: 'Operations & Algebraic Thinking',  color: '#E74C3C' },
  { code: 'NBT', name: 'Number & Operations in Base Ten',  color: '#f59e0b' },
  { code: 'NF',  name: 'Number & Operations - Fractions',  color: '#10b981' },
  { code: 'MD',  name: 'Measurement & Data',               color: '#0ea5e9' },
  { code: 'G',   name: 'Geometry',                         color: '#7c3aed' },
]

const REFERENCES = [
  'Ebbinghaus, H. (1885). Memory: A Contribution to Experimental Psychology.',
  'Vygotsky, L. S. (1978). Mind in Society: The Development of Higher Psychological Processes.',
  'Dweck, C. S. (2006). Mindset: The New Psychology of Success.',
  'Pimsleur, P. (1967). A Memory Schedule. Modern Language Journal, 51(2), 73-75.',
  'Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience.',
  'Wozniak, P. A., & Gorzelanczyk, E. J. (1994). Optimization of repetition spacing in the practice of learning. Acta Neurobiologiae Experimentalis, 54, 59-62.',
]

const STATS = [
  { value: 'SM-2',       label: 'Spaced repetition algorithm' },
  { value: '6 factors',  label: 'Per-question adaptive scoring' },
  { value: '4 tiers',    label: 'Scaffolded AI tutoring'      },
]

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'MathKix',
  description: 'Adaptive math learning platform for Grades 1-5 students, grounded in spaced repetition, zone of proximal development, and growth mindset research.',
  educationalFramework: 'Common Core State Standards for Mathematics',
  teaches: ['Mathematics', 'Arithmetic', 'Geometry', 'Fractions', 'Measurement & Data', 'Algebraic Thinking'],
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
    suggestedMinAge: 5,
    suggestedMaxAge: 11,
  },
}

/* -- Page ---------------------------------------------------- */

export default function SciencePage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'MathKix'

  return (
    <div style={{ background: '#07080f', minHeight: '100vh', color: 'white' }}>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      {/* -- Sticky Nav --------------------------------------- */}
      <MarketingNav currentPage="science" />

      <article>
        {/* -- Hero --------------------------------------------- */}
        <section className="relative overflow-hidden px-6 pt-24 pb-20 text-center">
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '0%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '800px',
              height: '560px',
              background: 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.1) 0%, transparent 68%)',
              pointerEvents: 'none',
            }}
          />

          <div className="relative max-w-3xl mx-auto">
            <div
              className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border"
              style={{
                background: 'rgba(124,58,237,0.1)',
                borderColor: 'rgba(124,58,237,0.3)',
                color: '#a78bfa',
              }}
            >
              <Brain className="w-3.5 h-3.5" />
              Research-backed learning
            </div>

            <h1
              className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] mb-6"
              style={{ animationDelay: '60ms' }}
            >
              The{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Science
              </span>
              {' '}Behind<br />
              MathKix
            </h1>

            <p
              className="animate-fade-in-up text-lg sm:text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed"
              style={{ animationDelay: '120ms' }}
            >
              Every feature in MathKix traces back to peer-reviewed cognitive science.
              We build on proven learning techniques to give each child a
              personalized path to mastery.
            </p>

            <div
              className="animate-fade-in-up flex flex-wrap justify-center gap-3 mt-2"
              style={{ animationDelay: '200ms' }}
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
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</span>
                  <span className="text-xs text-slate-500 mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- Philosophy --------------------------------------- */}
        <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold mb-4">
              Learning science, applied to every lesson
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
              Most math apps drill random problems. MathKix is different - every session is built
              question-by-question from your child&apos;s mastery profile. Weak areas get easier questions
              to rebuild confidence; strong areas get harder ones to keep improving. Every algorithm,
              every prompt, and every decision is grounded in decades of research on memory,
              motivation, and how children actually learn.
            </p>
          </div>
        </section>

        {/* -- Four Pillars ------------------------------------- */}
        <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold mb-3">
                Four pillars of effective learning
              </h2>
              <p className="text-slate-400 text-lg">
                Each pillar is grounded in research and implemented in code.
              </p>
            </div>

            <div className="feature-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PILLARS.map((p) => {
                const Icon = p.icon
                return (
                  <a
                    key={p.title}
                    href={`#${p.anchor}`}
                    className="feature-card rounded-2xl border p-6 block"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: `${p.color}20`, boxShadow: `0 0 18px ${p.glow}` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: p.color }} />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-[15px]">{p.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{p.subtitle}</p>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        {/* -- Deep Dives --------------------------------------- */}
        {DEEP_DIVES.map((dive, i) => (
          <section
            key={dive.id}
            id={dive.id}
            className="px-6 py-20 scroll-mt-20"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="max-w-4xl mx-auto">
              <h2
                className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold mb-10"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {dive.title.split(' ')[0]}{' '}
                <span style={{ color: dive.accent }}>
                  {dive.title.split(' ').slice(1).join(' ') || dive.title.split(' ')[0]}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Research card */}
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-4 h-4" style={{ color: dive.accent }} />
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                      {dive.researchTitle}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {dive.researchBody}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dive.citations.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2.5 py-1 rounded-lg border"
                        style={{
                          color: dive.accent,
                          borderColor: `${dive.accent}40`,
                          background: `${dive.accent}10`,
                        }}
                      >
                        <cite className="not-italic">{c}</cite>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Implementation card */}
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4" style={{ color: dive.accent }} />
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                      {dive.implementationTitle}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {dive.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <CheckCircle
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: dive.accent }}
                        />
                        <span className="text-slate-400 text-sm leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* -- Standards Alignment ------------------------------ */}
        <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold mb-3">
              Aligned with Common Core Standards
            </h2>
            <p className="text-slate-400 mb-12 text-lg">
              Every question maps to a specific Grades 1-5 CCSSM standard across 5 mathematical domains.
            </p>

            {/* Grade pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-14">
              {GRADES.map((g) => (
                <div
                  key={g.label}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm border"
                  style={{
                    background: `${g.color}14`,
                    borderColor: `${g.color}32`,
                    color: g.color,
                  }}
                >
                  {g.label}
                </div>
              ))}
            </div>

            {/* Domain cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              {DOMAINS.map((d) => (
                <div
                  key={d.code}
                  className="flex items-center gap-3 p-4 rounded-xl border"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.07)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-extrabold text-xs"
                    style={{ background: `${d.color}18`, color: d.color }}
                  >
                    {d.code}
                  </div>
                  <p className="text-slate-300 text-sm font-medium">{d.name}</p>
                </div>
              ))}
              <div
                className="flex items-center gap-3 p-4 rounded-xl border"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(192,57,43,0.15)' }}
                >
                  <Clock className="w-4 h-4" style={{ color: '#E74C3C' }} />
                </div>
                <p className="text-slate-300 text-sm font-medium">5-15 min daily sessions designed for kids</p>
              </div>
            </div>
          </div>
        </section>

        {/* -- References --------------------------------------- */}
        <section className="px-6 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-extrabold mb-8">Research foundations</h2>
            <ul className="space-y-3">
              {REFERENCES.map((ref) => (
                <li key={ref} className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <cite className="text-slate-400 text-sm not-italic leading-relaxed">{ref}</cite>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </article>

      {/* -- Bottom CTA --------------------------------------- */}
      <section
        className="px-6 py-28 relative overflow-hidden"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '500px',
            background: 'radial-gradient(ellipse at 50% 80%, rgba(124,58,237,0.09) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="animate-fade-in-up text-4xl sm:text-5xl font-extrabold mb-5 leading-[1.1]">
            See the science{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              in action.
            </span>
          </h2>
          <p
            className="animate-fade-in-up text-slate-400 text-lg mb-10"
            style={{ animationDelay: '80ms' }}
          >
            Start your 30-day free trial. No credit card required.
            <br />
            Watch your child build real mathematical confidence.
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

      {/* -- Footer ------------------------------------------- */}
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
