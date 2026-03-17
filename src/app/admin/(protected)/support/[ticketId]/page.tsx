'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Bot, User, Shield, AlertTriangle, Mail, Baby, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Message {
  id: string
  sender_type: 'user' | 'ai' | 'admin'
  content: string
  created_at: string
}

interface Ticket {
  id: string
  subject: string
  description: string
  status: 'open' | 'awaiting_human' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  escalated: boolean
  escalation_reason: string | null
  profile_id: string
  created_at: string
  updated_at: string
  profiles: { full_name: string | null; email: string } | null
}

interface ParentContext {
  childCount: number
  planType: string
  subscriptionStatus: string
}

const STATUS_OPTIONS = ['open', 'awaiting_human', 'resolved', 'closed'] as const
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'] as const

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400',
  awaiting_human: 'bg-amber-500/20 text-amber-400',
  resolved: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-slate-500/20 text-slate-400',
}

export default function AdminTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [parentContext, setParentContext] = useState<ParentContext | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  async function fetchTicket() {
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`)
      if (!res.ok) return
      const data = await res.json()
      setTicket(data.ticket)
      setMessages(data.messages)
      setParentContext(data.parentContext)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTicket()
    const interval = setInterval(fetchTicket, 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply.trim() }),
      })
      if (!res.ok) {
        toast.error('Failed to send reply')
        return
      }
      const data = await res.json()
      setMessages(data.messages)
      setReply('')
      fetchTicket()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSending(false)
    }
  }

  async function handleUpdateTicket(field: 'status' | 'priority', value: string) {
    const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    if (res.ok) {
      const data = await res.json()
      setTicket((prev) => (prev ? { ...prev, ...data.ticket } : prev))
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`)
    } else {
      toast.error('Failed to update')
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl animate-pulse">
        <div className="h-6 bg-white/5 rounded w-48 mb-4" />
        <div className="h-4 bg-white/5 rounded w-32 mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Ticket not found</p>
        <Link href="/admin/support" className="text-indigo-400 text-sm">Back</Link>
      </div>
    )
  }

  const profile = ticket.profiles as { full_name: string | null; email: string } | null

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        All tickets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main conversation */}
        <div className="flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
          <div className="mb-4 shrink-0">
            <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
            {ticket.escalated && ticket.escalation_reason && (
              <div
                className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl text-xs"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-amber-300">Escalation reason: {ticket.escalation_reason}</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
            {messages.map((msg) => {
              const isUser = msg.sender_type === 'user'
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%]">
                    {!isUser && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {msg.sender_type === 'ai' ? (
                          <>
                            <Bot className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs text-indigo-400 font-medium">AI Assistant</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">You (Admin)</span>
                          </>
                        )}
                      </div>
                    )}
                    {isUser && (
                      <div className="flex items-center gap-1.5 mb-1.5 justify-end">
                        <span className="text-xs text-slate-500 font-medium">
                          {profile?.full_name ?? 'Parent'}
                        </span>
                        <User className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-slate-700/50 text-slate-200 border border-white/10'
                          : msg.sender_type === 'ai'
                            ? 'bg-indigo-500/10 text-slate-200 border border-indigo-500/20'
                            : 'bg-emerald-500/10 text-slate-200 border border-emerald-500/20'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <p className={`text-[10px] text-slate-600 mt-1 ${isUser ? 'text-right' : ''}`}>
                      {new Date(msg.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Admin reply */}
          <form onSubmit={handleSendReply} className="shrink-0 pt-4 border-t border-white/[0.07]">
            <div className="flex gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-600 resize-none min-h-[80px]"
                placeholder="Type your admin reply..."
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="px-4 self-end py-3 rounded-xl text-white disabled:opacity-40 transition-opacity bg-emerald-600 hover:bg-emerald-500 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div
            className="rounded-xl border border-white/10 p-4"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
              Status
            </label>
            <select
              value={ticket.status}
              onChange={(e) => handleUpdateTicket('status', e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-gray-900">
                  {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div
            className="rounded-xl border border-white/10 p-4"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
              Priority
            </label>
            <select
              value={ticket.priority}
              onChange={(e) => handleUpdateTicket('priority', e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p} className="bg-gray-900">
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Parent info */}
          <div
            className="rounded-xl border border-white/10 p-4"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 block">
              Parent Info
            </label>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300">{profile?.full_name ?? 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300 text-xs break-all">{profile?.email ?? 'N/A'}</span>
              </div>
              {parentContext && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300 capitalize">{parentContext.planType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Baby className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300">{parentContext.childCount} child(ren)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Ticket meta */}
          <div
            className="rounded-xl border border-white/10 p-4 text-xs text-slate-600"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <p>Created: {new Date(ticket.created_at).toLocaleString()}</p>
            <p className="mt-1">Updated: {new Date(ticket.updated_at).toLocaleString()}</p>
            <p className="mt-1">ID: {ticket.id.slice(0, 8)}...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
