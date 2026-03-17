import { Progress } from '@/components/ui/progress'

interface QuizProgressProps {
  current: number
  total: number
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full max-w-sm mx-auto mb-6">
      <div className="flex justify-between text-sm text-muted-foreground mb-1">
        <span>Question {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <Progress value={pct} className="h-3 rounded-full" />
    </div>
  )
}
