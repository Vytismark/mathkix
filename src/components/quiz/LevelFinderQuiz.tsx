'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AnswerGrid } from '@/components/child/AnswerGrid'
import { NumberPad } from '@/components/child/NumberPad'
import { FractionInput } from '@/components/child/FractionInput'
import { getDomainsForGrade, getQuestionsPerDomain } from '@/types/quiz'
import type { Domain, DomainScores } from '@/types/quiz'
import { DOMAIN_ICONS, DOMAIN_PILL_LABELS, DOMAIN_COLORS } from '@/lib/quiz/levelMapping'
import { QuestionVisual } from '@/components/adaptive/interactive/QuestionVisual'
import { ReadAloudButton } from '@/components/child/ReadAloudButton'
import type { DiagnosticQuestion } from '@/types/quiz'

interface LevelFinderQuizProps {
  childId: string
  childName: string
  schoolGrade: number
}

type Phase = 'idle' | 'loading' | 'answering' | 'feedback' | 'completing' | 'done'

interface CurrentQuestion {
  data: DiagnosticQuestion
  sessionId: string
  startedAt: number
}

export function LevelFinderQuiz({ childId, childName, schoolGrade }: LevelFinderQuizProps) {
  const gradeDomains = getDomainsForGrade(schoolGrade)
  const questionsPerDomain = getQuestionsPerDomain(schoolGrade)
  const TOTAL_QUESTIONS = gradeDomains.length * questionsPerDomain
  const [phase,          setPhase]          = useState<Phase>('idle')
  const [current,        setCurrent]        = useState<CurrentQuestion | null>(null)
  const [answer,         setAnswer]         = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [wasCorrect,     setWasCorrect]     = useState<boolean | null>(null)
  const [questionsAsked, setQuestionsAsked] = useState(0)
  const [currentDomain,  setCurrentDomain]  = useState<Domain>('OA')
  const [domainProgress, setDomainProgress] = useState<Partial<Record<Domain, number>>>(
    () => Object.fromEntries(gradeDomains.map((d) => [d, 0])) as Partial<Record<Domain, number>>
  )
  const router = useRouter()

  async function startQuiz() {
    setPhase('loading')
    const res  = await fetch('/api/quiz/start', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ childId }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setPhase('idle'); return }

    setCurrent({ data: data.question, sessionId: data.sessionId, startedAt: Date.now() })
    setQuestionsAsked(0)
    setCurrentDomain(data.currentDomain ?? 'OA')
    setDomainProgress(data.domainProgress ?? domainProgress)
    setPhase('answering')
  }

  const submitAnswer = useCallback(async () => {
    if (!current) return
    const given = current.data.question_type === 'multiple_choice' ? (selectedOption ?? '') : answer
    if (!given) return

    setPhase('feedback')
    const timeMs = Date.now() - current.startedAt

    const res  = await fetch('/api/quiz/next-question', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        sessionId:   current.sessionId,
        questionId:  current.data.id,
        answerGiven: given,
        timeMs,
      }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setPhase('answering'); return }

    setWasCorrect(data.correct)
    const asked = questionsAsked + 1
    setQuestionsAsked(asked)

    if (data.domainProgress) setDomainProgress(data.domainProgress)
    if (data.currentDomain)  setCurrentDomain(data.currentDomain)

    await new Promise((r) => setTimeout(r, 1200))

    if (data.done) {
      setPhase('completing')
      const completeRes  = await fetch('/api/quiz/complete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId: current.sessionId, childId }),
      })
      const completeData = await completeRes.json()
      if (!completeRes.ok) {
        toast.error(completeData.error)
        setPhase('answering')
        return
      }
      setPhase('done')
      const result = completeData.result as {
        domain_scores: DomainScores
        reasoning: string
        scoring_method?: string
      }
      router.push(
        `/play/quiz/results?scores=${encodeURIComponent(JSON.stringify(result.domain_scores))}&reasoning=${encodeURIComponent(result.reasoning)}&child=${encodeURIComponent(childId)}&scoring=${encodeURIComponent(result.scoring_method ?? 'local_fallback')}`
      )
      return
    }

    if (!data.question) {
      toast.error('No more questions available.')
      setPhase('idle')
      return
    }
    setCurrent({ data: data.question, sessionId: current.sessionId, startedAt: Date.now() })
    setAnswer('')
    setSelectedOption(null)
    setWasCorrect(null)
    setPhase('answering')
  }, [current, answer, selectedOption, questionsAsked, childId, domainProgress, router])

  // ── Idle / loading screens ─────────────────────────────────────────────────

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-6xl">🔍</div>
        <h2 className="text-2xl font-bold text-center">Hi {childName}!</h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Let&apos;s see what you know! Answer {TOTAL_QUESTIONS} questions across {gradeDomains.length} math topics - it only takes a few minutes.
        </p>
        <button
          onClick={startQuiz}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold px-10 py-4 rounded-2xl transition-all active:scale-95"
        >
          Let&apos;s go! 🚀
        </button>
      </div>
    )
  }

  if (phase === 'loading' || phase === 'completing') {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <div className="text-5xl animate-bounce">🧠</div>
        <p className="text-muted-foreground">
          {phase === 'completing' ? 'Analysing your results…' : 'Getting your first question…'}
        </p>
      </div>
    )
  }

  if (!current) return null

  const q           = current.data
  const feedbackPhase = phase === 'feedback'
  const domainQ     = domainProgress[currentDomain] ?? 0

  // ── Quiz UI ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center gap-5 max-w-sm mx-auto py-4">

      {/* "Working on" banner - prominent, shown from question 1 */}
      <div
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: DOMAIN_COLORS[currentDomain].bg,
          border:     `2px solid ${DOMAIN_COLORS[currentDomain].border}`,
        }}
      >
        <span className="text-2xl">{DOMAIN_ICONS[currentDomain]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Working on</p>
          <p className="text-base font-bold text-gray-800 truncate">{DOMAIN_PILL_LABELS[currentDomain]}</p>
        </div>
        <span className="text-sm font-semibold text-gray-500 shrink-0">
          {questionsAsked}/{TOTAL_QUESTIONS}
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="w-full">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:      `${Math.round((questionsAsked / TOTAL_QUESTIONS) * 100)}%`,
              background: DOMAIN_COLORS[currentDomain].hex,
            }}
          />
        </div>
      </div>

      {/* Domain progress pills */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {(gradeDomains as readonly Domain[]).map((d) => {
          const done    = (domainProgress[d] ?? 0) >= questionsPerDomain
          const active  = d === currentDomain && !done
          const color   = DOMAIN_COLORS[d]

          return (
            <span
              key={d}
              style={active ? {
                background: color.bg,
                border:     `1.5px solid ${color.border}`,
                color:      color.hex,
              } : done ? {
                background: '#f0fdf4',
                border:     '1.5px solid #bbf7d0',
                color:      '#16a34a',
              } : {
                background: '#f3f4f6',
                border:     '1.5px solid #e5e7eb',
                color:      '#9ca3af',
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
            >
              <span>{DOMAIN_ICONS[d]}</span>
              {done
                ? <span>✓ {DOMAIN_PILL_LABELS[d]}</span>
                : <span>{DOMAIN_PILL_LABELS[d]}{active ? ` ${domainQ}/${questionsPerDomain}` : ''}</span>
              }
            </span>
          )
        })}
      </div>

      {/* Feedback flash */}
      {feedbackPhase && wasCorrect !== null && (
        <div className={`text-3xl font-bold ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {wasCorrect ? '✓ Correct!' : '✗ Not quite'}
        </div>
      )}

      {/* Question card */}
      <div className="relative bg-white rounded-2xl shadow-sm border p-6 w-full text-center">
        <ReadAloudButton text={q.question_text} gradeLevel={schoolGrade} />
        <p className="text-xl font-semibold leading-relaxed text-gray-900 px-10">{q.question_text}</p>
        <QuestionVisual visualAsset={q.visual_asset} questionText={q.question_text} />
      </div>

      {/* Answer input */}
      {q.question_type === 'multiple_choice' && q.options && (
        <AnswerGrid
          options={q.options as { label: string; value: string }[]}
          selected={selectedOption}
          onSelect={setSelectedOption}
          onSubmit={submitAnswer}
          disabled={feedbackPhase}
        />
      )}
      {q.question_type === 'numeric' && (
        <NumberPad
          value={answer}
          onChange={setAnswer}
          onSubmit={submitAnswer}
          disabled={feedbackPhase}
        />
      )}
      {q.question_type === 'fraction' && (
        <FractionInput
          value={answer}
          onChange={setAnswer}
          onSubmit={submitAnswer}
          disabled={feedbackPhase}
        />
      )}
    </div>
  )
}
