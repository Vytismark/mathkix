import { redirect } from 'next/navigation'
import { verifyReviewer } from '@/lib/review/auth'
import { ReviewPortal } from '@/components/review/ReviewPortal'

export const dynamic = 'force-dynamic'

export default async function ReviewPage() {
  const user = await verifyReviewer()
  if (!user) redirect('/review/login')
  return <ReviewPortal userEmail={user.email ?? ''} />
}
