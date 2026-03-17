'use client'

interface FractionBarVisualProps {
  numerator:    number
  denominator:  number
  interactive?: boolean
  onChange?:    (numerator: number) => void
  className?:   string
}

/**
 * Visual fraction bar with optional interactive drag/tap to set numerator.
 * Renders `denominator` equal segments, `numerator` of which are filled.
 *
 * Content-agnostic shell: the math questions that use this component
 * will be added when lesson content is authored.
 */
export function FractionBarVisual({
  numerator,
  denominator,
  interactive = false,
  onChange,
  className = '',
}: FractionBarVisualProps) {
  const safeNum = Math.max(0, Math.min(numerator, denominator))
  const safeDen = Math.max(1, denominator)

  const handleSegmentClick = (segmentIndex: number) => {
    if (!interactive || !onChange) return
    // Clicking a segment sets the numerator to that segment + 1
    onChange(segmentIndex + 1)
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Fraction label */}
      <div className="flex flex-col items-center leading-none select-none">
        <span className="text-2xl font-bold text-gray-800">{safeNum}</span>
        <div className="w-8 h-0.5 bg-gray-800 my-0.5" />
        <span className="text-2xl font-bold text-gray-800">{safeDen}</span>
      </div>

      {/* Bar */}
      <div className="flex rounded-lg overflow-hidden border-2 border-indigo-400 h-10 w-full"
        style={{ maxWidth: `${safeDen * 40}px`, minWidth: '120px' }}>
        {Array.from({ length: safeDen }).map((_, i) => (
          <button
            key={i}
            disabled={!interactive}
            onClick={() => handleSegmentClick(i)}
            className={[
              'flex-1 transition-colors border-r border-indigo-200 last:border-r-0',
              i < safeNum ? 'bg-indigo-500' : 'bg-indigo-50',
              interactive ? 'cursor-pointer hover:opacity-80 active:opacity-70' : 'cursor-default',
            ].join(' ')}
            aria-label={`Segment ${i + 1} of ${safeDen}`}
          />
        ))}
      </div>

      {interactive && (
        <p className="text-xs text-gray-400">Tap a segment to change the fraction</p>
      )}
    </div>
  )
}
