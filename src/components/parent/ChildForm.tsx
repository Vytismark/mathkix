'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AvatarSelector } from './AvatarSelector'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type LearningPace         = 'steady' | 'average' | 'quick'
type ChallengePreference  = 'gentle' | 'balanced' | 'loves_challenge'
type AttentionSpan        = 'short' | 'medium' | 'long'
type ParentGoal           = 'catch_up' | 'reinforce' | 'advance'
type MotivationStyle      = 'rewards' | 'challenge' | 'encouragement'

interface ChildFormProps {
  mode: 'create' | 'edit'
  defaultValues?: {
    name: string
    avatar_id: string
    school_grade: number | null
    learning_pace: LearningPace
    challenge_preference: ChallengePreference
    attention_span: AttentionSpan
    parent_goal: ParentGoal
    motivation_style: MotivationStyle
    learning_notes: string | null
  }
  childId?: string
}

// ─── Card-selector helper ─────────────────────────────────────────────────────

interface CardOption<T extends string> {
  value: T
  emoji: string
  label: string
  description: string
}

function CardGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: CardOption<T>[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="relative flex flex-col items-center gap-2.5 rounded-2xl border p-4 text-center transition-all duration-200 cursor-pointer"
            style={{
              background: active ? 'rgba(231,76,60,0.12)' : 'rgba(255,255,255,0.04)',
              borderColor: active ? 'rgba(231,76,60,0.6)' : 'rgba(255,255,255,0.1)',
              boxShadow: active ? '0 0 0 3px rgba(231,76,60,0.12)' : 'none',
              transform: active ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            {active && (
              <span
                className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: '#E74C3C' }}
              >
                <Check className="w-2.5 h-2.5 text-white" />
              </span>
            )}
            <span className="text-3xl leading-none">{opt.emoji}</span>
            <span className="text-sm font-semibold text-white leading-tight">{opt.label}</span>
            <span className="text-xs text-slate-400 leading-snug">{opt.description}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Option data ──────────────────────────────────────────────────────────────

const GRADE_OPTIONS: { label: string; value: number }[] = [
  { label: '1st', value: 1 },
  { label: '2nd', value: 2 },
  { label: '3rd', value: 3 },
  { label: '4th', value: 4 },
  { label: '5th', value: 5 },
]

const PACE_OPTIONS: CardOption<LearningPace>[] = [
  { value: 'steady', emoji: '🐢', label: 'Steady',      description: 'Needs repetition to lock in new skills' },
  { value: 'average',emoji: '🐕', label: 'Average',     description: 'Picks things up at a normal pace' },
  { value: 'quick',  emoji: '🚀', label: 'Quick',       description: 'Grasps new concepts fast' },
]

const CHALLENGE_OPTIONS: CardOption<ChallengePreference>[] = [
  { value: 'gentle',          emoji: '🌱', label: 'Needs support',  description: 'Gets frustrated easily, needs encouragement' },
  { value: 'balanced',        emoji: '⚖️',  label: 'Balanced',      description: 'Handles mistakes well with some guidance' },
  { value: 'loves_challenge', emoji: '🏆', label: 'Loves it',      description: 'Thrives on hard problems, loves a challenge' },
]

const SPAN_OPTIONS: CardOption<AttentionSpan>[] = [
  { value: 'short',  emoji: '⚡', label: 'Short bursts', description: 'Best in 5-8 minute sessions' },
  { value: 'medium', emoji: '⏱️', label: 'Medium',       description: 'Comfortable with 10-15 minutes' },
  { value: 'long',   emoji: '🎯', label: 'Long focus',   description: 'Can stay locked in for 20+ minutes' },
]

const GOAL_OPTIONS: CardOption<ParentGoal>[] = [
  { value: 'catch_up', emoji: '📈', label: 'Catch up',      description: 'Get back to grade level' },
  { value: 'reinforce',emoji: '🔒', label: 'Build mastery', description: 'Deepen confidence at their level' },
  { value: 'advance',  emoji: '⭐', label: 'Get ahead',     description: 'Push beyond their school grade' },
]

const MOTIVATION_OPTIONS: CardOption<MotivationStyle>[] = [
  { value: 'rewards',      emoji: '🎁', label: 'Loves rewards',    description: 'Motivated by XP, badges & streaks' },
  { value: 'challenge',    emoji: '🥊', label: 'Loves challenges', description: '"Can you beat your last score?"' },
  { value: 'encouragement',emoji: '💛', label: 'Needs warmth',     description: 'Responds best to positive reinforcement' },
]

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputClass =
  'w-full px-4 py-3 rounded-xl text-sm text-white border border-white/10 outline-none ' +
  'focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15 transition-all placeholder:text-slate-600'
const inputStyle = { background: 'rgba(255,255,255,0.06)' }

const sectionLabel = 'block text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3'

// ─── Main component ───────────────────────────────────────────────────────────

export function ChildForm({ mode, defaultValues, childId }: ChildFormProps) {
  const router = useRouter()

  // Step state (1, 2, 3)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [name,       setName]       = useState(defaultValues?.name        ?? '')
  const [avatarId,   setAvatarId]   = useState(defaultValues?.avatar_id   ?? 'bear')
  const [schoolGrade,setSchoolGrade]= useState<number | null>(defaultValues?.school_grade ?? null)

  // Step 2
  const [pace,       setPace]       = useState<LearningPace>(        defaultValues?.learning_pace        ?? 'average')
  const [challenge,  setChallenge]  = useState<ChallengePreference>( defaultValues?.challenge_preference ?? 'balanced')
  const [span,       setSpan]       = useState<AttentionSpan>(        defaultValues?.attention_span       ?? 'medium')

  // Step 3
  const [goal,       setGoal]       = useState<ParentGoal>(           defaultValues?.parent_goal          ?? 'reinforce')
  const [motivation, setMotivation] = useState<MotivationStyle>(      defaultValues?.motivation_style     ?? 'encouragement')
  const [notes,      setNotes]      = useState(defaultValues?.learning_notes ?? '')

  // ── Step 1 validation ──
  function isValidName(n: string) {
    const trimmed = n.trim()
    return trimmed.length > 0 && /^[\p{L}\p{N}\s'-]+$/u.test(trimmed)
  }

  function canAdvanceStep1() {
    return isValidName(name) && schoolGrade !== null
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!name.trim()) { toast.error('Name is required'); return }
    if (!isValidName(name)) { toast.error('Name can only contain letters, numbers, spaces, hyphens, and apostrophes'); return }
    if (schoolGrade === null) { toast.error('School grade is required'); return }

    setLoading(true)

    const body = {
      name: name.trim(),
      avatar_id: avatarId,
      school_grade: schoolGrade,
      learning_pace: pace,
      challenge_preference: challenge,
      attention_span: span,
      parent_goal: goal,
      motivation_style: motivation,
      learning_notes: notes.trim() || null,
    }

    const url    = mode === 'create' ? '/api/children' : `/api/children/${childId}`
    const method = mode === 'create' ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Something went wrong' }))
      toast.error(error)
      setLoading(false)
      return
    }

    toast.success(mode === 'create' ? `${name.trim()} added!` : 'Changes saved!')
    router.push('/children')
    router.refresh()
  }

  // ─── Progress bar ──────────────────────────────────────────────────────────
  const Progress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                background: s < step ? '#E74C3C' : s === step ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.06)',
                border: s <= step ? '1.5px solid rgba(231,76,60,0.7)' : '1.5px solid rgba(255,255,255,0.1)',
                color: s <= step ? (s < step ? '#fff' : '#E74C3C') : '#475569',
              }}
            >
              {s < step ? <Check className="w-3 h-3" /> : s}
            </div>
            {s < 3 && (
              <div
                className="flex-1 h-[1.5px] w-16 sm:w-24 transition-all duration-500"
                style={{ background: s < step ? '#E74C3C' : 'rgba(255,255,255,0.08)' }}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-600">
        Step {step} of 3 -{' '}
        {step === 1 ? "Who's learning?" : step === 2 ? 'How they learn' : 'Your goals'}
      </p>
    </div>
  )

  // ─── Step 1 ────────────────────────────────────────────────────────────────
  const Step1 = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Name */}
      <div>
        <label htmlFor="name" className={sectionLabel}>Child&apos;s name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Emma"
          required
          autoFocus
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* School grade */}
      <div>
        <label className={sectionLabel}>Current school grade</label>
        <div className="flex gap-2">
          {GRADE_OPTIONS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setSchoolGrade(g.value)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border"
              style={{
                background: schoolGrade === g.value ? 'rgba(231,76,60,0.15)' : 'rgba(255,255,255,0.04)',
                borderColor: schoolGrade === g.value ? 'rgba(231,76,60,0.6)' : 'rgba(255,255,255,0.1)',
                color: schoolGrade === g.value ? '#fca5a5' : '#64748b',
                transform: schoolGrade === g.value ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: schoolGrade === g.value ? '0 0 0 3px rgba(231,76,60,0.1)' : 'none',
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar */}
      <div>
        <label className={sectionLabel}>Choose an avatar</label>
        <AvatarSelector value={avatarId} onChange={setAvatarId} />
      </div>

      <button
        type="button"
        onClick={() => setStep(2)}
        disabled={!canAdvanceStep1()}
        className="cta-btn w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        style={{
          background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
          boxShadow: canAdvanceStep1() ? '0 4px 20px rgba(192,57,43,0.35)' : 'none',
        }}
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )

  // ─── Step 2 ────────────────────────────────────────────────────────────────
  const Step2 = () => (
    <div className="space-y-7 animate-fade-in-up">
      <div>
        <label className={sectionLabel}>How quickly does {name || 'your child'} pick up new things?</label>
        <CardGroup options={PACE_OPTIONS} value={pace} onChange={setPace} />
      </div>
      <div>
        <label className={sectionLabel}>How does {name || 'your child'} handle hard questions?</label>
        <CardGroup options={CHALLENGE_OPTIONS} value={challenge} onChange={setChallenge} />
      </div>
      <div>
        <label className={sectionLabel}>How long can {name || 'your child'} stay focused?</label>
        <CardGroup options={SPAN_OPTIONS} value={span} onChange={setSpan} />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-medium text-slate-400 border border-white/10 hover:bg-white/[0.06] hover:text-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className="cta-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white"
          style={{
            background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
            boxShadow: '0 4px 20px rgba(192,57,43,0.35)',
          }}
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setStep(3)}
        className="block w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors -mt-3"
      >
        Skip - use defaults
      </button>
    </div>
  )

  // ─── Step 3 ────────────────────────────────────────────────────────────────
  const Step3 = () => (
    <div className="space-y-7 animate-fade-in-up">
      <div>
        <label className={sectionLabel}>What&apos;s your main goal for {name || 'your child'}?</label>
        <CardGroup options={GOAL_OPTIONS} value={goal} onChange={setGoal} />
      </div>
      <div>
        <label className={sectionLabel}>What motivates {name || 'your child'} most?</label>
        <CardGroup options={MOTIVATION_OPTIONS} value={motivation} onChange={setMotivation} />
      </div>

      {/* Optional notes */}
      <div>
        <label htmlFor="notes" className={sectionLabel}>
          Anything else we should know?{' '}
          <span className="normal-case font-normal text-slate-600 tracking-normal">optional</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`e.g. "${name || 'Emma'} has ADHD and needs shorter sessions" or "English is her second language"`}
          rows={3}
          className={inputClass + ' resize-none leading-relaxed'}
          style={inputStyle}
        />
        <p className="text-[10px] text-slate-600 mt-1.5">
          This goes directly into the AI&apos;s context for every lesson.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-medium text-slate-400 border border-white/10 hover:bg-white/[0.06] hover:text-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="cta-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
            boxShadow: '0 4px 20px rgba(192,57,43,0.35)',
          }}
        >
          {loading
            ? 'Saving…'
            : mode === 'create'
            ? `Add ${name || 'child'}`
            : 'Save changes'}
          {!loading && <Check className="w-4 h-4" />}
        </button>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="block w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors -mt-3 disabled:opacity-40"
      >
        Skip - use defaults &amp; save
      </button>
    </div>
  )

  return (
    <div>
      <Progress />
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
    </div>
  )
}
