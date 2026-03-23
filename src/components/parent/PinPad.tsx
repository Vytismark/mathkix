'use client'

import { useState, useEffect, useCallback } from 'react'
import { Delete } from 'lucide-react'

interface PinPadProps {
  /** 'verify' = gate overlay, 'setup' = account settings */
  mode: 'verify' | 'setup'
  /** Called when all 4 digits are entered. Return true = success, false = wrong PIN (triggers shake). */
  onComplete: (pin: string) => Promise<boolean>
  title?: string
  subtitle?: string
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export function PinPad({ onComplete, title, subtitle }: PinPadProps) {
  const [digits, setDigits] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [isPressed, setIsPressed] = useState<string | null>(null)

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (digits.length !== 4 || status !== 'idle') return
    const t = setTimeout(async () => {
      setStatus('loading')
      const ok = await onComplete(digits)
      if (!ok) {
        setStatus('error')
        setTimeout(() => {
          setDigits('')
          setStatus('idle')
        }, 700)
      }
      // On success: parent handles the next step
    }, 120)
    return () => clearTimeout(t)
  }, [digits, status, onComplete])

  const handleKey = useCallback((key: string) => {
    if (status === 'loading' || status === 'error' || key === '') return
    if (key === '⌫') {
      setDigits(d => d.slice(0, -1))
    } else if (digits.length < 4) {
      setDigits(d => d + key)
    }
  }, [digits.length, status])

  // Keyboard support
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key >= '0' && e.key <= '9') handleKey(e.key)
      else if (e.key === 'Backspace') handleKey('⌫')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey])

  const isDisabled = status === 'loading' || status === 'error'

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[280px]">
      {/* Title */}
      {(title || subtitle) && (
        <div className="text-center">
          {title && <p className="text-white font-semibold text-lg">{title}</p>}
          {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
        </div>
      )}

      {/* Dot indicators */}
      <div
        className={`flex items-center gap-4 ${status === 'error' ? 'animate-pin-shake' : ''}`}
      >
        {[0, 1, 2, 3].map((i) => {
          const filled = i < digits.length
          const isError = status === 'error'
          return (
            <span
              key={`${i}-${digits.length}`} // re-key to retrigger animation on each fill
              className={filled ? (isError ? 'pin-dot--filled pin-dot--error' : 'pin-dot--filled') : ''}
              style={{
                display: 'block',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: filled
                  ? (isError ? '#f87171' : '#3678FF')
                  : 'transparent',
                border: filled
                  ? 'none'
                  : '2px solid rgba(255,255,255,0.2)',
                boxShadow: filled && !isError
                  ? '0 0 10px rgba(54,120,255,0.6)'
                  : undefined,
                transition: 'border-color 0.15s ease',
              }}
            />
          )
        })}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {KEYS.map((key, idx) => {
          if (key === '') {
            return <div key={`spacer-${idx}`} />
          }

          const pressed = isPressed === key && !isDisabled
          const isBackspace = key === '⌫'

          return (
            <button
              key={key}
              type="button"
              disabled={isDisabled}
              className="pin-key relative flex items-center justify-center h-16 rounded-2xl text-xl font-semibold select-none disabled:opacity-40"
              style={{
                background: isBackspace
                  ? (pressed ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.08)')
                  : (pressed ? 'rgba(54,120,255,0.18)' : 'rgba(255,255,255,0.07)'),
                border: `1px solid ${isBackspace
                  ? (pressed ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.2)')
                  : (pressed ? 'rgba(54,120,255,0.4)' : 'rgba(255,255,255,0.12)')}`,
                boxShadow: pressed
                  ? '0 1px 4px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)'
                  : '0 4px 14px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                transform: pressed
                  ? 'perspective(400px) rotateX(10deg) translateY(3px) scale(0.95)'
                  : 'perspective(400px) rotateX(0deg) translateY(0) scale(1)',
                color: isBackspace ? '#f87171' : 'white',
                transition: 'transform 0.08s ease, box-shadow 0.08s ease, background 0.1s ease, border-color 0.1s ease',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
              onPointerDown={() => { if (!isDisabled) setIsPressed(key) }}
              onPointerUp={() => { setIsPressed(null); handleKey(key) }}
              onPointerLeave={() => setIsPressed(null)}
            >
              {/* Inner highlight for depth */}
              <span
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
                }}
              />
              {key === '⌫' ? <Delete className="w-5 h-5 relative z-10" /> : <span className="relative z-10">{key}</span>}
            </button>
          )
        })}
      </div>

      {/* Loading indicator */}
      {status === 'loading' && (
        <p className="text-slate-500 text-xs animate-pulse">Checking…</p>
      )}
    </div>
  )
}
