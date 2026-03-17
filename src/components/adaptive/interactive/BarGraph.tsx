'use client'

interface Bar {
  label: string
  value: number
  color?: string
}

interface BarGraphProps {
  bars: Bar[]
  title?: string
  maxValue?: number
  className?: string
}

const PALETTE = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#0ea5e9', '#f97316', '#ec4899']

/**
 * SVG vertical bar chart for data/measurement questions.
 * Renders labeled bars with value labels above each bar.
 */
export function BarGraph({ bars, title, maxValue, className = '' }: BarGraphProps) {
  if (bars.length === 0) return null

  const max = maxValue ?? Math.max(...bars.map(b => b.value), 1)
  const barCount = bars.length
  const chartLeft = 30
  const chartRight = 10
  const chartTop = title ? 20 : 10
  const chartBottom = 30
  const chartWidth = 200 - chartLeft - chartRight
  const chartHeight = 130 - chartTop - chartBottom
  const barWidth = Math.min(30, chartWidth / barCount - 4)
  const gap = (chartWidth - barWidth * barCount) / (barCount + 1)

  return (
    <div className={`flex justify-center ${className}`}>
      <svg width="200" height="130" viewBox="0 0 200 130" aria-label={title ?? 'Bar chart'}>
        {/* Title */}
        {title && (
          <text x="100" y="12" textAnchor="middle" fontSize="9" fontWeight="600" fill="#374151">{title}</text>
        )}

        {/* Y-axis */}
        <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartTop + chartHeight} stroke="#d1d5db" strokeWidth="1" />
        {/* X-axis */}
        <line x1={chartLeft} y1={chartTop + chartHeight} x2={chartLeft + chartWidth} y2={chartTop + chartHeight} stroke="#d1d5db" strokeWidth="1" />

        {/* Y-axis labels */}
        {[0, Math.ceil(max / 2), max].map(v => {
          const y = chartTop + chartHeight - (v / max) * chartHeight
          return (
            <g key={v}>
              <line x1={chartLeft - 3} y1={y} x2={chartLeft} y2={y} stroke="#9ca3af" strokeWidth="0.5" />
              <text x={chartLeft - 5} y={y + 3} textAnchor="end" fontSize="7" fill="#9ca3af">{v}</text>
            </g>
          )
        })}

        {/* Bars */}
        {bars.map((bar, i) => {
          const barHeight = (bar.value / max) * chartHeight
          const x = chartLeft + gap + i * (barWidth + gap)
          const y = chartTop + chartHeight - barHeight
          const color = bar.color ?? PALETTE[i % PALETTE.length]

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="2"
              />
              {/* Value label */}
              <text
                x={x + barWidth / 2}
                y={y - 3}
                textAnchor="middle"
                fontSize="7"
                fontWeight="600"
                fill="#374151"
              >
                {bar.value}
              </text>
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={chartTop + chartHeight + 10}
                textAnchor="middle"
                fontSize="7"
                fill="#6b7280"
              >
                {bar.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
