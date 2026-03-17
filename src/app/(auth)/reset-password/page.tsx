'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Password updated!')
    router.push('/dashboard')
  }

  return (
    <>
      <div className="text-center mb-7 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Set new password</h1>
        <p className="text-slate-500 text-sm mt-1">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 80ms both' }}>
          <div className="auth-input-wrap">
            <Lock className="auth-input-icon" style={{ width: 17, height: 17 }} />
            <div className="auth-float-group">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                minLength={8}
                className="auth-float-input"
              />
              <label htmlFor="password" className="auth-float-label">New password</label>
            </div>
          </div>
        </div>

        <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 150ms both' }}>
          <div className="auth-input-wrap">
            <Lock className="auth-input-icon" style={{ width: 17, height: 17 }} />
            <div className="auth-float-group">
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder=" "
                required
                className="auth-float-input"
              />
              <label htmlFor="confirm" className="auth-float-label">Confirm password</label>
            </div>
          </div>
        </div>

        <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 220ms both' }}>
          <button
            type="submit"
            disabled={loading}
            className="cta-btn w-full h-11 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
              boxShadow: '0 3px 18px rgba(192,57,43,0.4)',
            }}
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </>
  )
}
