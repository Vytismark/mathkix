'use client'

interface MascotCharacterProps {
  mood?: 'neutral' | 'happy' | 'excited' | 'thinking'
  size?: 'sm' | 'md' | 'lg'
}

const MOOD_EMOJI: Record<string, string> = {
  neutral: '🤔',
  happy: '😊',
  excited: '🥳',
  thinking: '🧐',
}

const SIZE_CLASS: Record<string, string> = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
}

export function MascotCharacter({ mood = 'neutral', size = 'md' }: MascotCharacterProps) {
  const animClass = mood === 'excited' ? 'animate-bounce' : mood === 'happy' ? 'animate-pulse' : ''
  return (
    <div className={`${SIZE_CLASS[size]} ${animClass} select-none`} role="img" aria-label={`Mascot ${mood}`}>
      {MOOD_EMOJI[mood]}
    </div>
  )
}
