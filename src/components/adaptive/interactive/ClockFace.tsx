'use client'

interface ClockFaceProps {
  hour: number
  minute: number
  showNumbers?: boolean
  size?: number
  className?: string
}

/**
 * SVG analog clock face with configurable hour and minute hands.
 * Read-only display used as a visual aid for time-telling questions.
 */
export function ClockFace({
  hour,
  minute,
  showNumbers = true,
  size = 180,
  className = '',
}: ClockFaceProps) {
  const cx = 50
  const cy = 50
  const radius = 45

  // Hand angles (0° = 12 o'clock, clockwise)
  const minuteAngle = minute * 6
  const hourAngle = (hour % 12) * 30 + minute * 0.5

  return (
    <div className={`flex justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        aria-label={`Clock showing ${hour % 12 || 12}:${minute.toString().padStart(2, '0')}`}
      >
        {/* Clock face */}
        <circle cx={cx} cy={cy} r={radius} fill="white" stroke="#d1d5db" strokeWidth="2" />

        {/* Tick marks + numbers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180)
          const isMajor = true // all 12 positions are major ticks
          const innerR = isMajor ? radius - 5 : radius - 3
          const x1 = cx + innerR * Math.cos(angle)
          const y1 = cy + innerR * Math.sin(angle)
          const x2 = cx + (radius - 1) * Math.cos(angle)
          const y2 = cy + (radius - 1) * Math.sin(angle)
          const numR = radius - 11
          const nx = cx + numR * Math.cos(angle)
          const ny = cy + numR * Math.sin(angle)
          const num = i === 0 ? 12 : i

          return (
            <g key={i}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#6b7280" strokeWidth={isMajor ? 1.5 : 0.8}
              />
              {showNumbers && (
                <text
                  x={nx} y={ny}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="8"
                  fontWeight="600"
                  fill="#374151"
                >
                  {num}
                </text>
              )}
            </g>
          )
        })}

        {/* Minor tick marks (every 5 minutes between hours) */}
        {Array.from({ length: 60 }).map((_, i) => {
          if (i % 5 === 0) return null // skip hour positions
          const angle = (i * 6 - 90) * (Math.PI / 180)
          const x1 = cx + (radius - 2) * Math.cos(angle)
          const y1 = cy + (radius - 2) * Math.sin(angle)
          const x2 = cx + (radius - 1) * Math.cos(angle)
          const y2 = cy + (radius - 1) * Math.sin(angle)
          return (
            <line key={`m${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d1d5db" strokeWidth="0.5" />
          )
        })}

        {/* Hour hand (shorter, thicker) */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + 22 * Math.sin(hourAngle * Math.PI / 180)}
          y2={cy - 22 * Math.cos(hourAngle * Math.PI / 180)}
          stroke="#1f2937"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Minute hand (longer, thinner) */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + 32 * Math.sin(minuteAngle * Math.PI / 180)}
          y2={cy - 32 * Math.cos(minuteAngle * Math.PI / 180)}
          stroke="#4f46e5"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="2" fill="#1f2937" />
      </svg>
    </div>
  )
}
