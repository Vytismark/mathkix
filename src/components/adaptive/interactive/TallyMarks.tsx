'use client'

interface TallyMarksProps {
  count: number
  className?: string
}

/**
 * SVG tally marks - groups of 5 (4 vertical + 1 diagonal), remainder as verticals.
 * Capped at 50 to prevent overflow.
 */
export function TallyMarks({ count, className = '' }: TallyMarksProps) {
  const n = Math.min(Math.max(0, count), 50)
  const groups = Math.floor(n / 5)
  const remainder = n % 5

  const groupWidth = 28
  const markSpacing = 5
  const totalGroups = groups + (remainder > 0 ? 1 : 0)
  const svgWidth = Math.max(60, totalGroups * (groupWidth + 8))

  return (
    <div className={`flex justify-center ${className}`}>
      <svg
        width={Math.min(svgWidth, 280)}
        height="44"
        viewBox={`0 0 ${Math.min(svgWidth, 280)} 44`}
        aria-label={`${n} tally marks`}
      >
        {/* Complete groups of 5 */}
        {Array.from({ length: groups }).map((_, g) => {
          const gx = g * (groupWidth + 8) + 4
          return (
            <g key={`g${g}`}>
              {/* 4 vertical marks */}
              {Array.from({ length: 4 }).map((_, i) => (
                <line
                  key={i}
                  x1={gx + i * markSpacing}
                  y1={6}
                  x2={gx + i * markSpacing}
                  y2={38}
                  stroke="#374151"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ))}
              {/* Diagonal strike-through */}
              <line
                x1={gx - 2}
                y1={34}
                x2={gx + 3 * markSpacing + 2}
                y2={10}
                stroke="#374151"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          )
        })}

        {/* Remaining marks */}
        {Array.from({ length: remainder }).map((_, i) => {
          const rx = groups * (groupWidth + 8) + 4 + i * markSpacing
          return (
            <line
              key={`r${i}`}
              x1={rx}
              y1={6}
              x2={rx}
              y2={38}
              stroke="#374151"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )
        })}
      </svg>
    </div>
  )
}
