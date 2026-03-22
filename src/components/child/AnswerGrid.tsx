'use client'

import { cn } from '@/lib/utils'

/** Strip trailing parenthetical hints like "(also: rhombus, ...)" for display only */
function stripHint(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*\.?\s*$/, '').trim() || text
}

interface Option {
  label: string
  value: string
}

interface AnswerGridProps {
  options: Option[]
  selected: string | null
  onSelect: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

const OPTION_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200',
  'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200',
  'bg-green-100 border-green-300 text-green-800 hover:bg-green-200',
  'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200',
]

export function AnswerGrid({ options, selected, onSelect, onSubmit, disabled }: AnswerGridProps) {
  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, i) => (
          <button
            key={`${i}-${option.value}`}
            type="button"
            onClick={() => !disabled && onSelect(option.value)}
            disabled={disabled}
            className={cn(
              'min-h-16 py-2 px-3 rounded-2xl border-2 font-bold transition-all active:scale-95 flex flex-col items-center justify-center',
              stripHint(option.value).length > 12 ? 'text-sm' : 'text-lg',
              selected === option.value
                ? 'border-[#3678FF] bg-blue-100 text-blue-800 scale-[0.97]'
                : OPTION_COLORS[i % OPTION_COLORS.length],
              disabled && 'cursor-not-allowed opacity-70'
            )}
          >
            {/^[A-Da-d]$/.test(option.label.trim()) && (
              <span className="block text-xs font-normal opacity-60 mb-0.5">{option.label.trim().toUpperCase()}</span>
            )}
            <span className="leading-snug text-center">{stripHint(option.value)}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !selected}
        className={cn(
          'w-full h-14 rounded-xl text-lg font-bold text-white transition-all',
          selected && !disabled
            ? 'bg-[#3678FF] hover:bg-[#2557CC] active:scale-98'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        )}
      >
        Check answer ✓
      </button>
    </div>
  )
}
