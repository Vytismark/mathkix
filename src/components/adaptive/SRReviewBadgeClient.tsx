'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SRReviewBadge } from './SRReviewBadge'

interface SRReviewBadgeClientProps {
  dueCount: number
  childId:  string
}

/**
 * Client wrapper for SRReviewBadge that handles navigation.
 * Used in server component pages that need an interactive SR badge.
 */
export function SRReviewBadgeClient({ dueCount, childId }: SRReviewBadgeClientProps) {
  const router = useRouter()

  const handleClick = () => {
    // Navigate to a dedicated SR session page (or the home page with SR mode flag)
    router.push(`/play/home?child=${childId}&mode=review`)
  }

  return <SRReviewBadge dueCount={dueCount} onClick={handleClick} />
}
