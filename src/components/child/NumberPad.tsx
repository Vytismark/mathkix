'use client'

import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumberPadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  allowDecimal?: boolean
}

const DIGITS_NO_DECIMAL = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', '⌫']
const DIGITS_WITH_DECIMAL = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫']

export function NumberPad({ value, onChange, onSubmit, disabled, allowDecimal = false }: NumberPadProps) {
  const DIGITS = allowDecimal ? DIGITS_WITH_DECIMAL : DIGITS_NO_DECIMAL

  function handleKey(key: string) {
    if (disabled || key === '') return
    if (key === '⌫') {
      onChange(value.slice(0, -1))
    } else if (key === '.') {
      if (allowDecimal && !value.includes('.')) onChange(value + '.')
    } else {
      if (value.length < 10) onChange(value + key)
    }
  }

  const fontSize = value.length > 7 ? 'text-lg' : value.length > 5 ? 'text-xl' : 'text-2xl'

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Display */}
      <div className={`bg-white border-2 border-border rounded-xl px-4 py-3 text-center ${fontSize} font-bold mb-3 min-h-[3rem] overflow-hidden`}>
        {value || <span className="text-muted-foreground/40">?</span>}
      </div>

      {/* Keys */}
      <div className="grid grid-cols-3 gap-2">
        {DIGITS.map((key, idx) => (
          key === '' ? (
            <div key={`spacer-${idx}`} className="h-14" />
          ) : (
          <button
            key={`digit-${key}`}
            type="button"
            onClick={() => handleKey(key)}
            disabled={disabled}
            className={cn(
              'flex items-center justify-center h-14 rounded-xl text-xl font-semibold transition-all active:scale-95',
              key === '⌫'
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-blue-50 text-[#3678FF] hover:bg-blue-100',
              disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {key === '⌫' ? <Delete className="w-5 h-5" /> : key}
          </button>
          )
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
            ? 'bg-[#3678FF] hover:bg-[#2557CC]'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        )}
      >
        Check answer ✓
      </button>
    </div>
  )
}
