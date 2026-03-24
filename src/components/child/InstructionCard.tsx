'use client'

import { useState, useCallback } from 'react'
import { ReadAloudButton } from './ReadAloudButton'
import type {
  InstructionStep,
  WorkedExample,
  LessonContent,
} from '@/types/lesson-content'

// ── Props ────────────────────────────────────────────────────

interface InstructionCardProps {
  content: LessonContent
  gradeLevel: number
  /** Called when child completes all instruction steps */
  onComplete: () => void
  /** Called if child taps "Got it!" to skip remaining steps */
  onSkip: () => void
}

// ── Main component ───────────────────────────────────────────

export function InstructionCard({
  content,
  gradeLevel,
  onComplete,
  onSkip,
}: InstructionCardProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [revealedExampleSteps, setRevealedExampleSteps] = useState(0)
  const [checkInAnswer, setCheckInAnswer] = useState('')
  const [checkInResult, setCheckInResult] = useState<'correct' | 'wrong' | null>(null)

  const steps = content.introduction
  const currentStep = steps[stepIndex]
  const isLastStep = stepIndex === steps.length - 1
  const progress = ((stepIndex + 1) / steps.length) * 100

  const advanceStep = useCallback(() => {
    setRevealedExampleSteps(0)
    setCheckInAnswer('')
    setCheckInResult(null)

    if (isLastStep) {
      onComplete()
    } else {
      setStepIndex((i) => i + 1)
    }
  }, [isLastStep, onComplete])

  const handleCheckIn = useCallback(() => {
    if (!currentStep?.expectedResponse) return
    const normalized = checkInAnswer.trim().toLowerCase()
    const expected = currentStep.expectedResponse.trim().toLowerCase()
    setCheckInResult(normalized === expected ? 'correct' : 'wrong')
  }, [checkInAnswer, currentStep])

  if (!currentStep) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Progress dots */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex gap-1.5 flex-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full flex-1 transition-all duration-300"
              style={{
                background: i <= stepIndex ? '#3678FF' : '#E2E8F0',
              }}
            />
          ))}
        </div>
        <span className="text-xs text-slate-400 shrink-0">
          {stepIndex + 1}/{steps.length}
        </span>
      </div>

      {/* Lesson title badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
          {content.title}
        </span>
      </div>

      {/* Step card */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <ReadAloudButton text={currentStep.content} gradeLevel={gradeLevel} />

        {currentStep.type === 'text' && (
          <TextStep step={currentStep} />
        )}

        {currentStep.type === 'visual' && (
          <VisualStep step={currentStep} />
        )}

        {currentStep.type === 'worked_example' && currentStep.example && (
          <WorkedExampleStep
            example={currentStep.example}
            revealedSteps={revealedExampleSteps}
            onRevealNext={() => setRevealedExampleSteps((n) => n + 1)}
          />
        )}

        {currentStep.type === 'interactive' && currentStep.prompt && (
          <InteractiveStep
            step={currentStep}
            answer={checkInAnswer}
            onAnswerChange={setCheckInAnswer}
            onCheck={handleCheckIn}
            result={checkInResult}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {/* Got it! skip button */}
        {!isLastStep && stepIndex > 0 && (
          <button
            onClick={onSkip}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm text-slate-500 bg-slate-50 border border-slate-200 active:scale-[0.98] transition-all"
          >
            Got it! Skip ahead
          </button>
        )}

        {/* Next / Let's practice! button */}
        <button
          onClick={advanceStep}
          disabled={
            currentStep.type === 'worked_example' &&
            currentStep.example &&
            revealedExampleSteps < currentStep.example.steps.length
          }
          className="flex-1 py-3.5 rounded-2xl font-bold text-lg text-white active:scale-[0.98] transition-all shadow-md disabled:opacity-40"
          style={{ background: isLastStep ? '#10B981' : '#3678FF' }}
        >
          {isLastStep ? "Let's practice!" : 'Next'}
        </button>
      </div>
    </div>
  )
}

// ── Step renderers ───────────────────────────────────────────

function TextStep({ step }: { step: InstructionStep }) {
  return (
    <div className="space-y-3">
      <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
        {step.content}
      </p>
      {step.visual && (
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-sm text-slate-500">{step.visual.alt}</p>
        </div>
      )}
    </div>
  )
}

function VisualStep({ step }: { step: InstructionStep }) {
  return (
    <div className="space-y-3">
      {step.content && (
        <p className="text-base text-slate-700 leading-relaxed">
          {step.content}
        </p>
      )}
      {step.visual && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-100">
          <p className="text-lg font-semibold text-slate-800">{step.visual.alt}</p>
          {/* Visual asset renderer - will be expanded per visual type */}
          <VisualAssetRenderer visual={step.visual} />
        </div>
      )}
    </div>
  )
}

function WorkedExampleStep({
  example,
  revealedSteps,
  onRevealNext,
}: {
  example: WorkedExample
  revealedSteps: number
  onRevealNext: () => void
}) {
  const allRevealed = revealedSteps >= example.steps.length

  return (
    <div className="space-y-4">
      {/* Problem */}
      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-sm font-medium text-slate-500 mb-1">Problem</p>
        <p className="text-xl font-bold text-slate-800">{example.problem}</p>
      </div>

      {/* Revealed steps */}
      <div className="space-y-2">
        {example.steps.slice(0, revealedSteps).map((s, i) => (
          <div
            key={i}
            className="bg-blue-50 rounded-xl p-3 border border-blue-100 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <p className="text-sm font-semibold text-blue-600 mb-0.5">Step {i + 1}</p>
            <p className="text-slate-700">{s.explanation}</p>
            {s.visual && <p className="text-sm text-slate-500 mt-1">{s.visual}</p>}
          </div>
        ))}
      </div>

      {/* Reveal next step button */}
      {!allRevealed && (
        <button
          onClick={onRevealNext}
          className="w-full py-2.5 rounded-xl font-semibold text-sm text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 active:scale-[0.98] transition-all"
        >
          Show step {revealedSteps + 1} of {example.steps.length}
        </button>
      )}

      {/* Answer */}
      {allRevealed && (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 animate-in fade-in duration-300">
          <p className="text-sm font-medium text-green-600 mb-1">Answer</p>
          <p className="text-xl font-bold text-green-700">{example.answer}</p>
        </div>
      )}
    </div>
  )
}

function InteractiveStep({
  step,
  answer,
  onAnswerChange,
  onCheck,
  result,
}: {
  step: InstructionStep
  answer: string
  onAnswerChange: (v: string) => void
  onCheck: () => void
  result: 'correct' | 'wrong' | null
}) {
  return (
    <div className="space-y-4">
      <p className="text-lg text-slate-800 leading-relaxed">{step.content}</p>

      {/* Check-in prompt */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <p className="text-base font-semibold text-amber-800 mb-3">{step.prompt}</p>

        <div className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onCheck() }}
            placeholder="Your answer..."
            className="flex-1 text-center text-lg font-semibold bg-white border-2 border-amber-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={onCheck}
            disabled={!answer.trim()}
            className="px-5 py-2 rounded-xl font-bold text-white disabled:opacity-40 transition-opacity"
            style={{ background: '#F59E0B' }}
          >
            Check
          </button>
        </div>

        {result === 'correct' && (
          <p className="text-green-600 font-bold mt-2 animate-in fade-in">Correct!</p>
        )}
        {result === 'wrong' && (
          <p className="text-red-500 font-semibold mt-2 animate-in fade-in">
            Not quite — the answer is {step.expectedResponse}. That's okay!
          </p>
        )}
      </div>
    </div>
  )
}

// ── Visual asset renderer (placeholder — expand per type) ────

function VisualAssetRenderer({ visual }: { visual: { type: string; data: Record<string, unknown>; alt: string } }) {
  const { type, data } = visual

  // Groups visualization (for multiplication as groups)
  if (type === 'groups' && data.groups && data.itemsPerGroup) {
    const groups = data.groups as number
    const items = data.itemsPerGroup as number
    const emoji = (data.emoji as string) ?? '🔵'
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-3">
        {Array.from({ length: groups }, (_, g) => (
          <div key={g} className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: `${Math.ceil(Math.sqrt(items)) * 32}px` }}>
              {Array.from({ length: items }, (_, i) => (
                <span key={i} className="text-xl">{emoji}</span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">{items}</p>
          </div>
        ))}
      </div>
    )
  }

  // Array visualization
  if (type === 'array' && data.rows && data.cols) {
    const rows = data.rows as number
    const cols = data.cols as number
    const emoji = (data.emoji as string) ?? '🔵'
    return (
      <div className="flex flex-col items-center gap-1 mt-3">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex gap-1">
            {Array.from({ length: cols }, (_, c) => (
              <span key={c} className="text-xl">{emoji}</span>
            ))}
          </div>
        ))}
        <p className="text-xs text-slate-400 mt-1">{rows} rows x {cols} columns</p>
      </div>
    )
  }

  // Number line visualization
  if (type === 'number_line' && data.start !== undefined && data.end !== undefined) {
    const start = data.start as number
    const end = data.end as number
    const marks = (data.marks as number[]) ?? []
    const highlight = (data.highlight as number[]) ?? []
    const range = end - start
    return (
      <div className="mt-3 px-4">
        <div className="relative h-8 border-b-2 border-slate-400">
          {/* Tick marks */}
          {Array.from({ length: range + 1 }, (_, i) => {
            const val = start + i
            const pct = (i / range) * 100
            const isHighlighted = highlight.includes(val)
            const isMarked = marks.includes(val) || i === 0 || i === range
            return (
              <div key={val} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
                <div className={`w-0.5 ${isMarked ? 'h-3' : 'h-2'} ${isHighlighted ? 'bg-blue-500' : 'bg-slate-400'}`} />
                {isMarked && (
                  <span className={`text-xs mt-0.5 ${isHighlighted ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                    {val}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Fallback: just show the alt text
  return null
}
