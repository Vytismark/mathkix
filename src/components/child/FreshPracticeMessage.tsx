'use client'

import { useState, useEffect } from 'react'
import { DOMAIN_LABELS } from '@/lib/quiz/levelMapping'
import type { Domain } from '@/types/quiz'

interface FreshPracticeMessageProps {
  domain: string
  show: boolean
}

/**
 * Animated banner shown when a child has completed all lessons
 * for a domain/grade and is now getting fresh procedurally generated practice.
 * Auto-dismisses after 3 seconds.
 */
export function FreshPracticeMessage({ domain, show }: FreshPracticeMessageProps) {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    if (!show) return
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [show])

  if (!visible) return null

  const label = DOMAIN_LABELS[domain as Domain] ?? domain

  return (
    <div className="w-full bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 rounded-2xl px-4 py-3 mb-3 text-center animate-in fade-in slide-in-from-top-2 duration-500">
      <p className="text-sm font-semibold text-indigo-700">
        Well done! You completed all {label} lessons!
      </p>
      <p className="text-xs text-indigo-500 mt-0.5">
        Generating fresh practice questions just for you...
      </p>
    </div>
  )
}
