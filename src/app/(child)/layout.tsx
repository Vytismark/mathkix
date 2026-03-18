import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTrialState } from '@/lib/trial'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function ChildLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const trialState = await getTrialState(user.id)
  if (trialState.status === 'expired') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-blue-50">
      {children}
    </div>
  )
}
