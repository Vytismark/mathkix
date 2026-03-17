'use client'

import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumberPadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫']

export function NumberPad({ value, onChange, onSubmit, disabled }: NumberPadProps) {
  function handleKey(key: string) {
    if (disabled) return
    if (key === '⌫') {
      onChange(value.slice(0, -1))
    } else if (key === '.') {
      if (!value.includes('.')) onChange(value + '.')
    } else {
      if (value.length < 10) onChange(value + key)
    }
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Display */}
      <div className="bg-white border-2 border-border rounded-xl px-4 py-3 text-center text-2xl font-bold mb-3 min-h-[3rem]">
        {value || <span className="text-muted-foreground/40">?</span>}
      </div>

      {/* Keys */}
      <div className="grid grid-cols-3 gap-2">
        {DIGITS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleKey(key)}
            disabled={disabled}
            className={cn(
              'flex items-center justify-center h-14 rounded-xl text-xl font-semibold transition-all active:scale-95',
              key === '⌫'
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
              disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {key === '⌫' ? <Delete className="w-5 h-5" /> : key}
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value}
        className={cn(
          'w-full mt-3 h-14 rounded-xl text-lg font-bold text-white transition-all active:scale-98',
          value && !disabled
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        )}
      >
        Check answer ✓
      </button>
    </div>
  )
}
