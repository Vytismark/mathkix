import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Account',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'MathKix'

  return (
    <div
      style={{ background: '#07080f', minHeight: '100vh', color: 'white' }}
      className="relative flex flex-col items-center justify-center p-4"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[320px] sm:w-[700px] sm:h-[520px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, rgba(192,57,43,0.11) 0%, transparent 65%)',
        }}
      />

      {/* Back to home */}
      <div className="relative w-full max-w-md mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>
      </div>

      {/* Card */}
      <div
        className="auth-card animate-scale-in relative w-full max-w-md rounded-3xl border p-5 pt-6 sm:p-8 sm:pt-9"
        style={{
          background: 'linear-gradient(160deg, rgba(192,57,43,0.07) 0%, rgba(255,255,255,0.04) 60%)',
          borderColor: 'rgba(255,255,255,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {/* Red top accent line */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: '15%',
            right: '15%',
            height: '1.5px',
            borderRadius: '0 0 4px 4px',
            background: 'linear-gradient(90deg, transparent, rgba(231,76,60,0.65), transparent)',
          }}
        />

        {/* Logo */}
        <div className="text-center mb-7">
          <Link
            href="/"
            className="text-[26px] font-extrabold tracking-tight"
            style={{ color: '#E74C3C' }}
          >
            {appName}
          </Link>
          <p className="text-xs mt-1 tracking-wide uppercase" style={{ color: '#475569', letterSpacing: '0.08em' }}>
            Grades 1-5 math, personalized
          </p>
        </div>

        {children}
      </div>

      {/* Footer */}
      <p className="relative mt-8 text-xs" style={{ color: '#1e293b' }}>
        © {new Date().getFullYear()} {appName}
      </p>
    </div>
  )
}
