'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NewTicketPage() {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return

    // Validate subject contains at least some alphanumeric characters
    if (!/[a-zA-Z0-9]/.test(subject)) {
      toast.error('Please enter a valid subject with some text or numbers')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), description: description.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to create ticket')
        setLoading(false)
        return
      }

      const data = await res.json()
      toast.success('Ticket created!')
      router.push(`/support/${data.ticket.id}`)
    } catch {
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tickets
        </Link>
        <h1 className="text-2xl font-bold text-white">New Support Ticket</h1>
        <p className="text-slate-500 text-sm mt-1">
          Describe your issue and our AI assistant will respond right away.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
            placeholder="Brief summary of your issue"
            maxLength={200}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600 min-h-[140px] resize-y"
            placeholder="Tell us more about what you need help with..."
            minLength={10}
            required
          />
          <p className="text-slate-600 text-xs mt-1.5">Minimum 10 characters</p>
        </div>

        <button
          type="submit"
          disabled={loading || !subject.trim() || description.trim().length < 10}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{
            background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
            boxShadow: '0 4px 18px rgba(192,57,43,0.35)',
          }}
        >
          <Send className="w-4 h-4" />
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  )
}
