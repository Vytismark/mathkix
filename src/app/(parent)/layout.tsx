import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ParentShell } from '@/components/parent/ParentShell'
import { TrialBanner } from '@/components/parent/TrialBanner'
import { TrialExpiredModal } from '@/components/parent/TrialExpiredModal'
import { getTrialState } from '@/lib/trial'

export const dynamic = 'force-dynamic'

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const trialState = await getTrialState(user.id)

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen overflow-hidden" style={{ background: '#07080f' }}>
      {/* Ambient brand glow - top center */}
      <div className="pointer-events-none absolute top-[-15%] left-1/2 -translate-x-1/2 w-[400px] md:w-[900px] h-[400px] md:h-[600px]"
        style={{ background: 'radial-gradient(ellipse at center, rgba(192,57,43,0.14) 0%, transparent 65%)' }} />
      {/* Bottom-right warm glow */}
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-[280px] md:w-[500px] h-[280px] md:h-[500px]"
        style={{ background: 'radial-gradient(ellipse at center, rgba(243,156,18,0.08) 0%, transparent 65%)' }} />

      {/* Trial expired - modal hides itself on /billing via usePathname() */}
      {trialState.status === 'expired' && <TrialExpiredModal />}

      <ParentShell>
        {/* Trial warning banners */}
        {(trialState.status === 'warning_7' || trialState.status === 'warning_1') && (
          <TrialBanner
            daysLeft={trialState.daysLeft}
            urgent={trialState.status === 'warning_1'}
          />
        )}
        {children}
      </ParentShell>
    </div>
  )
}
