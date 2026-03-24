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
import { InstructionCard } from '@/components/child/InstructionCard'
import { SegmentTransition } from '@/components/child/SegmentTransition'
import type { MixedQuestion, EarnedAchievement } from '@/types/adaptive'
import type { SessionSegment, PracticeQuestion } from '@/types/lesson-content'

type Phase = 'loading' | 'answering' | 'feedback' | 'wrong_review' | 'submitting' | 'instruction' | 'transition'

function looksLikeMath(text: string): boolean {
  return /[\+×÷=]|\d+\/\d+/.test(text) && /^[\d(]/.test(text.trim()) && text.length < 80
}

function displayAnswer(ans: string): string {
  return ans.replace(/\s*\([^)]*\)\s*\.?\s*$/, '').trim() || ans
}

const DOMAIN_LABELS: Record<string, string> = {
  OA:  '➕ Operations',
  NBT: '🔢 Number & Place Value',
  NF:  '🍕 Fractions',
  MD:  '📏 Measurement',
  G:   '📐 Geometry',
}

// ── Flatten segments into a question list for practice/review ──

function flattenSegmentQuestions(segments: SessionSegment[]): { question: PracticeQuestion; segmentIndex: number; standardCode: string }[] {
  const result: { question: PracticeQuestion; segmentIndex: number; standardCode: string }[] = []
  segments.forEach((seg, segIdx) => {
    if (seg.type === 'practice' || seg.type === 'review') {
      for (const q of seg.questions) {
        result.push({ question: q, segmentIndex: segIdx, standardCode: seg.standardCode })
      }
    }
  })
  return result
}

export default function SessionPage() {
  const { sessionId }   = useParams<{ sessionId: string }>()
  const searchParams    = useSearchParams()
  const childId         = searchParams.get('child') ?? ''
  const gradeLevel      = parseInt(searchParams.get('grade') ?? '2', 10)
  const isSegmentedMode = searchParams.get('mode') === 'segmented'
  const router          = useRouter()

  // ── Shared state ──────────────────────────────────────────
  const [phase, setPhase]                   = useState<Phase>('loading')
  const [currentInput, setCurrentInput]     = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect]         = useState<boolean | null>(null)
  const [contextHint, setContextHint]       = useState<string | undefined>(undefined)
  const [wrongAnswerTrigger, setWrongAnswerTrigger] = useState(0)
  const [toastQueue, setToastQueue] = useState<EarnedAchievement[]>([])
  const startedAt = useRef(Date.now())
  const questionStartMs = useRef(Date.now())

  // ── Flat mode state (practice-only fallback) ──────────────
  const [questions, setQuestions]           = useState<MixedQuestion[]>([])
  const [questionIndex, setQuestionIndex]   = useState(0)
  const [answers, setAnswers]               = useState<Record<number, string>>({})

  // ── Segmented mode state ──────────────────────────────────
  const [segments, setSegments]             = useState<SessionSegment[]>([])
  const [segmentIndex, setSegmentIndex]     = useState(0)
  const [segQuestionIndex, setSegQuestionIndex] = useState(0)
  const [segAnswers, setSegAnswers]         = useState<Record<string, string>>({}) // "segIdx:qId" → answer
  const [transitionType, setTransitionType] = useState<'to_practice' | 'to_review' | 'to_instruction' | null>(null)

  // ── Greeting pre-fetch cache ──────────────────────────────
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
          childId, autoGreet: true,
          message: '[New question loaded. Greet the student about this math problem.]',
          currentQuestion: q.text, correctAnswer: q.correct_answer,
          history: [], gradeLevel, questionDomain: q.domain, questionType: q.type,
        }),
      })
      if (res.ok) {
        const { text } = (await res.json()) as { text: string }
        if (text) greetingCache.current.set(index, text)
      }
    } catch {}
  }, [questions, childId, gradeLevel])

  const correctCount = useMemo(() => {
    if (isSegmentedMode) {
      return Object.values(segAnswers).filter(Boolean).length // approximate
    }
    let count = 0
    for (const q of questions) {
      if (answers[q.id] === q.correct_answer) count++
    }
    return count
  }, [questions, answers, segAnswers, isSegmentedMode])

  // ── Load session data ─────────────────────────────────────
  useEffect(() => {
    if (!sessionId) { router.push('/select'); return }

    if (isSegmentedMode) {
      const raw = sessionStorage.getItem(`session_segments_${sessionId}`)
      if (!raw) { router.push('/select'); return }
      try {
        const segs = JSON.parse(raw) as SessionSegment[]
        if (!segs || segs.length === 0) { router.push('/select'); return }
        setSegments(segs)
        // Start with first segment
        const firstSeg = segs[0]
        setPhase(firstSeg.type === 'instruction' ? 'instruction' : 'answering')
        questionStartMs.current = Date.now()
      } catch { router.push('/select') }
    } else {
      const raw = sessionStorage.getItem(`session_questions_${sessionId}`)
      if (!raw) { router.push('/select'); return }
      try {
        const qs = JSON.parse(raw) as MixedQuestion[]
        if (!qs || qs.length === 0) { router.push('/select'); return }
        setQuestions(qs)
        setPhase('answering')
        questionStartMs.current = Date.now()
        void prefetchGreeting(0, qs)
      } catch { router.push('/select') }
    }
  }, [sessionId, router, isSegmentedMode])

  useEffect(() => {
    questionStartMs.current = Date.now()
    setContextHint(undefined)
  }, [questionIndex, segQuestionIndex])

  // ── Current state derivation ──────────────────────────────
  const currentSegment = segments[segmentIndex] as SessionSegment | undefined
  const currentQuestion: MixedQuestion | undefined = isSegmentedMode ? undefined : questions[questionIndex]

  // For segmented mode: get the current practice/review question
  const currentSegQuestion: PracticeQuestion | undefined = useMemo(() => {
    if (!isSegmentedMode || !currentSegment) return undefined
    if (currentSegment.type === 'practice' || currentSegment.type === 'review') {
      return currentSegment.questions[segQuestionIndex]
    }
    return undefined
  }, [isSegmentedMode, currentSegment, segQuestionIndex])

  // Total progress across all segments
  const totalSegmentQuestions = useMemo(() => flattenSegmentQuestions(segments).length, [segments])
  const answeredSegmentQuestions = Object.keys(segAnswers).length

  // ── Domain label ──────────────────────────────────────────
  const domainLabel = useMemo(() => {
    if (isSegmentedMode && currentSegment) {
      // Extract domain from standard code
      const parts = currentSegment.standardCode.split('.')
      const domain = parts.length >= 2 ? parts[1] : currentSegment.standardCode
      return DOMAIN_LABELS[domain] ?? domain
    }
    if (currentQuestion) return DOMAIN_LABELS[currentQuestion.domain] ?? currentQuestion.domain
    return ''
  }, [isSegmentedMode, currentSegment, currentQuestion])

  // ── Segmented: advance to next segment/question ───────────
  const advanceSegmented = useCallback(() => {
    if (!currentSegment) return

    if (currentSegment.type === 'practice' || currentSegment.type === 'review') {
      // More questions in current segment?
      if (segQuestionIndex + 1 < currentSegment.questions.length) {
        setSegQuestionIndex((i) => i + 1)
        setCurrentInput('')
        setSelectedOption(null)
        setWasCorrect(null)
        setPhase('answering')
        return
      }
    }

    // Move to next segment
    if (segmentIndex + 1 < segments.length) {
      const nextSeg = segments[segmentIndex + 1]
      setSegmentIndex((i) => i + 1)
      setSegQuestionIndex(0)
      setCurrentInput('')
      setSelectedOption(null)
      setWasCorrect(null)

      // Show transition
      if (nextSeg.type === 'instruction') {
        setTransitionType('to_instruction')
        setPhase('transition')
      } else if (nextSeg.type === 'review') {
        setTransitionType('to_review')
        setPhase('transition')
      } else if (nextSeg.type === 'practice') {
        setTransitionType('to_practice')
        setPhase('transition')
      }
    } else {
      // Session complete
      submitSegmentedSession()
    }
  }, [currentSegment, segQuestionIndex, segmentIndex, segments])

  const handleTransitionComplete = useCallback(() => {
    setTransitionType(null)
    const seg = segments[segmentIndex]
    setPhase(seg?.type === 'instruction' ? 'instruction' : 'answering')
  }, [segments, segmentIndex])

  // ── Segmented: handle instruction complete ────────────────
  const handleInstructionComplete = useCallback(() => {
    advanceSegmented()
  }, [advanceSegmented])

  const handleInstructionSkip = useCallback(() => {
    advanceSegmented()
  }, [advanceSegmented])

  // ── Segmented: submit answer for practice/review question ─
  const submitSegmentedAnswer = useCallback(async () => {
    if (!currentSegQuestion) return
    const given = currentSegQuestion.type === 'multiple_choice'
      ? (selectedOption ?? '')
      : currentInput
    if (!given) return

    let isCorrect = false
    try {
      const { checkAnswer } = await import('@/lib/quiz/scoring')
      isCorrect = checkAnswer(currentSegQuestion.type, given, currentSegQuestion.correct_answer)
    } catch {}

    setWasCorrect(isCorrect)
    const key = `${segmentIndex}:${currentSegQuestion.id}`
    setSegAnswers((prev) => ({ ...prev, [key]: given }))
    setPhase('feedback')

    if (isCorrect) {
      await new Promise((r) => setTimeout(r, 1400))
      advanceSegmented()
    } else {
      await new Promise((r) => setTimeout(r, 800))
      setPhase('wrong_review')
      setWrongAnswerTrigger((n) => n + 1)
    }
  }, [currentSegQuestion, selectedOption, currentInput, segmentIndex, advanceSegmented])

  const handleSegContinue = useCallback(() => {
    advanceSegmented()
  }, [advanceSegmented])

  // ── Segmented: submit session ─────────────────────────────
  const submitSegmentedSession = useCallback(async () => {
    setPhase('submitting')
    const timeSpentSec = Math.round((Date.now() - startedAt.current) / 1000)

    // Build answers + questions arrays from segments for the complete API
    const allQuestions: PracticeQuestion[] = []
    const allAnswers: Record<number, string> = {}
    for (const [key, answer] of Object.entries(segAnswers)) {
      const [segIdx, qId] = key.split(':')
      const seg = segments[parseInt(segIdx)]
      if (seg && (seg.type === 'practice' || seg.type === 'review')) {
        const q = seg.questions.find((qq) => qq.id === parseInt(qId))
        if (q) {
          allQuestions.push(q)
          allAnswers[q.id] = answer
        }
      }
    }

    try {
      const res = await fetch('/api/adaptive/session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId, childId, answers: allAnswers,
          questions: allQuestions, timeSpentSec,
          segments, // send segments for modality tracking
        }),
      })
      const data = await res.json()

      sessionStorage.removeItem(`session_segments_${sessionId}`)

      const scorePct: number = data.score_pct ?? 0
      const xpEarned: number = data.xp_earned ?? 0
      const newAchievements: EarnedAchievement[] = data.new_achievements ?? []

      const celebrateUrl = `/play/celebrate?child=${childId}&score=${scorePct}&xp=${xpEarned}`

      if (newAchievements.length > 0) {
        setToastQueue(newAchievements)
        sessionStorage.setItem(`celebrate_url_${sessionId}`, celebrateUrl)
      } else {
        router.push(celebrateUrl)
      }
    } catch {
      sessionStorage.removeItem(`session_segments_${sessionId}`)
      router.push(`/play/celebrate?child=${childId}&score=0&xp=0`)
    }
  }, [segAnswers, segments, sessionId, childId, router])

  // ── Flat mode: submit answer ──────────────────────────────
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
    } catch {}

    setWasCorrect(isCorrect)
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: given }))
    setPhase('feedback')

    if (isCorrect) {
      void prefetchGreeting(questionIndex + 1)
      await new Promise((r) => setTimeout(r, 1400))
      advanceToNext({ ...answers, [currentQuestion.id]: given })
    } else {
      void prefetchGreeting(questionIndex + 1)
      await new Promise((r) => setTimeout(r, 800))
      setPhase('wrong_review')
      setWrongAnswerTrigger((n) => n + 1)
    }
  }, [
    currentQuestion, questions, selectedOption, currentInput,
    questionIndex, answers, prefetchGreeting,
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Flat mode: advance to next question or complete ────────
  const advanceToNext = useCallback(async (allAnswers: Record<number, string>) => {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((i) => i + 1)
      setCurrentInput('')
      setSelectedOption(null)
      setWasCorrect(null)
      setPhase('answering')
    } else {
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

        const scorePct: number = data.score_pct ?? 0
        const xpEarned: number = data.xp_earned ?? 0
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

  const handleContinue = useCallback(() => {
    if (isSegmentedMode) {
      handleSegContinue()
    } else {
      advanceToNext(answers)
    }
  }, [isSegmentedMode, handleSegContinue, advanceToNext, answers])

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

  const handleEquationPartClick = (partLabel: string) => {
    setContextHint(partLabel)
  }

  // ── Loading ────────────────────────────────────────────────
  if (phase === 'loading') {
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

  // ── Transition between segments ────────────────────────────
  if (phase === 'transition' && transitionType) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFF' }}>
        <SegmentTransition type={transitionType} onComplete={handleTransitionComplete} />
      </div>
    )
  }

  // ── Determine what to render ──────────────────────────────
  const activeQuestion = isSegmentedMode ? currentSegQuestion : currentQuestion
  const totalProgress = isSegmentedMode
    ? { current: answeredSegmentQuestions + 1, total: totalSegmentQuestions + segments.filter(s => s.type === 'instruction').length }
    : { current: questionIndex + 1, total: questions.length }

  // ── Segmented: instruction phase ──────────────────────────
  if (phase === 'instruction' && isSegmentedMode && currentSegment?.type === 'instruction') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFF' }}>
        {toastQueue.length > 0 && (
          <AchievementToast achievement={toastQueue[0]} onDismiss={handleToastDismiss} />
        )}

        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-2.5">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <button
              onClick={() => router.push(childId ? `/play/home?child=${childId}` : '/select')}
              className="text-slate-400 hover:text-slate-700 text-sm shrink-0"
            >
              ← Back
            </button>
            <div className="flex-1">
              <QuizProgress current={segmentIndex + 1} total={segments.length} />
            </div>
            <span className="shrink-0 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
              📖 Lesson
            </span>
          </div>
        </div>

        {/* Instruction content */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-3 py-4 sm:px-4 sm:py-6">
          <InstructionCard
            content={currentSegment.content}
            gradeLevel={gradeLevel}
            onComplete={handleInstructionComplete}
            onSkip={handleInstructionSkip}
          />
        </div>
      </div>
    )
  }

  // ── Practice/review question rendering ────────────────────
  if (!activeQuestion) return null

  const showClickableEquation = looksLikeMath(activeQuestion.text)

  const submitFn = isSegmentedMode ? submitSegmentedAnswer : submitAnswer
  const isDisabled = phase === 'feedback'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFF' }}>

      {toastQueue.length > 0 && (
        <AchievementToast achievement={toastQueue[0]} onDismiss={handleToastDismiss} />
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push(childId ? `/play/home?child=${childId}` : '/select')}
            className="text-slate-400 hover:text-slate-700 text-sm shrink-0"
          >
            ← Back
          </button>
          <div className="flex-1">
            <QuizProgress current={totalProgress.current} total={totalProgress.total} />
          </div>
          <span className="shrink-0 text-xs font-semibold text-[#3678FF] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
            {domainLabel}
          </span>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-3 py-4 sm:px-4 sm:py-6 flex flex-col md:flex-row gap-5 items-start">

        {/* LEFT: Question + answer input */}
        <div className="w-full md:w-[55%] flex flex-col gap-4">

          {/* Feedback banner */}
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
          {phase === 'wrong_review' && activeQuestion && (
            <div className="rounded-2xl px-4 py-3 text-center bg-amber-50 border border-amber-200">
              <p className="text-amber-700 font-bold text-lg mb-1">
                The answer was: {displayAnswer(activeQuestion.correct_answer)}
              </p>
              <p className="text-amber-600 text-sm">Ms. Owl is explaining why</p>
            </div>
          )}

          {/* Hint banner for practice questions with hints */}
          {isSegmentedMode && currentSegQuestion && 'hint' in currentSegQuestion && currentSegQuestion.hint && phase === 'wrong_review' && (
            <div className="rounded-xl px-4 py-2.5 bg-blue-50 border border-blue-100 text-sm text-blue-700">
              💡 {currentSegQuestion.hint}
            </div>
          )}

          {/* Question card */}
          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
            <ReadAloudButton text={activeQuestion.text} gradeLevel={gradeLevel} />
            {showClickableEquation ? (
              <ClickableEquation
                expression={activeQuestion.text}
                onPartClick={handleEquationPartClick}
                disabled={isDisabled}
              />
            ) : (
              <p className="text-xl font-semibold text-slate-800 leading-snug px-10">
                {activeQuestion.text}
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
              {activeQuestion.type === 'multiple_choice' && activeQuestion.options && (
                <AnswerGrid
                  options={activeQuestion.options}
                  selected={selectedOption}
                  onSelect={setSelectedOption}
                  onSubmit={submitFn}
                  disabled={isDisabled}
                />
              )}
              {activeQuestion.type === 'numeric' && !isNaN(Number(activeQuestion.correct_answer)) && activeQuestion.correct_answer.trim() !== '' && (
                <NumberPad
                  value={currentInput}
                  onChange={setCurrentInput}
                  onSubmit={submitFn}
                  disabled={isDisabled}
                />
              )}
              {activeQuestion.type === 'numeric' && (isNaN(Number(activeQuestion.correct_answer)) || activeQuestion.correct_answer.trim() === '') && /^\d+\/\d+/.test(activeQuestion.correct_answer.trim()) && (
                <FractionInput
                  value={currentInput}
                  onChange={setCurrentInput}
                  onSubmit={submitFn}
                  disabled={isDisabled}
                />
              )}
              {activeQuestion.type === 'numeric' && (isNaN(Number(activeQuestion.correct_answer)) || activeQuestion.correct_answer.trim() === '') && !/^\d+\/\d+/.test(activeQuestion.correct_answer.trim()) && (
                <div className="w-full flex flex-col gap-3">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitFn() }}
                    placeholder="Type your answer…"
                    disabled={isDisabled}
                    className="w-full text-center text-lg font-semibold bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={submitFn}
                    disabled={isDisabled || !currentInput.trim()}
                    className="w-full py-4 rounded-2xl text-white text-lg font-bold disabled:opacity-40 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #2557CC, #3678FF)' }}
                  >
                    Check answer ✓
                  </button>
                </div>
              )}
              {activeQuestion.type === 'fraction' && (
                <FractionInput
                  value={currentInput}
                  onChange={setCurrentInput}
                  onSubmit={submitFn}
                  disabled={isDisabled}
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

        {/* RIGHT: Teacher panel */}
        <div className="w-full md:w-[45%] md:sticky md:top-[72px]">
          <AiTeacherPanel
            childId={childId}
            sessionId={sessionId}
            gradeLevel={gradeLevel}
            currentQuestion={activeQuestion.text}
            correctAnswer={activeQuestion.correct_answer}
            contextHint={contextHint}
            questionDomain={'domain' in activeQuestion ? (activeQuestion.domain ?? '') : ''}
            questionType={activeQuestion.type}
            progressSummary={`${correctCount} of ${totalProgress.total} correct so far`}
            wrongAnswerTrigger={wrongAnswerTrigger}
            prefetchedGreeting={isSegmentedMode ? undefined : greetingCache.current.get(questionIndex)}
            className="h-[300px] sm:h-[420px] md:h-[calc(100vh-100px)] md:max-h-[560px]"
          />
        </div>

      </div>
    </div>
  )
}
