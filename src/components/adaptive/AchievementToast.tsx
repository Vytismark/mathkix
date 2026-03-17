'use client'

import { useEffect, useState } from 'react'

interface AchievementToastProps {
  achievement: {
    title:       string
    description: string
    icon_slug:   string
    xp_bonus:    number
  }
  onDismiss: () => void
  autoHideMs?: number
}

const ICON_EMOJIS: Record<string, string> = {
  fire:         '🔥',
  fire_double:  '🔥🔥',
  crown:        '👑',
  star:         '⭐',
  stars:        '🌟',
  bolt:         '⚡',
  rocket:       '🚀',
  plus_circle:  '➕',
  numbers:      '🔢',
  fraction:     '½',
  ruler:        '📏',
  shapes:       '🔷',
  trophy:       '🏆',
  brain:        '🧠',
  brain_gold:   '🥇',
  calendar:     '📅',
}

export function AchievementToast({
  achievement,
  onDismiss,
  autoHideMs = 4000,
}: AchievementToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger slide-in animation
    const t1 = setTimeout(() => setVisible(true), 50)
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, autoHideMs)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [autoHideMs, onDismiss])

  const emoji = ICON_EMOJIS[achievement.icon_slug] ?? '🏅'

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
      }`}
    >
      <div
        className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-amber-200 px-5 py-4 min-w-[240px] cursor-pointer"
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }}
      >
        <span className="text-3xl">{emoji}</span>
        <div>
          <div className="font-bold text-gray-800 text-sm">{achievement.title}</div>
          <div className="text-gray-500 text-xs mt-0.5">{achievement.description}</div>
          {achievement.xp_bonus > 0 && (
            <div className="text-indigo-600 text-xs font-semibold mt-1">
              +{achievement.xp_bonus} XP
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
