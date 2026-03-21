'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { StarBurst } from '@/components/child/StarBurst'
import { IslandView } from '@/components/child/IslandView'
import type { Domain } from '@/types/quiz'

function CelebrateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const childId    = searchParams.get('child') ?? ''
  const score      = parseFloat(searchParams.get('score') ?? '0')
  const xp         = parseInt(searchParams.get('xp') ?? '0')
  const domain     = (searchParams.get('domain') ?? null) as Domain | null

  const isPerfect = score === 100
  const isGood    = score >= 70

  // Island data - fetched from child profile
  const [islandData, setIslandData] = useState<{
    gradeLevel: number
    domainMastery: Partial<Record<Domain, number>>
    streakDays: number
    lastActiveDaysAgo: number
    childName: string
    xpTotal: number
  } | null>(null)

  useEffect(() => {
    if (!childId) return
    fetch(`/api/child/island?child=${childId}`)
      .then(r => r.json())
      .then(d => {
        if (d.gradeLevel !== undefined) setIslandData(d)
      })
      .catch(() => {})
  }, [childId])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative max-w-sm mx-auto" style={{ background: '#F8FAFF' }}>
      {isPerfect && <StarBurst />}

      {/* Score emoji */}
      <div className="text-6xl mb-3 relative z-10">
        {isPerfect ? '🏆' : isGood ? '🌟' : '💪'}
      </div>

      <h1 className="text-2xl font-extrabold mb-1 relative z-10">
        {isPerfect ? 'Perfect!' : isGood ? 'Great job!' : 'Nice effort!'}
      </h1>
      <p className="text-muted-foreground text-sm mb-5 relative z-10">
        {isPerfect
          ? 'You answered every question correctly!'
          : isGood
          ? 'Keep practicing to master this!'
          : 'Every attempt makes you better!'}
      </p>

      {/* Score card */}
      <div className="bg-white rounded-3xl shadow-lg p-5 w-full mb-5 relative z-10">
        <div className="flex justify-around">
          <div>
            <p className="text-3xl font-bold text-[#3678FF]">{score.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Score</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-3xl font-bold text-amber-500">+{xp}</p>
            <p className="text-xs text-muted-foreground mt-1">XP earned</p>
          </div>
        </div>
      </div>

      {/* Mini island preview */}
      {islandData && (
        <div className="w-full mb-5 relative z-10">
          {domain && (
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Your island
              {score >= 50 ? ' grew! ✨' : ''}
            </p>
          )}
          <IslandView
            gradeLevel={islandData.gradeLevel}
            domainMastery={islandData.domainMastery}
            streakDays={islandData.streakDays}
            lastActiveDaysAgo={islandData.lastActiveDaysAgo}
            childName={islandData.childName}
            compact
            highlightDomain={domain}
          />
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3 w-full relative z-10">
        <button
          onClick={() => router.push(`/play/home?child=${childId}`)}
          className="text-white text-lg font-bold py-4 rounded-2xl transition-all active:scale-95"
          style={{ background: '#3678FF' }}
        >
          Keep learning! 🚀
        </button>
        <button
          onClick={() => router.push('/select')}
          className="text-muted-foreground hover:text-foreground text-sm py-2"
        >
          Switch child
        </button>
      </div>
    </div>
  )
}

export default function CelebratePage() {
  return (
    <Suspense>
      <CelebrateContent />
    </Suspense>
  )
}
