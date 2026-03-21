'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, HelpCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/children', label: 'Children', icon: Users },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/account', label: 'Account', icon: Settings },
  { href: '/how-to', label: 'How it works', icon: HelpCircle },
]

export function ParentNav() {
  const pathname = usePathname()
  const [showConfirm, setShowConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function confirmSignOut() {
    if (signingOut) return
    setSigningOut(true)
    setShowConfirm(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
    <nav
      className="flex flex-col w-56 min-h-screen px-3 py-6 border-r border-white/[0.07] shrink-0"
      style={{ background: 'rgba(255,255,255,0.025)' }}
    >
      <div className="animate-fade-in mb-8 px-2">
        <Link href="/select" className="hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mathkix-logo.svg" alt="MathKix" height={28} className="h-7 w-auto" />
        </Link>
      </div>

      <div className="flex-1 space-y-0.5">
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-item-animate flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.06]'
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="border-t border-white/[0.07] pt-3">
        <button
          onClick={() => setShowConfirm(true)}
          className="nav-item-animate flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors duration-150 w-full"
          style={{ animationDelay: `${NAV_ITEMS.length * 50}ms` }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </nav>

    {showConfirm && (

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowConfirm(false)}
        />
        <div
          className="relative w-full max-w-sm rounded-3xl border border-white/10 p-6"
          style={{ background: '#0e0f16' }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Sign out?</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Are you sure you want to sign out?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmSignOut}
              disabled={signingOut}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #2557CC, #3678FF)' }}
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
