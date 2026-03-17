'use client'

interface PlaceValueChartProps {
  hundreds?: number
  tens?: number
  ones?: number
  showLabels?: boolean
  className?: string
}

/**
 * Base-10 block visualization for place value questions.
 * Shows hundreds (large squares), tens (long rods), ones (small unit squares).
 */
export function PlaceValueChart({
  hundreds = 0,
  tens = 0,
  ones = 0,
  showLabels = true,
  className = '',
}: PlaceValueChartProps) {
  const h = Math.min(hundreds, 9)
  const t = Math.min(tens, 9)
  const o = Math.min(ones, 9)

  return (
    <div className={`flex justify-center gap-6 ${className}`}>
      {/* Hundreds column */}
      {h > 0 && (
        <div className="flex flex-col items-center gap-1">
          {showLabels && <span className="text-[10px] font-bold text-gray-500 uppercase">Hundreds</span>}
          <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: '80px' }}>
            {Array.from({ length: h }).map((_, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-sm bg-indigo-400 border border-indigo-500"
                style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '3.5px 3.5px' }}
                aria-label="100 block"
              />
            ))}
          </div>
        </div>
      )}

      {/* Tens column */}
      {(t > 0 || h > 0) && (
        <div className="flex flex-col items-center gap-1">
          {showLabels && <span className="text-[10px] font-bold text-gray-500 uppercase">Tens</span>}
          <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: '60px' }}>
            {Array.from({ length: t }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-7 rounded-sm bg-sky-400 border border-sky-500"
                aria-label="10 rod"
              />
            ))}
          </div>
        </div>
      )}

      {/* Ones column */}
      <div className="flex flex-col items-center gap-1">
        {showLabels && <span className="text-[10px] font-bold text-gray-500 uppercase">Ones</span>}
        <div className="flex flex-wrap gap-0.5 justify-center" style={{ maxWidth: '40px' }}>
          {Array.from({ length: o }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-sm bg-amber-400 border border-amber-500"
              aria-label="1 unit"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
