'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Ticket {
  id: string
  subject: string
  status: string
  priority: string
  escalated: boolean
  created_at: string
  updated_at: string
  profiles: { full_name: string | null; email: string } | null
}

interface Counts {
  open: number
  awaiting_human: number
  resolved: number
  closed: number
  total: number
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof MessageCircle }> = {
  open: { label: 'Open', color: 'bg-blue-500/20 text-blue-400', icon: MessageCircle },
  awaiting_human: { label: 'Awaiting', color: 'bg-amber-500/20 text-amber-400', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-slate-500/20 text-slate-400', icon: CheckCircle },
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [counts, setCounts] = useState<Counts>({ open: 0, awaiting_human: 0, resolved: 0, closed: 0, total: 0 })
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = filter === 'all' ? '' : `?status=${filter}`
    fetch(`/api/admin/support/tickets${params}`)
      .then((res) => res.json())
      .then((data) => {
        setTickets(data.tickets ?? [])
        setCounts(data.counts ?? counts)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Open', value: counts.open, color: '#3b82f6' },
          { label: 'Awaiting Human', value: counts.awaiting_human, color: '#f59e0b' },
          { label: 'Resolved', value: counts.resolved, color: '#10b981' },
          { label: 'Total', value: counts.total, color: '#8b5cf6' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-3 rounded-xl border border-white/10 text-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-white/10">All</TabsTrigger>
          <TabsTrigger value="open" className="text-xs data-[state=active]:bg-white/10">Open</TabsTrigger>
          <TabsTrigger value="awaiting_human" className="text-xs data-[state=active]:bg-white/10">Awaiting</TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs data-[state=active]:bg-white/10">Resolved</TabsTrigger>
          <TabsTrigger value="closed" className="text-xs data-[state=active]:bg-white/10">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Ticket list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">
            {filter === 'all' ? 'No tickets yet' : `No ${filter.replace('_', ' ')} tickets`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => {
            const statusCfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.open
            return (
              <Link key={t.id} href={`/admin/support/${t.id}`}>
                <div
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-white font-medium truncate">{t.subject}</p>
                      {t.escalated && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {t.profiles?.full_name ?? 'Unknown'} ({t.profiles?.email ?? ''}) &middot;{' '}
                      {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge className={`${PRIORITY_COLORS[t.priority] ?? ''} border-0 text-[10px]`}>
                    {t.priority}
                  </Badge>
                  <Badge className={`${statusCfg.color} border-0 text-[10px]`}>
                    {statusCfg.label}
                  </Badge>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
