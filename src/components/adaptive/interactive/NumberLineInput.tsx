'use client'

import { useRef, useState, useCallback } from 'react'

interface NumberLineInputProps {
  min:       number
  max:       number
  step?:     number
  value:     number | null
  onChange:  (value: number) => void
  label?:    string
  disabled?: boolean
  className?: string
}

/**
 * Interactive number line with a draggable/tappable marker.
 * The child drags or taps on the line to select a value.
 *
 * Content-agnostic shell: questions using this will be added with content.
 */
export function NumberLineInput({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}: NumberLineInputProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const steps = Math.round((max - min) / step) + 1
  const tickValues = Array.from({ length: steps }, (_, i) => min + i * step)

  const positionFromValue = (v: number): number => {
    return ((v - min) / (max - min)) * 100
  }

  const valueFromPosition = useCallback(
    (clientX: number): number => {
      const track = trackRef.current
      if (!track) return min
      const rect = track.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + ratio * (max - min)
      // Snap to step
      const snapped = Math.round(rawValue / step) * step
      return Math.max(min, Math.min(max, snapped))
    },
    [min, max, step]
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    onChange(valueFromPosition(e.clientX))
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return
    onChange(valueFromPosition(e.clientX))
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  return (
    <div className={`flex flex-col gap-3 select-none ${className}`}>
      {label && <p className="text-sm font-medium text-gray-700 text-center">{label}</p>}

      {/* Track */}
      <div className="px-4">
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`relative h-6 flex items-center ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          {/* Line */}
          <div className="absolute left-0 right-0 h-1.5 bg-gray-200 rounded-full" />

          {/* Filled portion */}
          {value !== null && (
            <div
              className="absolute left-0 h-1.5 bg-indigo-500 rounded-full pointer-events-none"
              style={{ width: `${positionFromValue(value)}%` }}
            />
          )}

          {/* Tick marks */}
          {tickValues.map((tick) => (
            <div
              key={tick}
              className="absolute w-0.5 h-2 bg-gray-300 -translate-x-1/2"
              style={{ left: `${positionFromValue(tick)}%` }}
            />
          ))}

          {/* Thumb */}
          {value !== null && (
            <div
              className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-0 pointer-events-none transition-transform ${
                isDragging ? 'scale-125 bg-indigo-700' : 'bg-indigo-500'
              }`}
              style={{ left: `${positionFromValue(value)}%` }}
            />
          )}
        </div>

        {/* Tick labels */}
        <div className="relative mt-1" style={{ height: '16px' }}>
          {tickValues.filter((_, i) => i === 0 || i === tickValues.length - 1 || tickValues.length <= 11).map((tick) => (
            <span
              key={tick}
              className="absolute text-xs text-gray-500 -translate-x-1/2"
              style={{ left: `${positionFromValue(tick)}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
      </div>

      {/* Selected value display */}
      <div className="text-center">
        <span className="text-3xl font-bold text-indigo-600">
          {value !== null ? value : '?'}
        </span>
      </div>
    </div>
  )
}
