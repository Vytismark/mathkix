'use client'

import { useState, useEffect, useCallback } from 'react'
import { Flame, Star, CheckCircle, XCircle } from 'lucide-react'

/* ------------------------------------------------------------------ */

interface QuizStep {
  question: string
  options: string[]
  correct: number
  gradeLabel: string
  domain: string
  color: string
}

const DEMO_STEPS: QuizStep[] = [
  { question: '7 + 5 = ?', options: ['11', '12', '13', '14'], correct: 1, gradeLabel: 'Grade 2', domain: 'Addition', color: '#E74C3C' },
  { question: '24 - 9 = ?', options: ['13', '14', '15', '16'], correct: 2, gradeLabel: 'Grade 2', domain: 'Subtraction', color: '#0ea5e9' },
  { question: '3 × 4 = ?', options: ['7', '10', '12', '14'], correct: 2, gradeLabel: 'Grade 3', domain: 'Multiplication', color: '#7c3aed' },
]

const OWL_MESSAGES = [
  { text: "Amazing! You're on fire! 🔥", sub: 'Keep that streak going!' },
  { text: 'Nailed it! Super work! ⭐', sub: 'You make it look easy.' },
  { text: 'You got it! Knew you could! 🦉', sub: 'Level up incoming!' },
]

type Phase = 'question' | 'correct' | 'wrong' | 'owl'

// Floating decorative badge
function FloatingBadge({ style, children }: { style: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div
      className="absolute rounded-xl border px-3 py-2 text-xs font-bold pointer-events-none select-none"
      style={{
        background: 'rgba(12,13,20,0.85)',
        backdropFilter: 'blur(8px)',
        borderColor: 'rgba(255,255,255,0.1)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default function AppPreview() {
  const [stepIdx, setStepIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('question')
  const [selected, setSelected] = useState<number | null>(null)
  const [xp, setXp] = useState(120)
  const [streak, setStreak] = useState(4)
  const [xpPops, setXpPops] = useState<{ id: number; x: number }[]>([])
  const [autoPlay, setAutoPlay] = useState(true)
  const [wrongIdx, setWrongIdx] = useState<number | null>(null)

  const step = DEMO_STEPS[stepIdx]
  const progress = ((stepIdx) / DEMO_STEPS.length) * 100

  const advanceToNext = useCallback(() => {
    setPhase('question')
    setSelected(null)
    setWrongIdx(null)
    setStepIdx((i) => (i + 1) % DEMO_STEPS.length)
  }, [])

  const handleAnswer = useCallback(
    (idx: number) => {
      if (phase !== 'question') return
      setSelected(idx)
      setAutoPlay(false)

      if (idx === step.correct) {
        setPhase('correct')
        setXp((x) => x + 15)
        setStreak((s) => s + 1)
        const pop = { id: Date.now(), x: Math.random() * 40 - 20 }
        setXpPops((p) => [...p, pop])
        setTimeout(() => setXpPops((p) => p.filter((x) => x.id !== pop.id)), 1000)
        setTimeout(() => setPhase('owl'), 900)
        setTimeout(() => advanceToNext(), 3000)
      } else {
        setPhase('wrong')
        setWrongIdx(idx)
        setTimeout(() => {
          setPhase('question')
          setSelected(null)
          setWrongIdx(null)
        }, 900)
      }
    },
    [phase, step.correct, advanceToNext],
  )

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return
    const timer = setTimeout(() => {
      if (phase === 'question') handleAnswer(step.correct)
    }, 2200)
    return () => clearTimeout(timer)
  }, [autoPlay, phase, step.correct, handleAnswer])

  // Resume autoplay when phase resets after wrong answer in autoplay
  useEffect(() => {
    if (!autoPlay && phase === 'question' && selected === null && wrongIdx === null) {
      setAutoPlay(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const isAnswered = phase === 'correct' || phase === 'owl'

  return (
    <div className="relative select-none" style={{ width: 300, paddingTop: 24, paddingBottom: 24 }}>

      {/* Floating decorative badges — hidden on mobile to prevent overlap */}
      <div className="hidden md:block">
        <FloatingBadge style={{ top: 8, left: -40, animation: 'floatA 4s ease-in-out infinite' }}>
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-300">{streak} streak</span>
          </span>
        </FloatingBadge>

        <FloatingBadge style={{ top: 60, right: -50, animation: 'floatB 5s ease-in-out infinite' }}>
          <span className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300">{xp} XP</span>
          </span>
        </FloatingBadge>

        <FloatingBadge style={{ bottom: 70, left: -48, animation: 'floatC 4.5s ease-in-out infinite' }}>
          <span className="text-slate-300">
            🎓 <span style={{ color: step.color }}>{step.gradeLabel}</span>
          </span>
        </FloatingBadge>

        <FloatingBadge style={{ bottom: 30, right: -42, animation: 'floatA 5.5s ease-in-out infinite reverse' }}>
          <span className="text-slate-300">📐 {step.domain}</span>
        </FloatingBadge>
      </div>

      {/* XP floating pops */}
      {xpPops.map((pop) => (
        <div
          key={pop.id}
          className="absolute z-20 font-extrabold text-sm pointer-events-none"
          style={{
            left: `calc(50% + ${pop.x}px)`,
            top: '40%',
            color: '#a78bfa',
            animation: 'xpFloat 1s ease-out forwards',
          }}
        >
          +15 XP
        </div>
      ))}

      {/* ── Phone frame ─────────────────────────────── */}
      <div
        className="relative rounded-[2rem] overflow-hidden"
        style={{
          background: '#080910',
          border: '2px solid rgba(255,255,255,0.1)',
          boxShadow:
            '0 0 0 1px rgba(0,0,0,0.5), 0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(192,57,43,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Dynamic Island / pill notch */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="rounded-full"
            style={{ width: 80, height: 10, background: '#000', border: '1px solid rgba(255,255,255,0.07)' }}
          />
        </div>

        {/* App header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold"
              style={{ background: 'linear-gradient(135deg, #C0392B, #E74C3C)', color: 'white' }}
            >
              M
            </div>
            <span className="text-xs font-bold">
              <span className="text-white">Math</span>
              <span style={{ color: '#E74C3C' }}>Spark</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[11px] font-bold text-orange-300">{streak}</span>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <Star className="w-3 h-3 text-purple-400" />
              <span className="text-[11px] font-bold text-purple-300">{xp}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-3 pb-1">
          <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${isAnswered ? progress + (100 / DEMO_STEPS.length) : progress}%`,
                background: `linear-gradient(90deg, ${step.color}, #f59e0b)`,
                boxShadow: `0 0 8px ${step.color}60`,
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-600 mt-1">
            <span>Question {stepIdx + 1} of {DEMO_STEPS.length}</span>
            <span>{Math.round(isAnswered ? progress + (100 / DEMO_STEPS.length) : progress)}%</span>
          </div>
        </div>

        {/* Content area */}
        <div className="px-5 pt-4 pb-6" style={{ minHeight: 310 }}>

          {/* Question + answers */}
          {phase !== 'owl' && (
            <>
              {/* Question card */}
              <div
                className="rounded-2xl p-5 text-center mb-5"
                style={{
                  background: `linear-gradient(135deg, ${step.color}10, ${step.color}06)`,
                  border: `1px solid ${step.color}25`,
                }}
              >
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                  {step.domain}
                </p>
                <p
                  className="text-4xl font-black tracking-wide"
                  style={{
                    color: 'white',
                    textShadow: `0 0 30px ${step.color}30`,
                  }}
                >
                  {step.question}
                </p>
              </div>

              {/* Answer grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {step.options.map((opt, i) => {
                  const isCorrectAnswer = i === step.correct
                  const isWrong = i === wrongIdx

                  let bg = 'rgba(255,255,255,0.05)'
                  let border = 'rgba(255,255,255,0.09)'
                  let textColor = '#cbd5e1'
                  let transform = 'scale(1)'
                  let shadow = 'none'

                  if (isAnswered && isCorrectAnswer) {
                    bg = 'rgba(16,185,129,0.15)'
                    border = '#10b981'
                    textColor = '#34d399'
                    shadow = '0 0 16px rgba(16,185,129,0.3)'
                  } else if (isWrong) {
                    bg = 'rgba(239,68,68,0.12)'
                    border = '#ef4444'
                    textColor = '#f87171'
                    transform = 'scale(0.97)'
                  } else if (isAnswered) {
                    bg = 'rgba(255,255,255,0.02)'
                    border = 'rgba(255,255,255,0.05)'
                    textColor = '#475569'
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className="relative py-4 rounded-xl text-2xl font-extrabold transition-all duration-150"
                      style={{
                        background: bg,
                        border: `1.5px solid ${border}`,
                        color: textColor,
                        cursor: phase === 'question' ? 'pointer' : 'default',
                        transform,
                        boxShadow: shadow,
                        animation: isWrong ? 'shake 0.5s ease-in-out' : undefined,
                      }}
                    >
                      {isAnswered && isCorrectAnswer && (
                        <CheckCircle
                          className="absolute top-1.5 right-1.5 w-3.5 h-3.5"
                          style={{ color: '#10b981' }}
                        />
                      )}
                      {isWrong && (
                        <XCircle
                          className="absolute top-1.5 right-1.5 w-3.5 h-3.5"
                          style={{ color: '#ef4444' }}
                        />
                      )}
                      {opt}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Ms. Owl panel */}
          {phase === 'owl' && (
            <div
              className="flex flex-col items-center text-center"
              style={{ animation: 'fadeSlideUp 0.4s ease-out' }}
            >
              {/* Owl avatar with glow ring */}
              <div className="relative mb-4">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'rgba(124,58,237,0.25)',
                    filter: 'blur(12px)',
                    transform: 'scale(1.3)',
                  }}
                />
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(192,57,43,0.2))',
                    border: '2px solid rgba(124,58,237,0.5)',
                  }}
                >
                  🦉
                </div>
              </div>

              <p className="text-[11px] text-purple-400 font-bold uppercase tracking-wider mb-3">
                Ms. Owl
              </p>

              {/* Speech bubble */}
              <div
                className="rounded-2xl px-5 py-4 mb-4 text-left"
                style={{
                  background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(124,58,237,0.28)',
                  maxWidth: 220,
                }}
              >
                <p className="text-sm font-semibold text-white mb-1">
                  {OWL_MESSAGES[stepIdx % OWL_MESSAGES.length].text}
                </p>
                <p className="text-xs text-slate-400">
                  {OWL_MESSAGES[stepIdx % OWL_MESSAGES.length].sub}
                </p>
              </div>

              {/* XP reward chip */}
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.3)',
                }}
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">+15 XP earned</span>
              </div>

              {/* Streak bar */}
              <div className="flex items-center gap-1 mt-4">
                {Array.from({ length: Math.min(streak, 5) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[11px]"
                    style={{
                      background: 'rgba(251,146,60,0.18)',
                      border: '1px solid rgba(251,146,60,0.35)',
                    }}
                  >
                    🔥
                  </div>
                ))}
                {streak > 5 && (
                  <span className="text-[10px] text-orange-400 ml-1">+{streak - 5} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hint label */}
      <p className="text-center text-[11px] text-slate-600 mt-4 tracking-wide">
        Tap any answer to try it yourself
      </p>

      <style>{`
        @keyframes xpFloat {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          60%  { opacity: 1; transform: translateX(-50%) translateY(-20px) scale(1.15); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-40px) scale(0.8); }
        }
        @keyframes shake {
          0%,100% { transform: scale(0.97) translateX(0); }
          25%      { transform: scale(0.97) translateX(-5px); }
          50%      { transform: scale(0.97) translateX(5px); }
          75%      { transform: scale(0.97) translateX(-3px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(-4px); }
          50%      { transform: translateY(4px); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(-2px) rotate(-1deg); }
          50%      { transform: translateY(5px) rotate(1deg); }
        }
      `}</style>
    </div>
  )
}
