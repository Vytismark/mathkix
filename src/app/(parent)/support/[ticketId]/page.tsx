'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Bot, User, Shield, AlertTriangle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Message {
  id: string
  ticket_id: string
  sender_type: 'user' | 'ai' | 'admin'
  content: string
  created_at: string
}

interface Ticket {
  id: string
  subject: string
  status: 'open' | 'awaiting_human' | 'resolved' | 'closed'
  priority: string
  escalated: boolean
  escalation_reason: string | null
  created_at: string
  updated_at: string
}

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-blue-500/20 text-blue-400' },
  awaiting_human: { label: 'In Review', color: 'bg-amber-500/20 text-amber-400' },
  resolved: { label: 'Resolved', color: 'bg-emerald-500/20 text-emerald-400' },
  closed: { label: 'Closed', color: 'bg-slate-500/20 text-slate-400' },
} as const

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  async function fetchTicket() {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`)
      if (!res.ok) return
      const data = await res.json()
      setTicket(data.ticket)
      setMessages(data.messages)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTicket()
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchTicket, 30000)
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
      const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to send message')
        return
      }

      const data = await res.json()
      setMessages(data.messages)
      setReply('')
      // Refresh ticket to get updated status
      fetchTicket()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-48" />
          <div className="h-4 bg-white/5 rounded w-32" />
          <div className="space-y-3 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl text-center py-20">
        <p className="text-slate-500">Ticket not found</p>
        <Link href="/support" className="text-indigo-400 text-sm mt-2 inline-block">
          Back to tickets
        </Link>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[ticket.status]

  return (
    <div className="max-w-3xl flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="mb-6 shrink-0">
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          All tickets
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
          <Badge className={`${statusConfig.color} border-0 text-xs shrink-0`}>
            {statusConfig.label}
          </Badge>
        </div>
        {ticket.escalated && (
          <div
            className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300">
              This ticket has been escalated to our support team.
              {ticket.status === 'awaiting_human' && ' They\'ll respond as soon as possible.'}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
        {messages.map((msg) => {
          const isUser = msg.sender_type === 'user'
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${isUser ? 'order-1' : ''}`}>
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {msg.sender_type === 'ai' ? (
                      <>
                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs text-indigo-400 font-medium">MathKix Assistant</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-medium">Support Team</span>
                      </>
                    )}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : msg.sender_type === 'ai'
                        ? 'bg-white/[0.07] text-slate-200 border border-white/10'
                        : 'bg-emerald-500/10 text-slate-200 border border-emerald-500/20'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className={`text-[10px] text-slate-600 mt-1 ${isUser ? 'text-right' : ''}`}>
                  {new Date(msg.created_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply input */}
      {ticket.status !== 'closed' ? (
        <form
          onSubmit={handleSendReply}
          className="shrink-0 pt-4 border-t border-white/[0.07]"
        >
          {ticket.status === 'awaiting_human' && (
            <div className="flex items-center gap-2 mb-3 text-xs text-amber-400/80">
              <Clock className="w-3.5 h-3.5" />
              Waiting for a team member to respond. You can still add details below.
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
              placeholder="Type your reply..."
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="px-4 py-3 rounded-xl text-white disabled:opacity-40 transition-opacity shrink-0"
              style={{ background: 'linear-gradient(135deg, #C0392B, #E74C3C)' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="shrink-0 pt-4 border-t border-white/[0.07] text-center">
          <p className="text-slate-500 text-sm">This ticket is closed.</p>
          <Link href="/support/new" className="text-indigo-400 text-sm">
            Open a new ticket
          </Link>
        </div>
      )}
    </div>
  )
}
