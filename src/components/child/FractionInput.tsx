'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FractionInputProps {
  value: string           // "3/4"
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function FractionInput({ value, onChange, onSubmit, disabled }: FractionInputProps) {
  const [activeField, setActiveField] = useState<'num' | 'den'>('num')

  const parts = value.split('/')
  const numerator = parts[0] ?? ''
  const denominator = parts[1] ?? ''

  function handleKey(key: string) {
    if (disabled) return
    const current = activeField === 'num' ? numerator : denominator

    let updated: string
    if (key === '⌫') {
      updated = current.slice(0, -1)
    } else {
      if (current.length >= 4) return
      updated = current + key
    }

    const newNum = activeField === 'num' ? updated : numerator
    const newDen = activeField === 'den' ? updated : denominator
    onChange(`${newNum}/${newDen}`)
  }

  const isValid = numerator !== '' && denominator !== '' && denominator !== '0'

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Fraction display */}
      <div className="flex flex-col items-center mb-4">
        <button
          type="button"
          onClick={() => setActiveField('num')}
          className={cn(
            'w-24 h-14 text-3xl font-bold rounded-xl border-2 transition-all',
            activeField === 'num'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-border bg-white'
          )}
        >
          {numerator || <span className="text-muted-foreground/40">?</span>}
        </button>
        <div className="w-24 h-0.5 bg-foreground my-1" />
        <button
          type="button"
          onClick={() => setActiveField('den')}
          className={cn(
            'w-24 h-14 text-3xl font-bold rounded-xl border-2 transition-all',
            activeField === 'den'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-border bg-white'
          )}
        >
          {denominator || <span className="text-muted-foreground/40">?</span>}
        </button>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2">
        {['7','8','9','4','5','6','1','2','3','','0','⌫'].map((key, i) => (
          key === '' ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => handleKey(key)}
              disabled={disabled}
              className={cn(
                'flex items-center justify-center h-12 rounded-xl text-xl font-semibold transition-all active:scale-95',
                key === '⌫'
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
                disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              {key}
            </button>
          )
        ))}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !isValid}
        className={cn(
          'w-full mt-3 h-14 rounded-xl text-lg font-bold text-white transition-all',
          isValid && !disabled
            ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-98'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        )}
      >
        Check answer ✓
      </button>
    </div>
  )
}
