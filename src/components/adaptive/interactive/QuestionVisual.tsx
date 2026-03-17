'use client'

import { ClockFace } from './ClockFace'
import { CoinDisplay, type Coin } from './CoinDisplay'
import { ArrayGrid } from './ArrayGrid'
import { FractionBarVisual } from './FractionBarVisual'
import { NumberLineInput } from './NumberLineInput'
import { ShapeDisplay } from './ShapeDisplay'
import { BarGraph } from './BarGraph'
import { PlaceValueChart } from './PlaceValueChart'
import { TallyMarks } from './TallyMarks'

interface QuestionVisualProps {
  visualAsset?: string | null | undefined
  questionText?: string
}

/**
 * Renders a visual component from an explicit visual_asset JSON string.
 * Returns null if no visual_asset is provided - no auto-detection.
 */
export function QuestionVisual({ visualAsset }: QuestionVisualProps) {
  if (!visualAsset) return null

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(visualAsset)
  } catch {
    return null
  }

  const type = parsed.type as string | undefined
  if (!type) return null

  switch (type) {
    case 'clock':
      return (
        <ClockFace
          hour={Number(parsed.hour) || 0}
          minute={Number(parsed.minute) || 0}
          showNumbers={parsed.showNumbers !== false}
          className="my-3"
        />
      )

    case 'fraction_bar':
      return (
        <FractionBarVisual
          numerator={Number(parsed.numerator) || 0}
          denominator={Number(parsed.denominator) || 1}
          interactive={false}
          className="my-3"
        />
      )

    case 'number_line':
      return (
        <NumberLineInput
          min={Number(parsed.min) ?? 0}
          max={Number(parsed.max) ?? 1}
          step={parsed.step != null ? Number(parsed.step) : undefined}
          value={parsed.value != null ? Number(parsed.value) : null}
          onChange={() => {}}
          disabled
          className="my-3"
        />
      )

    case 'coin_display':
      return (
        <CoinDisplay
          coins={(parsed.coins as Coin[]) ?? []}
          className="my-3"
        />
      )

    case 'array_grid':
      return (
        <ArrayGrid
          rows={Number(parsed.rows) || 1}
          cols={Number(parsed.cols) || 1}
          emoji={typeof parsed.emoji === 'string' ? parsed.emoji : undefined}
          className="my-3"
        />
      )

    case 'shape_display':
      return (
        <ShapeDisplay
          shape={(parsed.shape as string) ?? 'square'}
          fill={typeof parsed.fill === 'string' ? parsed.fill : undefined}
          showLabel={parsed.showLabel === true}
          className="my-3"
        />
      )

    case 'bar_graph':
      return (
        <BarGraph
          bars={(parsed.bars as Array<{ label: string; value: number; color?: string }>) ?? []}
          title={typeof parsed.title === 'string' ? parsed.title : undefined}
          className="my-3"
        />
      )

    case 'place_value_chart':
      return (
        <PlaceValueChart
          hundreds={Number(parsed.hundreds) || 0}
          tens={Number(parsed.tens) || 0}
          ones={Number(parsed.ones) || 0}
          className="my-3"
        />
      )

    case 'tally_marks':
      return (
        <TallyMarks
          count={Number(parsed.count) || 0}
          className="my-3"
        />
      )

    default:
      return null
  }
}
