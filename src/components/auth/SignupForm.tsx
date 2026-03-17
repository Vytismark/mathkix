'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { User, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  if (pw.length === 0)  return { level: 0, label: '',        color: '' }
  if (pw.length < 4)    return { level: 1, label: 'Too short', color: '#ef4444' }
  if (pw.length < 8)    return { level: 2, label: 'Weak',      color: '#f59e0b' }
  const hasUpper  = /[A-Z]/.test(pw)
  const hasNum    = /\d/.test(pw)
  const hasSymbol = /[^A-Za-z0-9]/.test(pw)
  const extras = [hasUpper, hasNum, hasSymbol].filter(Boolean).length
  if (pw.length >= 12 && extras >= 2) return { level: 4, label: 'Strong',  color: '#10b981' }
  if (pw.length >= 8  && extras >= 1) return { level: 3, label: 'Good',    color: '#10b981' }
  return { level: 2, label: 'Fair', color: '#f59e0b' }
}

export function SignupForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)

  const strength = getPasswordStrength(password)

  async function handleGoogleSignIn() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/select`,
      },
    })
    if (error) {
      toast.error('Failed to sign in with Google')
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="animate-scale-in text-center space-y-4 py-2">
        <div className="text-5xl">📬</div>
        <h2 className="text-xl font-bold text-white">Check your email</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          We sent a confirmation link to{' '}
          <span className="text-white font-medium">{email}</span>.<br />
          Click it to activate your account.
        </p>
        <p className="text-sm text-slate-500">
          Already confirmed?{' '}
          <Link href="/login" className="text-red-400 hover:text-red-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Google button */}
      <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 40ms both' }}>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      {/* Divider */}
      <div
        className="flex items-center gap-3"
        style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 60ms both' }}
      >
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-slate-600">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Name */}
      <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 80ms both' }}>
        <div className="auth-input-wrap">
          <User className="auth-input-icon" style={{ width: 17, height: 17 }} />
          <div className="auth-float-group">
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder=" "
              required
              autoComplete="name"
              className="auth-float-input"
            />
            <label htmlFor="fullName" className="auth-float-label">Your name</label>
          </div>
        </div>
      </div>

      {/* Email */}
      <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 140ms both' }}>
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
              autoComplete="email"
              className="auth-float-input"
            />
            <label htmlFor="email" className="auth-float-label">Email</label>
          </div>
        </div>
      </div>

      {/* Password */}
      <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 200ms both' }}>
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
              autoComplete="new-password"
              minLength={8}
              className="auth-float-input"
            />
            <label htmlFor="password" className="auth-float-label">Password</label>
          </div>
        </div>

        {/* Password strength bar */}
        {password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((seg) => (
                <div
                  key={seg}
                  className="h-[3px] flex-1 rounded-full transition-all duration-300"
                  style={{
                    background: seg <= strength.level ? strength.color : 'rgba(255,255,255,0.1)',
                    opacity: seg <= strength.level ? 1 : 1,
                  }}
                />
              ))}
            </div>
            <p
              className="text-xs transition-all duration-200"
              style={{ color: strength.color, opacity: strength.level > 0 ? 0.85 : 0 }}
            >
              {strength.label}
            </p>
          </div>
        )}
      </div>

      {/* Terms checkbox */}
      <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 240ms both' }}>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-600 accent-red-500 shrink-0"
          />
          <span className="text-xs text-slate-500 leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" className="text-red-400 hover:text-red-300 underline underline-offset-2">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-red-400 hover:text-red-300 underline underline-offset-2">
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>

      {/* Submit */}
      <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 300ms both' }}>
        <button
          type="submit"
          disabled={loading || !agreedTerms}
          className="cta-btn w-full h-11 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
            boxShadow: '0 3px 18px rgba(192,57,43,0.4)',
          }}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </div>

      {/* Trial note */}
      <p
        className="text-center text-xs text-slate-600"
        style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 350ms both' }}
      >
        30-day free trial · No credit card required
      </p>

      {/* Footer */}
      <p
        className="text-center text-sm text-slate-500"
        style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 370ms both' }}
      >
        Already have an account?{' '}
        <Link href="/login" className="text-red-400 hover:text-red-300 transition-colors font-medium">
          Sign in
        </Link>
      </p>
    </form>
    </div>
  )
}
