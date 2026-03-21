'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/select'

  useEffect(() => {
    if (searchParams.get('session') === 'expired') {
      toast.warning('Your session expired. Please sign in again.')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGoogleSignIn() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    })
    if (error) {
      toast.error('Failed to sign in with Google')
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Google button */}
      <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 40ms both' }}>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none text-gray-900 transition-colors"
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

      {/* Email */}
      <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 80ms both' }}>
        <div className="auth-input-wrap">
          <Mail className="auth-input-icon" style={{ width: 17, height: 17 }} />
          <div className="auth-float-group">
            {/* input MUST come before label for :placeholder-shown ~ label to work */}
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
      <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 150ms both' }}>
        <div className="auth-input-wrap">
          <Lock className="auth-input-icon" style={{ width: 17, height: 17 }} />
          <div className="auth-float-group">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
              autoComplete="current-password"
              className="auth-float-input pr-10"
            />
            <label htmlFor="password" className="auth-float-label">Password</label>
          </div>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
          </button>
        </div>
        <div className="flex justify-end mt-1.5">
          <Link
            href="/forgot-password"
            className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Submit */}
      <div style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 220ms both' }}>
        <button
          type="submit"
          disabled={loading}
          className="cta-btn w-full h-11 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #2557CC, #3678FF)',
            boxShadow: '0 3px 18px rgba(54,120,255,0.40)',
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </div>

      {/* Footer */}
      <p
        className="text-center text-sm text-slate-500"
        style={{ animation: 'fade-in-up 0.45s cubic-bezier(0.22,1,0.36,1) 290ms both' }}
      >
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
          Sign up
        </Link>
      </p>
    </form>
    </div>
  )
}
