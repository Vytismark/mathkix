'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? '')
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setFullName(data?.full_name ?? '')
          setInitialized(true)
        })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id)
    toast.success('Profile updated!')
    setLoading(false)
  }

  if (!initialized) {
    return <div className="text-slate-500 text-sm">Loading…</div>
  }

  return (
    <div className="max-w-lg">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-5"
      >
        ← Dashboard
      </Link>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white mb-1.5">Account</h1>
      <p className="animate-fade-in-up text-slate-500 text-sm mb-8" style={{ animationDelay: '60ms' }}>Manage your profile settings</p>

      <div
        className="animate-fade-in-up rounded-3xl border border-white/10 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)', animationDelay: '120ms' }}
      >
        <div className="px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-white font-semibold">Profile</h2>
        </div>
        <div className="px-6 py-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Email</label>
              <input
                value={email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-500 border border-white/10 outline-none"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              />
              <p className="text-xs text-slate-600">Email cannot be changed here.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-400">Full name</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white border border-white/10 outline-none focus:border-white/25 transition-colors placeholder:text-slate-600"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="cta-btn px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
                boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
              }}
            >
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
