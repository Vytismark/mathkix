'use client'

interface SRReviewBadgeProps {
  dueCount: number
  onClick: () => void
}

export function SRReviewBadge({ dueCount, onClick }: SRReviewBadgeProps) {
  if (dueCount === 0) return null

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors"
      title="You have reviews due to keep your memory sharp!"
    >
      <span className="text-base">🧠</span>
      <span>
        {dueCount} review{dueCount !== 1 ? 's' : ''} due
      </span>
    </button>
  )
}
