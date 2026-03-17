'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Baby,
  MessageCircle,
  AlertTriangle,
  CreditCard,
  Crown,
  Clock,
  UserX,
  Cpu,
  MemoryStick,
  Server,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ServerInfo {
  platform: string
  hostname: string
  cpuCount: number
  cpuModel: string
  memoryUsedGB: number
  memoryTotalGB: number
  memoryPct: number
  loadAvg1m: number
  loadAvg5m: number
  loadAvg15m: number
  uptimeHours: number
  nodeVersion: string
}

interface Stats {
  totalUsers: number
  totalChildren: number
  openTickets: number
  awaitingTickets: number
  paidUsers: number
  trialUsers: number
  otherUsers: number
  recentTickets: Array<{
    id: string
    subject: string
    status: string
    priority: string
    created_at: string
    profiles: { full_name: string | null } | null
  }>
  server: ServerInfo
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400',
  awaiting_human: 'bg-amber-500/20 text-amber-400',
  resolved: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-slate-500/20 text-slate-400',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  awaiting_human: 'Awaiting',
  resolved: 'Resolved',
  closed: 'Closed',
}

function formatUptime(hours: number) {
  if (hours < 24) return `${hours.toFixed(1)}h`
  const days = Math.floor(hours / 24)
  const remaining = (hours % 24).toFixed(0)
  return `${days}d ${remaining}h`
}

function MemoryBar({ pct }: { pct: number }) {
  const color = pct > 85 ? 'bg-red-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const userCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: '#7c3aed', glow: 'rgba(124,58,237,0.3)' },
    { icon: Crown, label: 'Paid Users', value: stats.paidUsers, color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
    { icon: Clock, label: 'Free Trial', value: stats.trialUsers, color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
    { icon: UserX, label: 'Inactive / Other', value: stats.otherUsers, color: '#6b7280', glow: 'rgba(107,114,128,0.3)' },
  ]

  const activityCards = [
    { icon: Baby, label: 'Total Children', value: stats.totalChildren, color: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
    { icon: MessageCircle, label: 'Open Tickets', value: stats.openTickets, color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
    { icon: AlertTriangle, label: 'Needs Attention', value: stats.awaitingTickets, color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
  ]

  const sv = stats.server

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* User Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {userCards.map(({ icon: Icon, label, value, color, glow }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 rounded-2xl border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}22`, boxShadow: `0 0 14px ${glow}` }}
            >
              <Icon className="w-[18px] h-[18px]" style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-white leading-tight">{value}</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {activityCards.map(({ icon: Icon, label, value, color, glow }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 rounded-2xl border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}22`, boxShadow: `0 0 14px ${glow}` }}
            >
              <Icon className="w-[18px] h-[18px]" style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-white leading-tight">{value}</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div
          className="rounded-2xl border border-white/10 p-5"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Tickets</h2>
            <Link href="/admin/support" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all
            </Link>
          </div>
          {stats.recentTickets.length === 0 ? (
            <p className="text-slate-600 text-sm py-6 text-center">No tickets yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recentTickets.map((t) => (
                <Link key={t.id} href={`/admin/support/${t.id}`}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{t.subject}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {t.profiles?.full_name ?? 'Unknown'} &middot;{' '}
                        {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <Badge className={`${STATUS_COLORS[t.status] ?? ''} border-0 text-[10px]`}>
                      {STATUS_LABELS[t.status] ?? t.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Server Info */}
        <div
          className="rounded-2xl border border-white/10 p-5"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Server</h2>
            <span className="text-[10px] text-slate-600 font-mono">{sv.nodeVersion}</span>
          </div>

          <div className="space-y-4">
            {/* Hostname & Platform */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <Server className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">{sv.hostname}</p>
                <p className="text-[11px] text-slate-500">{sv.platform} &middot; up {formatUptime(sv.uptimeHours)}</p>
              </div>
            </div>

            {/* Memory */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MemoryStick className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">Memory</span>
                <span className="ml-auto text-xs text-white font-mono">
                  {sv.memoryUsedGB} / {sv.memoryTotalGB} GB
                </span>
                <span className="text-[10px] text-slate-500">({sv.memoryPct}%)</span>
              </div>
              <MemoryBar pct={sv.memoryPct} />
            </div>

            {/* CPU */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">CPU</span>
                <span className="ml-auto text-[11px] text-slate-500">{sv.cpuCount} cores</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate pl-5.5">{sv.cpuModel}</p>
            </div>

            {/* Load Average */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">Load Average</span>
              </div>
              <div className="flex gap-4 pl-5.5">
                {[
                  { label: '1m', value: sv.loadAvg1m },
                  { label: '5m', value: sv.loadAvg5m },
                  { label: '15m', value: sv.loadAvg15m },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-sm font-mono text-white">{value}</p>
                    <p className="text-[10px] text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
