'use client'

interface ArrayGridProps {
  rows: number
  cols: number
  emoji?: string
  className?: string
}

/**
 * Rows × cols dot grid for visualising multiplication arrays.
 * Capped at 10×10 to prevent overflow.
 */
export function ArrayGrid({ rows, cols, emoji, className = '' }: ArrayGridProps) {
  const r = Math.min(rows, 10)
  const c = Math.min(cols, 10)

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="inline-grid gap-2"
        style={{ gridTemplateColumns: `repeat(${c}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: r * c }).map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 flex items-center justify-center"
          >
            {emoji ? (
              <span className="text-lg leading-none">{emoji}</span>
            ) : (
              <div className="w-4 h-4 rounded-full bg-indigo-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
