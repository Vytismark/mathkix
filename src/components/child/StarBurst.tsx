'use client'

import { useEffect, useState } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  emoji: string
}

const EMOJIS = ['⭐', '🌟', '✨', '💫', '🎉', '🎊']

export function StarBurst() {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    const generated = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 30,
      duration: 0.8 + Math.random() * 1.2,
      delay: Math.random() * 0.5,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }))
    setStars(generated)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-bounce"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            fontSize: star.size,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            animationFillMode: 'both',
          }}
        >
          {star.emoji}
        </div>
      ))}
    </div>
  )
}
