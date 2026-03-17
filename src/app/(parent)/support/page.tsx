import Link from 'next/link'
import { Plus, MessageCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-blue-500/20 text-blue-400', icon: MessageCircle },
  awaiting_human: { label: 'In Review', color: 'bg-amber-500/20 text-amber-400', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-slate-500/20 text-slate-400', icon: CheckCircle },
} as const

export default async function SupportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('profile_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-slate-500 text-sm mt-1">Get help with your account</p>
        </div>
        <Link href="/support/new">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
              boxShadow: '0 4px 18px rgba(192,57,43,0.35)',
            }}
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </Link>
      </div>

      {!tickets || tickets.length === 0 ? (
        <div
          className="text-center py-20 rounded-3xl border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="text-5xl mb-4">
            <MessageCircle className="w-12 h-12 mx-auto text-slate-600" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No tickets yet</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            Need help? Create a support ticket and our AI assistant will respond instantly.
          </p>
          <Link href="/support/new">
            <button
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #C0392B, #E74C3C)' }}
            >
              Create your first ticket
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const config = STATUS_CONFIG[ticket.status]
            const Icon = config.icon
            return (
              <Link key={ticket.id} href={`/support/${ticket.id}`}>
                <div
                  className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/5">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{ticket.subject}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(ticket.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {ticket.escalated && (
                        <span className="inline-flex items-center gap-1 ml-2 text-amber-400">
                          <AlertTriangle className="w-3 h-3" />
                          Escalated
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge className={`${config.color} border-0 text-xs`}>
                    {config.label}
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
