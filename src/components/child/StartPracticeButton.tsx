'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StartPracticeButtonProps {
  childId: string
}

export function StartPracticeButton({ childId }: StartPracticeButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const start = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/adaptive/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      })
      const data = await res.json()
      if (data.sessionId && Array.isArray(data.questions) && data.questions.length > 0) {
        // Store questions so the session page can access them without a second API call
        sessionStorage.setItem(`session_questions_${data.sessionId}`, JSON.stringify(data.questions))
        const grade = data.gradeLevel ?? 1
        router.push(`/play/session/${data.sessionId}?child=${childId}&grade=${grade}`)
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className="relative w-full disabled:opacity-60 text-white text-xl font-extrabold py-6 px-6 rounded-2xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0 border-b-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2557CC, #3678FF)',
        borderBottomColor: '#1a3f9e',
        boxShadow: '0 8px 24px rgba(54,120,255,0.35)',
      }}
    >
      {/* Shimmer overlay */}
      {!loading && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]" />
      )}
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <span className="animate-spin text-lg">✨</span>
            Starting…
          </>
        ) : (
          <>🚀 Let's Go!</>
        )}
      </span>
    </button>
  )
}
