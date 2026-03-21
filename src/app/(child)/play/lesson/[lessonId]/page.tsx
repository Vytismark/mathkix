'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { AnswerGrid } from '@/components/child/AnswerGrid'
import { NumberPad } from '@/components/child/NumberPad'
import { FractionInput } from '@/components/child/FractionInput'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { AiTeacherBubble } from '@/components/adaptive/AiTeacherBubble'
import { ClickableEquation } from '@/components/adaptive/ClickableEquation'
import { QuestionVisual } from '@/components/adaptive/interactive/QuestionVisual'
import { AchievementToast } from '@/components/adaptive/AchievementToast'
import { EngagementFeedback } from '@/components/adaptive/EngagementFeedback'
import { ReadAloudButton } from '@/components/child/ReadAloudButton'
import { FreshPracticeMessage } from '@/components/child/FreshPracticeMessage'
import type { LessonQuestion } from '@/types/curriculum'
import type { Lesson } from '@/types/curriculum'
import type { EarnedAchievement, EngagementWindow, EngagementSignal, LessonSummary } from '@/types/adaptive'

type Phase = 'loading' | 'answering' | 'feedback' | 'submitting'

// What to do after toasts drain
type AdaptiveAction =
  | { type: 'celebrate'; score: number; xp: number; domain?: string }
  | { type: 'next'; lesson: LessonSummary }
  | { type: 'engagement'; signal: EngagementSignal; nextLesson: LessonSummary | null; score: number; xp: number }

function looksLikeMath(text: string): boolean {
  // Only render as clickable equation if the text contains actual math operators
  // or fraction notation - not just any string that happens to contain a digit.
  const hasMathOp = /[\+×÷=]|\d+\/\d+/.test(text)
  return hasMathOp && text.length < 80
}

function freshEngagementWindow(): EngagementWindow {
  return {
    recentResponseMs: [],
    sessionAvgResponseMs: 0,
    errorStreak: 0,
    correctStreak: 0,
    totalWrong: 0,
    pivotCount: 0,
    disengagementTriggered: false,
    sessionStartMs: Date.now(),
  }
}

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const searchParams = useSearchParams()
  const childId  = searchParams.get('child') ?? ''
  const sessionId = searchParams.get('session') ?? undefined
  const isSRReview = searchParams.get('sr') === '1'
  const router = useRouter()

  const [lesson, setLesson]                 = useState<Lesson | null>(null)
  const [phase, setPhase]                   = useState<Phase>('loading')
  const [questionIndex, setQuestionIndex]   = useState(0)
  const [answers, setAnswers]               = useState<Record<number, string>>({})
  const [currentInput, setCurrentInput]     = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect]         = useState<boolean | null>(null)
  const [startedAt]                         = useState(Date.now())
  const [freshPractice, setFreshPractice]   = useState(false)

  // Adaptive session state
  const [engagementWindow, setEngagementWindow] = useState<EngagementWindow | null>(null)
  const [pendingEmoji, setPendingEmoji]         = useState<'positive' | 'negative' | null>(null)
  const [showEmojiPrompt, setShowEmojiPrompt]   = useState(false)
  const [showEngagement, setShowEngagement]     = useState(false)
  const [pendingAction, setPendingAction]       = useState<AdaptiveAction | null>(null)

  // AI teacher state
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [contextHint, setContextHint] = useState<string | undefined>(undefined)

  // Achievement toast queue
  const [toastQueue, setToastQueue] = useState<EarnedAchievement[]>([])

  // Per-question timer
  const questionStartMs = useRef(Date.now())

  // Load engagement window from sessionStorage (persists across lessons in same session)
  useEffect(() => {
    if (!sessionId) return
    const stored = sessionStorage.getItem(`eng_${sessionId}`)
    setEngagementWindow(stored ? (JSON.parse(stored) as EngagementWindow) : freshEngagementWindow())
  }, [sessionId])

  useEffect(() => {
    const url = childId
      ? `/api/lessons/${lessonId}?child=${childId}`
      : `/api/lessons/${lessonId}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setLesson(data.lesson as Lesson)
        if (data.freshPractice) setFreshPractice(true)
        setPhase('answering')
        questionStartMs.current = Date.now()
      })
      .catch(() => router.push('/select'))
  }, [lessonId, childId, router])

  useEffect(() => {
    questionStartMs.current = Date.now()
  }, [questionIndex])

  const currentQuestion: LessonQuestion | undefined = lesson?.questions[questionIndex]

  const fireBehavioralEvent = useCallback((
    eventType: 'answer_correct' | 'answer_wrong',
    timeMsOverride?: number
  ) => {
    if (!childId) return
    const time_ms = timeMsOverride ?? (Date.now() - questionStartMs.current)
    fetch('/api/adaptive/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_id:    childId,
        session_id:  sessionId ?? null,
        event_type:  eventType,
        question_id: currentQuestion?.id ?? null,
        time_ms,
        metadata: { lesson_id: lessonId },
      }),
    }).catch(() => {})
  }, [childId, sessionId, currentQuestion, lessonId])

  const handleEquationPartClick = (partLabel: string) => {
    setContextHint(partLabel)
    setTeacherOpen(true)
  }

  // Navigate or end session
  const executeAdaptiveAction = useCallback((action: AdaptiveAction) => {
    if (action.type === 'celebrate') {
      if (sessionId) {
        fetch('/api/adaptive/session/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, childId }),
        }).catch(() => {})
        sessionStorage.removeItem(`eng_${sessionId}`)
      }
      const domainParam = action.domain ? `&domain=${action.domain}` : ''
      router.push(`/play/celebrate?child=${childId}&score=${action.score}&xp=${action.xp}${domainParam}`)
    } else if (action.type === 'next') {
      const srParam = action.lesson.is_sr_review ? '&sr=1' : ''
      router.push(`/play/lesson/${action.lesson.id}?child=${childId}&session=${sessionId}${srParam}`)
    } else if (action.type === 'engagement') {
      setShowEngagement(true)
    }
  }, [childId, sessionId, router])

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !lesson) return
    const given = currentQuestion.type === 'multiple_choice'
      ? (selectedOption ?? '')
      : currentInput
    if (!given) return

    const timeMsForEvent = Date.now() - questionStartMs.current

    // Check answer (await so wasCorrect is set before timer)
    let isCorrect = false
    try {
      const { checkAnswer } = await import('@/lib/quiz/scoring')
      isCorrect = checkAnswer(currentQuestion.type, given, currentQuestion.correct_answer)
    } catch { /* ignore */ }

    setWasCorrect(isCorrect)
    fireBehavioralEvent(isCorrect ? 'answer_correct' : 'answer_wrong', timeMsForEvent)

    // Update engagement window locally (avoids stale-state on last question)
    let currentEW = engagementWindow
    if (sessionId && engagementWindow) {
      const prev = engagementWindow
      const newMs = [...prev.recentResponseMs.slice(-4), timeMsForEvent]
      const n = newMs.length
      const newAvg = n === 1
        ? timeMsForEvent
        : Math.round((prev.sessionAvgResponseMs * (n - 1) + timeMsForEvent) / n)
      currentEW = {
        ...prev,
        recentResponseMs:    newMs,
        sessionAvgResponseMs: newAvg,
        errorStreak:          isCorrect ? 0 : prev.errorStreak + 1,
        correctStreak:        isCorrect ? prev.correctStreak + 1 : 0,
        totalWrong:           prev.totalWrong + (isCorrect ? 0 : 1),
      }
      setEngagementWindow(currentEW)
    }

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: given }))
    setPhase('feedback')

    await new Promise((r) => setTimeout(r, 1500))

    if (questionIndex + 1 < lesson.questions.length) {
      setQuestionIndex((i) => i + 1)
      setCurrentInput('')
      setSelectedOption(null)
      setWasCorrect(null)
      setPendingEmoji(null)
      setPhase('answering')
    } else {
      // Last question - submit lesson
      setPhase('submitting')
      setShowEmojiPrompt(true)
      setTimeout(() => setShowEmojiPrompt(false), 3500)
      const allAnswers  = { ...answers, [currentQuestion.id]: given }
      const timeSpentSec = Math.round((Date.now() - startedAt) / 1000)
      const lessonTimeMs = Date.now() - startedAt

      const lessonRes  = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, answers: allAnswers, timeSpentSec }),
      })
      const lessonData = await lessonRes.json()
      const scorePct: number = lessonData.score_pct ?? 0
      const xpEarned: number = lessonData.xp_earned ?? 0
      const lessonDomain: string | undefined = lessonData.lesson_domain ?? undefined

      const initialToasts: EarnedAchievement[] = lessonData.newAchievements ?? []

      if (sessionId && currentEW) {
        // ── Adaptive path: call session/next ────────────────
        try {
          const nextRes  = await fetch('/api/adaptive/session/next', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              childId,
              lessonId,
              score_pct:            scorePct,
              time_spent_ms:        lessonTimeMs,
              emoji:                pendingEmoji,
              isSRReview,
              engagementWindowJson: currentEW,
            }),
          })
          const nextData = await nextRes.json()

          // Persist updated window for next lesson
          if (nextData.engagementWindow) {
            sessionStorage.setItem(`eng_${sessionId}`, JSON.stringify(nextData.engagementWindow))
            setEngagementWindow(nextData.engagementWindow as EngagementWindow)
          }

          const allToasts: EarnedAchievement[] = [
            ...initialToasts,
            ...(nextData.newAchievements ?? []),
          ]

          let action: AdaptiveAction
          if (nextData.sessionComplete || !nextData.nextLesson) {
            action = { type: 'celebrate', score: scorePct, xp: xpEarned, domain: lessonDomain }
          } else if (nextData.engagementSignal !== 'ok') {
            action = {
              type: 'engagement',
              signal: nextData.engagementSignal as EngagementSignal,
              nextLesson: nextData.nextLesson as LessonSummary,
              score: scorePct,
              xp: xpEarned,
            }
          } else {
            action = { type: 'next', lesson: nextData.nextLesson as LessonSummary }
          }

          if (allToasts.length > 0) {
            setPendingAction(action)
            setToastQueue(allToasts)
          } else {
            executeAdaptiveAction(action)
          }
        } catch {
          // Fallback on network error
          const domainParam = lessonDomain ? `&domain=${lessonDomain}` : ''
          router.push(`/play/celebrate?child=${childId}&score=${scorePct}&xp=${xpEarned}${domainParam}`)
        }
      } else {
        // ── Non-adaptive path ───────────────────────────────
        const celebrateAction: AdaptiveAction = { type: 'celebrate', score: scorePct, xp: xpEarned, domain: lessonDomain }
        if (initialToasts.length > 0) {
          setPendingAction(celebrateAction)
          setToastQueue(initialToasts)
        } else {
          executeAdaptiveAction(celebrateAction)
        }
      }
    }
  }, [
    currentQuestion, lesson, selectedOption, currentInput, questionIndex,
    answers, childId, lessonId, startedAt, router, fireBehavioralEvent,
    sessionId, engagementWindow, pendingEmoji, isSRReview, executeAdaptiveAction,
  ])

  // Toast dismissed - just pop the queue; useEffect below handles the side-effect
  const handleToastDismiss = useCallback(() => {
    setToastQueue((prev) => prev.slice(1))
  }, [])

  // When toast queue empties with a pending action, execute it outside the render cycle
  useEffect(() => {
    if (toastQueue.length > 0 || !pendingAction) return
    const action = pendingAction
    setPendingAction(null)
    executeAdaptiveAction(action)
  }, [toastQueue.length, pendingAction, executeAdaptiveAction])

  // Engagement modal handlers
  const handleEngagementContinue = () => {
    setShowEngagement(false)
    if (pendingAction?.type === 'engagement') {
      if (pendingAction.nextLesson) {
        executeAdaptiveAction({ type: 'next', lesson: pendingAction.nextLesson })
      } else {
        executeAdaptiveAction({ type: 'celebrate', score: pendingAction.score, xp: pendingAction.xp })
      }
      setPendingAction(null)
    }
  }

  const handleEngagementPivot = () => {
    setShowEngagement(false)
    if (pendingAction?.type === 'engagement' && pendingAction.nextLesson) {
      // Engine already picked a (potentially different-domain) lesson
      executeAdaptiveAction({ type: 'next', lesson: pendingAction.nextLesson })
      setPendingAction(null)
    }
  }

  const handleEngagementBreak = () => {
    setShowEngagement(false)
    if (pendingAction?.type === 'engagement') {
      if (sessionId) {
        fetch('/api/adaptive/session/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, childId }),
        }).catch(() => {})
        sessionStorage.removeItem(`eng_${sessionId}`)
      }
      router.push(`/play/celebrate?child=${childId}&score=${pendingAction.score}&xp=${pendingAction.xp}`)
      setPendingAction(null)
    }
  }

  if (phase === 'loading' || !lesson || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-5xl animate-bounce">📘</div>
        <p className="text-muted-foreground mt-4">Loading lesson…</p>
      </div>
    )
  }

  if (phase === 'submitting' && toastQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 sm:px-8">
        <div className="text-5xl animate-spin">⭐</div>
        <p className="text-muted-foreground">Saving your results…</p>

        {/* Emoji reaction - shown briefly so child can tap before results load */}
        {sessionId && showEmojiPrompt && (
          <div className="bg-white rounded-3xl shadow-md p-6 w-full max-w-xs text-center">
            <p className="text-sm font-semibold text-slate-600 mb-4">How was that lesson?</p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setPendingEmoji('positive')}
                className={`text-4xl p-3 rounded-2xl transition-all ${pendingEmoji === 'positive' ? 'bg-green-100 scale-110 shadow' : 'opacity-50 hover:opacity-100'}`}
                title="I liked it!"
              >
                👍
              </button>
              <button
                onClick={() => setPendingEmoji('negative')}
                className={`text-4xl p-3 rounded-2xl transition-all ${pendingEmoji === 'negative' ? 'bg-orange-100 scale-110 shadow' : 'opacity-50 hover:opacity-100'}`}
                title="It was hard"
              >
                😕
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const showClickableEquation = looksLikeMath(currentQuestion.text)

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 max-w-md mx-auto" style={{ background: '#F8FAFF' }}>

      {/* Achievement toasts */}
      {toastQueue.length > 0 && (
        <AchievementToast achievement={toastQueue[0]} onDismiss={handleToastDismiss} />
      )}

      {/* Engagement feedback modal */}
      {showEngagement && pendingAction?.type === 'engagement' && (
        <EngagementFeedback
          signal={pendingAction.signal}
          childName=""
          onContinue={handleEngagementContinue}
          onPivot={handleEngagementPivot}
          onBreak={handleEngagementBreak}
        />
      )}

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={() => router.push(childId ? `/play/home?child=${childId}` : '/select')}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back
        </button>
        <span className="text-sm font-medium">{lesson.title}</span>
        <div />
      </div>

      <QuizProgress current={questionIndex + 1} total={lesson.questions.length} />

      {/* Answer feedback */}
      {phase === 'feedback' && wasCorrect !== null && (
        <div className={`text-3xl font-bold mb-2 text-center ${wasCorrect ? 'text-green-500' : 'text-red-500'}`}>
          {wasCorrect ? '✓ Correct! 🎉' : '✗ Not quite - keep going!'}
        </div>
      )}

      {/* Fresh practice banner */}
      {freshPractice && questionIndex === 0 && (
        <FreshPracticeMessage domain={lesson.domain} show={true} />
      )}

      {/* Question */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 w-full text-center mb-6 relative">
        <ReadAloudButton text={currentQuestion.text} gradeLevel={lesson.grade_level} />
        {showClickableEquation ? (
          <ClickableEquation
            expression={currentQuestion.text}
            onPartClick={handleEquationPartClick}
            disabled={phase === 'feedback'}
          />
        ) : (
          <p className="text-xl font-semibold px-10">{currentQuestion.text}</p>
        )}
        <QuestionVisual visualAsset={currentQuestion.visual_asset} questionText={currentQuestion.text} />
      </div>

      {/* Input */}
      {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
        <AnswerGrid
          options={currentQuestion.options}
          selected={selectedOption}
          onSelect={setSelectedOption}
          onSubmit={submitAnswer}
          disabled={phase === 'feedback'}
        />
      )}
      {currentQuestion.type === 'numeric' && (
        <NumberPad
          value={currentInput}
          onChange={setCurrentInput}
          onSubmit={submitAnswer}
          disabled={phase === 'feedback'}
        />
      )}
      {currentQuestion.type === 'fraction' && (
        <FractionInput
          value={currentInput}
          onChange={setCurrentInput}
          onSubmit={submitAnswer}
          disabled={phase === 'feedback'}
        />
      )}

      {/* AI Teacher floating button */}
      <button
        onClick={() => { setContextHint(undefined); setTeacherOpen(true) }}
        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg transition-colors"
        style={{ background: '#3678FF' }}
        aria-label="Ask the teacher"
      >
        <span>🦉</span>
        <span>Ask</span>
      </button>

      {/* AI Teacher bubble */}
      <AiTeacherBubble
        childId={childId}
        sessionId={sessionId}
        isOpen={teacherOpen}
        onClose={() => setTeacherOpen(false)}
        contextHint={contextHint}
        currentQuestion={lesson?.questions[questionIndex]?.text}
      />
    </div>
  )
}
