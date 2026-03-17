'use client'

import { cn } from '@/lib/utils'

const AVATARS = [
  { id: 'bear',    emoji: '🐻', label: 'Bear'    },
  { id: 'cat',     emoji: '🐱', label: 'Cat'     },
  { id: 'dog',     emoji: '🐶', label: 'Dog'     },
  { id: 'fox',     emoji: '🦊', label: 'Fox'     },
  { id: 'owl',     emoji: '🦉', label: 'Owl'     },
  { id: 'penguin', emoji: '🐧', label: 'Penguin' },
  { id: 'rabbit',  emoji: '🐰', label: 'Rabbit'  },
  { id: 'tiger',   emoji: '🐯', label: 'Tiger'   },
]

interface AvatarSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function AvatarSelector({ value, onChange }: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {AVATARS.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          onClick={() => onChange(avatar.id)}
          className={cn(
            'flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all duration-150',
            value === avatar.id
              ? 'border-red-500/60 bg-red-500/10'
              : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20'
          )}
        >
          <span className="text-3xl">{avatar.emoji}</span>
          <span className={cn('text-xs', value === avatar.id ? 'text-slate-200' : 'text-slate-500')}>{avatar.label}</span>
        </button>
      ))}
    </div>
  )
}
