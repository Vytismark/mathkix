import { DomainVaultCard } from './DomainVaultCard'
import { StartPracticeButton } from './StartPracticeButton'
import type { Domain } from '@/types/quiz'

interface DomainStandardInfo {
  total: number
  mastered: number
}

interface VaultHubProps {
  childId: string
  domainMastery: Partial<Record<Domain, number>>
  domains: string[]
  domainStandardInfo: Record<string, DomainStandardInfo>
}

export function VaultHub({
  childId,
  domainMastery,
  domains,
  domainStandardInfo,
}: VaultHubProps) {
  const uniqueDomains = [...new Set(domains)]

  if (uniqueDomains.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">📚</p>
        <p className="text-slate-500 text-sm">No lessons available yet.</p>
      </div>
    )
  }

  const totalDiscoveries = uniqueDomains.length
  const unlockedCount = uniqueDomains.filter(
    (d) => (domainMastery[d as Domain] ?? 0) >= 50
  ).length

  return (
    <div className="flex flex-col gap-4">

      {/* ── Section header ─────────────────────────────── */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex-1 h-px bg-slate-200" />
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            Discovery Vault
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {unlockedCount === 0
              ? 'Master skills to unlock secrets'
              : `${unlockedCount} of ${totalDiscoveries} unlocked`}
          </span>
        </div>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* ── Vault progress dots (mini constellation overview) ── */}
      <div className="flex items-center justify-center gap-2">
        {uniqueDomains.map((d) => {
          const pct = domainMastery[d as Domain] ?? 0
          const unlocked = pct >= 50
          return (
            <div
              key={d}
              className="rounded-full transition-all duration-500"
              style={{
                width: unlocked ? 10 : 8,
                height: unlocked ? 10 : 8,
                background: unlocked ? '#3678FF' : '#e2e8f0',
                boxShadow: unlocked ? '0 0 8px rgba(54,120,255,0.5)' : undefined,
              }}
            />
          )
        })}
        <span className="text-[10px] text-slate-400 font-semibold ml-1">
          {unlockedCount}/{totalDiscoveries}
        </span>
      </div>

      {/* ── Domain vault cards ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {uniqueDomains.map((domain) => {
          const masteryPct = domainMastery[domain as Domain] ?? 0
          const info = domainStandardInfo[domain] ?? { total: 0, mastered: 0 }
          return (
            <DomainVaultCard
              key={domain}
              domain={domain}
              masteryPct={masteryPct}
              standardsTotal={info.total}
              standardsMastered={info.mastered}
            />
          )
        })}
      </div>

      {/* ── CTA ────────────────────────────────────────── */}
      <div className="mt-1">
        <StartPracticeButton childId={childId} />
      </div>
    </div>
  )
}
