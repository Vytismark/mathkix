'use client'

import type { EngagementSignal } from '@/types/adaptive'

interface EngagementFeedbackProps {
  signal:     EngagementSignal
  childName:  string
  onContinue: () => void
  onPivot:    () => void
  onBreak:    () => void
}

const MESSAGES: Record<EngagementSignal, { emoji: string; title: string; body: string }> = {
  ok: {
    emoji: '🌟', title: 'Keep going!', body: "You're doing great!",
  },
  slowing: {
    emoji: '😊',
    title: 'Take your time!',
    body: "No rush - let's try a slightly easier one.",
  },
  error_streak: {
    emoji: '💪',
    title: "Tricky stuff!",
    body: "These problems are hard. Want to try a different topic for a bit?",
  },
  fatigue: {
    emoji: '😴',
    title: 'Need a break?',
    body: "You've been working hard! Taking a short break helps your brain learn better.",
  },
  disengaged: {
    emoji: '🎯',
    title: 'Let\'s mix it up!',
    body: "How about trying something different? You can always come back to this!",
  },
}

export function EngagementFeedback({
  signal,
  childName,
  onContinue,
  onPivot,
  onBreak,
}: EngagementFeedbackProps) {
  const msg = MESSAGES[signal] ?? MESSAGES.disengaged

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="text-5xl mb-3">{msg.emoji}</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {childName ? `${childName}, ` : ''}{msg.title}
        </h2>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{msg.body}</p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onContinue}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Keep going! 💪
          </button>

          {(signal === 'error_streak' || signal === 'disengaged') && (
            <button
              onClick={onPivot}
              className="w-full py-3 bg-purple-100 text-purple-800 font-semibold rounded-xl hover:bg-purple-200 transition-colors"
            >
              Try a different topic 🔄
            </button>
          )}

          {(signal === 'fatigue' || signal === 'disengaged') && (
            <button
              onClick={onBreak}
              className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Take a break ☕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
