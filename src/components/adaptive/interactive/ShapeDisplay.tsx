'use client'

interface ShapeDisplayProps {
  shape: string
  size?: number
  fill?: string
  showLabel?: boolean
  className?: string
}

// SVG path data for each shape, all within a 100×100 viewBox centered at 50,50
const SHAPE_PATHS: Record<string, string> = {
  triangle:      'M50 15 L85 80 L15 80 Z',
  square:        'M20 20 H80 V80 H20 Z',
  rectangle:     'M15 25 H85 V75 H15 Z',
  pentagon:      'M50 15 L85 40 L72 80 L28 80 L15 40 Z',
  hexagon:       'M50 15 L82 32 L82 68 L50 85 L18 68 L18 32 Z',
  circle:        '', // handled with <circle> element
  trapezoid:     'M30 25 H70 L85 75 H15 Z',
  rhombus:       'M50 15 L85 50 L50 85 L15 50 Z',
  parallelogram: 'M25 25 H75 L85 75 H35 Z',
}

const DEFAULT_FILLS: Record<string, string> = {
  triangle:      '#a78bfa',
  square:        '#6ee7b7',
  rectangle:     '#7dd3fc',
  pentagon:      '#fcd34d',
  hexagon:       '#f9a8d4',
  circle:        '#fca5a5',
  trapezoid:     '#c4b5fd',
  rhombus:       '#fdba74',
  parallelogram: '#86efac',
  cube:          '#93c5fd',
}

/**
 * SVG shape display for geometry questions.
 * Renders common 2D shapes with optional label.
 */
export function ShapeDisplay({
  shape,
  size = 140,
  fill,
  showLabel = false,
  className = '',
}: ShapeDisplayProps) {
  const lowerShape = shape.toLowerCase()
  const fillColor = fill ?? DEFAULT_FILLS[lowerShape] ?? '#c4b5fd'

  // Special case: cube (isometric 3-face projection)
  if (lowerShape === 'cube') {
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`}>
        <svg width={size} height={size} viewBox="0 0 100 100" aria-label={`A ${shape}`}>
          {/* Top face */}
          <polygon points="50,15 80,30 50,45 20,30" fill={fillColor} stroke="#374151" strokeWidth="1.5" opacity="0.9" />
          {/* Left face */}
          <polygon points="20,30 50,45 50,75 20,60" fill={fillColor} stroke="#374151" strokeWidth="1.5" opacity="0.7" />
          {/* Right face */}
          <polygon points="80,30 50,45 50,75 80,60" fill={fillColor} stroke="#374151" strokeWidth="1.5" opacity="0.55" />
        </svg>
        {showLabel && <span className="text-sm font-semibold text-gray-600 capitalize">{shape}</span>}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" aria-label={`A ${shape}`}>
        {lowerShape === 'circle' ? (
          <circle cx="50" cy="50" r="35" fill={fillColor} stroke="#374151" strokeWidth="1.5" />
        ) : (
          <path
            d={SHAPE_PATHS[lowerShape] ?? SHAPE_PATHS.square}
            fill={fillColor}
            stroke="#374151"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {showLabel && <span className="text-sm font-semibold text-gray-600 capitalize">{shape}</span>}
    </div>
  )
}
