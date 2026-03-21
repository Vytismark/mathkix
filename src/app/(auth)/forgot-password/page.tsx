'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('rate limit') || msg.includes('exceeded') || msg.includes('too many')) {
        toast.error('Too many reset attempts. Please wait a few minutes before trying again.')
      } else if (msg.includes('not found') || msg.includes('invalid')) {
        toast.error('No account found with that email address.')
      } else {
        toast.error('Failed to send reset link. Please try again.')
      }
      setLoading(false)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="animate-scale-in text-center space-y-4 py-2">
        <div className="text-5xl">📩</div>
        <h2 className="text-xl font-bold text-white">Check your email</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          We sent a password reset link to{' '}
          <span className="text-white font-medium">{email}</span>.
        </p>
        <Link
          href="/login"
          className="block text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-7 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 80ms both' }}>
          <div className="auth-input-wrap">
            <Mail className="auth-input-icon" style={{ width: 17, height: 17 }} />
            <div className="auth-float-group">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                className="auth-float-input"
              />
              <label htmlFor="email" className="auth-float-label">Email</label>
            </div>
          </div>
        </div>

        <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 150ms both' }}>
          <button
            type="submit"
            disabled={loading}
            className="cta-btn w-full h-11 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #2557CC, #3678FF)',
              boxShadow: '0 3px 18px rgba(54,120,255,0.4)',
            }}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </div>

        <p
          className="text-center text-sm text-slate-500"
          style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 220ms both' }}
        >
          <Link href="/login" className="text-red-400 hover:text-red-300 transition-colors">
            Back to sign in
          </Link>
        </p>
      </form>
    </>
  )
}
