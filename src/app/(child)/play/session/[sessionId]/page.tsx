'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { AnswerGrid } from '@/components/child/AnswerGrid'
import { NumberPad } from '@/components/child/NumberPad'
import { FractionInput } from '@/components/child/FractionInput'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { ClickableEquation } from '@/components/adaptive/ClickableEquation'
import { AchievementToast } from '@/components/adaptive/AchievementToast'
import { AiTeacherPanel } from '@/components/adaptive/AiTeacherPanel'
import { ReadAloudButton } from '@/components/child/ReadAloudButton'
import type { MixedQuestion, EarnedAchievement } from '@/types/adaptive'

type Phase = 'loading' | 'answering' | 'feedback' | 'wrong_review' | 'submitting'

function looksLikeMath(text: string): boolean {
  return /[\+×÷=]|\d+\/\d+/.test(text) && text.length < 80
}

/** Strip trailing parenthetical hints like "(also: rhombus, ...)" from displayed answers */
function displayAnswer(ans: string): string {
  // Use [^)]* instead of .* to avoid multiline/greedy issues
  return ans.replace(/\s*\([^)]*\)\s*\.?\s*$/, '').trim() || ans
}

const DOMAIN_LABELS: Record<string, string> = {
  OA:  '➕ Operations',
  NBT: '🔢 Number & Place Value',
  NF:  '🍕 Fractions',
  MD:  '📏 Measurement',
  G:   '📐 Geometry',
}

export default function SessionPage() {
  const { sessionId }   = useParams<{ sessionId: string }>()
  const searchParams    = useSearchParams()
  const childId         = searchParams.get('child') ?? ''
  const gradeLevel      = parseInt(searchParams.get('grade') ?? '2', 10)
  const router          = useRouter()

  const [questions, setQuestions]           = useState<MixedQuestion[]>([])
  const [phase, setPhase]                   = useState<Phase>('loading')
  const [questionIndex, setQuestionIndex]   = useState(0)
  const [answers, setAnswers]               = useState<Record<number, string>>({})
  const [currentInput, setCurrentInput]     = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect]         = useState<boolean | null>(null)
  const [contextHint, setContextHint]       = useState<string | undefined>(undefined)
  const [wrongAnswerTrigger, setWrongAnswerTrigger] = useState(0)

  // Achievement toast queue
  const [toastQueue, setToastQueue] = useState<EarnedAchievement[]>([])

  const startedAt      = useRef(Date.now())
  const questionStartMs = useRef(Date.now())

  // ── Greeting pre-fetch cache ───────────────────────────────
  // Maps questionIndex → pre-fetched greeting text
  const greetingCache = useRef<Map<number, string>>(new Map())

  const prefetchGreeting = useCallback(async (index: number, qs?: MixedQuestion[]) => {
    const questionList = qs ?? questions
    const q = questionList[index]
    if (!q || greetingCache.current.has(index)) return
    try {
      const res = await fetch('/api/adaptive/ai-teacher?prefetch=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          autoGreet: true,
          message: '[New question loaded. Greet the student about this math problem.]',
          currentQuestion: q.text,
          correctAnswer: q.correct_answer,
          history: [],
          gradeLevel,
          questionDomain: q.domain,
          questionType: q.type,
        }),
      })
      if (res.ok) {
        const { text } = (await res.json()) as { text: string }
        if (text) greetingCache.current.set(index, text)
      }
    } catch { /* silent - auto-greet will fall back to live API call */ }
  }, [questions, childId, gradeLevel])

  // Compute progress summary for AI teacher panel
  const correctCount = useMemo(() => {
    let count = 0
    for (const q of questions) {
      if (answers[q.id] === q.correct_answer) count++
    }
    return count
  }, [questions, answers])

  // ── Load questions from sessionStorage ────────────────────
  useEffect(() => {
    if (!sessionId) { router.push('/select'); return }
    const raw = sessionStorage.getItem(`session_questions_${sessionId}`)
    if (!raw) { router.push('/select'); return }
    try {
      const qs = JSON.parse(raw) as MixedQuestion[]
      if (!qs || qs.length === 0) { router.push('/select'); return }
      setQuestions(qs)
      setPhase('answering')
      questionStartMs.current = Date.now()
      // Pre-fetch Q0 greeting immediately while page is initialising
      void prefetchGreeting(0, qs)
    } catch {
      router.push('/select')
    }
  }, [sessionId, router])

  useEffect(() => {
    questionStartMs.current = Date.now()
    // Clear equation hint on each new question
    setContextHint(undefined)
  }, [questionIndex])

  const currentQuestion: MixedQuestion | undefined = questions[questionIndex]

  const handleEquationPartClick = (partLabel: string) => {
    setContextHint(partLabel)
  }

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || questions.length === 0) return
    const given = currentQuestion.type === 'multiple_choice'
      ? (selectedOption ?? '')
      : currentInput
    if (!given) return

    let isCorrect = false
    try {
      const { checkAnswer } = await import('@/lib/quiz/scoring')
      isCorrect = checkAnswer(currentQuestion.type, given, currentQuestion.correct_answer)
    } catch { /* ignore */ }

    setWasCorrect(isCorrect)
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: given }))
    setPhase('feedback')

    if (isCorrect) {
      // Pre-fetch next greeting during the 1400ms correct-answer animation
      void prefetchGreeting(questionIndex + 1)
      await new Promise((r) => setTimeout(r, 1400))
      advanceToNext({ ...answers, [currentQuestion.id]: given })
    } else {
      // Pre-fetch next greeting during wrong-review (child reads explanation)
      void prefetchGreeting(questionIndex + 1)
      await new Promise((r) => setTimeout(r, 800))
      setPhase('wrong_review')
      setWrongAnswerTrigger((n) => n + 1)
    }
  }, [
    currentQuestion, questions, selectedOption, currentInput,
    questionIndex, answers, childId, sessionId, router,
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Advance to next question or complete session ──────────
  const advanceToNext = useCallback(async (allAnswers: Record<number, string>) => {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((i) => i + 1)
      setCurrentInput('')
      setSelectedOption(null)
      setWasCorrect(null)
      setPhase('answering')
    } else {
      // ── Last question: submit session ──────────────────────
      setPhase('submitting')

      const timeSpentSec = Math.round((Date.now() - startedAt.current) / 1000)

      try {
        const res = await fetch('/api/adaptive/session/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, childId, answers: allAnswers, questions, timeSpentSec }),
        })
        const data = await res.json()

        sessionStorage.removeItem(`session_questions_${sessionId}`)

        const scorePct:     number  = data.score_pct      ?? 0
        const xpEarned:     number  = data.xp_earned      ?? 0
        const newAchievements: EarnedAchievement[] = data.new_achievements ?? []

        const domainCounts: Record<string, number> = {}
        for (const q of questions) domainCounts[q.domain] = (domainCounts[q.domain] ?? 0) + 1
        const primaryDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''

        const domainParam = primaryDomain ? `&domain=${primaryDomain}` : ''
        const celebrateUrl = `/play/celebrate?child=${childId}&score=${scorePct}&xp=${xpEarned}${domainParam}`

        if (newAchievements.length > 0) {
          setToastQueue(newAchievements)
          sessionStorage.setItem(`celebrate_url_${sessionId}`, celebrateUrl)
        } else {
          router.push(celebrateUrl)
        }
      } catch {
        sessionStorage.removeItem(`session_questions_${sessionId}`)
        router.push(`/play/celebrate?child=${childId}&score=0&xp=0`)
      }
    }
  }, [questionIndex, questions, childId, sessionId, router])

  // ── Continue button handler (after wrong answer review) ──
  const handleContinue = useCallback(() => {
    advanceToNext(answers)
  }, [advanceToNext, answers])

  // Navigate after toast queue drains
  useEffect(() => {
    if (toastQueue.length > 0 || phase !== 'submitting') return
    const url = sessionStorage.getItem(`celebrate_url_${sessionId}`)
    if (url) {
      sessionStorage.removeItem(`celebrate_url_${sessionId}`)
      router.push(url)
    }
  }, [toastQueue.length, phase, sessionId, router])

  const handleToastDismiss = useCallback(() => {
    setToastQueue((prev) => prev.slice(1))
  }, [])

  // ── Loading ────────────────────────────────────────────────
  if (phase === 'loading' || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-5xl animate-bounce">🚀</div>
        <p className="text-muted-foreground mt-4">Preparing your session…</p>
      </div>
    )
  }

  // ── Submitting ─────────────────────────────────────────────
  if (phase === 'submitting' && toastQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-5xl animate-spin">⭐</div>
        <p className="text-muted-foreground">Saving your results…</p>
      </div>
    )
  }

  if (!currentQuestion) return null

  const showClickableEquation = looksLikeMath(currentQuestion.text)
  const domainLabel = DOMAIN_LABELS[currentQuestion.domain] ?? currentQuestion.domain

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFF' }}>

      {/* Achievement toasts */}
      {toastQueue.length > 0 && (
        <AchievementToast achievement={toastQueue[0]} onDismiss={handleToastDismiss} />
      )}

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push(childId ? `/play/home?child=${childId}` : '/select')}
            className="text-slate-400 hover:text-slate-700 text-sm shrink-0"
          >
            ← Back
          </button>
          <div className="flex-1">
            <QuizProgress current={questionIndex + 1} total={questions.length} />
          </div>
          {/* Domain chip */}
          <span className="shrink-0 text-xs font-semibold text-[#3678FF] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
            {domainLabel}
          </span>
        </div>
      </div>

      {/* ── Main two-column layout ──────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-3 py-4 sm:px-4 sm:py-6 flex flex-col md:flex-row gap-5 items-start">

        {/* ── LEFT: Question + answer input ─────────────────── */}
        <div className="w-full md:w-[55%] flex flex-col gap-4">

          {/* Answer feedback banner */}
          {phase === 'feedback' && wasCorrect !== null && (
            <div className={`rounded-2xl px-4 py-3 text-center font-bold text-lg ${
              wasCorrect
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-red-50 text-red-500 border border-red-200'
            }`}>
              {wasCorrect ? '✓ Correct!' : '✗ Not quite...'}
            </div>
          )}

          {/* Wrong answer review banner */}
          {phase === 'wrong_review' && currentQuestion && (
            <div className="rounded-2xl px-4 py-3 text-center bg-amber-50 border border-amber-200">
              <p className="text-amber-700 font-bold text-lg mb-1">
                The answer was: {displayAnswer(currentQuestion.correct_answer)}
              </p>
              <p className="text-amber-600 text-sm">Ms. Owl is explaining why</p>
            </div>
          )}

          {/* Question card */}
          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
            <ReadAloudButton text={currentQuestion.text} gradeLevel={gradeLevel} />
            {showClickableEquation ? (
              <ClickableEquation
                expression={currentQuestion.text}
                onPartClick={handleEquationPartClick}
                disabled={phase === 'feedback'}
              />
            ) : (
              <p className="text-xl font-semibold text-slate-800 leading-snug px-10">
                {currentQuestion.text}
              </p>
            )}
            {showClickableEquation && (
              <p className="text-xs text-slate-400 mt-3">
                Tap any part to ask Ms. Owl about it →
              </p>
            )}
          </div>

          {/* Answer input (hidden during wrong_review) */}
          {phase !== 'wrong_review' && (
            <>
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <AnswerGrid
                  options={currentQuestion.options}
                  selected={selectedOption}
                  onSelect={setSelectedOption}
                  onSubmit={submitAnswer}
                  disabled={phase === 'feedback'}
                />
              )}
              {currentQuestion.type === 'numeric' && !isNaN(Number(currentQuestion.correct_answer)) && currentQuestion.correct_answer.trim() !== '' && (
                <NumberPad
                  value={currentInput}
                  onChange={setCurrentInput}
                  onSubmit={submitAnswer}
                  disabled={phase === 'feedback'}
                />
              )}
              {currentQuestion.type === 'numeric' && (isNaN(Number(currentQuestion.correct_answer)) || currentQuestion.correct_answer.trim() === '') && /^\d+\/\d+/.test(currentQuestion.correct_answer.trim()) && (
                <FractionInput
                  value={currentInput}
                  onChange={setCurrentInput}
                  onSubmit={submitAnswer}
                  disabled={phase === 'feedback'}
                />
              )}
              {currentQuestion.type === 'numeric' && (isNaN(Number(currentQuestion.correct_answer)) || currentQuestion.correct_answer.trim() === '') && !/^\d+\/\d+/.test(currentQuestion.correct_answer.trim()) && (
                <div className="w-full flex flex-col gap-3">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitAnswer() }}
                    placeholder="Type your answer…"
                    disabled={phase === 'feedback'}
                    className="w-full text-center text-lg font-semibold bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={submitAnswer}
                    disabled={phase === 'feedback' || !currentInput.trim()}
                    className="w-full py-4 rounded-2xl text-white text-lg font-bold disabled:opacity-40 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #2557CC, #3678FF)' }}
                  >
                    Check answer ✓
                  </button>
                </div>
              )}
              {currentQuestion.type === 'fraction' && (
                <FractionInput
                  value={currentInput}
                  onChange={setCurrentInput}
                  onSubmit={submitAnswer}
                  disabled={phase === 'feedback'}
                />
              )}
            </>
          )}

          {/* Continue button after wrong answer review */}
          {phase === 'wrong_review' && (
            <button
              onClick={handleContinue}
              className="w-full py-3.5 rounded-2xl font-bold text-lg text-white active:scale-[0.98] transition-all shadow-md"
              style={{ background: '#3678FF' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2557CC')}
              onMouseLeave={e => (e.currentTarget.style.background = '#3678FF')}
            >
              Continue to next question
            </button>
          )}
        </div>

        {/* ── RIGHT: Teacher panel ───────────────────────────── */}
        {/* Desktop: sticky side panel | Mobile: natural flow below answer */}
        <div className="w-full md:w-[45%] md:sticky md:top-[72px]">
          <AiTeacherPanel
            childId={childId}
            sessionId={sessionId}
            gradeLevel={gradeLevel}
            currentQuestion={currentQuestion.text}
            correctAnswer={currentQuestion.correct_answer}
            contextHint={contextHint}
            questionDomain={currentQuestion.domain}
            questionType={currentQuestion.type}
            progressSummary={`${correctCount} of ${questions.length} correct so far`}
            wrongAnswerTrigger={wrongAnswerTrigger}
            prefetchedGreeting={greetingCache.current.get(questionIndex)}
            className="h-[300px] sm:h-[420px] md:h-[calc(100vh-100px)] md:max-h-[560px]"
          />
        </div>

      </div>
    </div>
  )
}
