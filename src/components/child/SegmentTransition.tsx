'use client'

import { useEffect, useState } from 'react'

interface SegmentTransitionProps {
  type: 'to_practice' | 'to_review' | 'to_instruction'
  onComplete: () => void
}

const MESSAGES = {
  to_practice: { emoji: '🎯', text: "Now let's practice!", sub: 'Show what you learned' },
  to_review: { emoji: '🧠', text: 'Quick review time!', sub: 'Remember what you learned before' },
  to_instruction: { emoji: '📖', text: 'New lesson!', sub: "Let's learn something new" },
}

export function SegmentTransition({ type, onComplete }: SegmentTransitionProps) {
  const [visible, setVisible] = useState(true)
  const msg = MESSAGES[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 300) // wait for fade-out
    }, 1800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-6xl animate-bounce mb-4">{msg.emoji}</div>
      <h2 className="text-2xl font-bold text-slate-800 mb-1">{msg.text}</h2>
      <p className="text-slate-500">{msg.sub}</p>
    </div>
  )
}
