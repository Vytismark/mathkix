'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, Users, CreditCard, Settings, LogOut, HelpCircle, ArrowLeftRight, BookOpen, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/children', label: 'Children', icon: Users },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/account', label: 'Account', icon: Settings },
  { href: '/support', label: 'Support', icon: HelpCircle },
  { href: '/how-to', label: 'How it works', icon: BookOpen },
  { href: '/select', label: 'Switch Child', icon: ArrowLeftRight },
]

export function ParentShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const [signingOut, setSigningOut] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  async function confirmSignOut() {
    if (signingOut) return
    setSigningOut(true)
    setShowSignOutConfirm(false)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error('Failed to sign out')
        setSigningOut(false)
        return
      }
      window.location.href = '/login'
    } catch {
      toast.error('Failed to sign out')
      setSigningOut(false)
    }
  }

  function handleSignOut() {
    setDrawerOpen(false)
    setShowSignOutConfirm(true)
  }

  const navContent = (
    <>
      <div className="animate-fade-in mb-8 px-2">
        <Link href="/select" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mathkix-icon.svg" alt="" width={32} height={28} />
          <span className="text-lg font-extrabold leading-none tracking-tight">
            <span className="text-white">Math</span>
            <span style={{ color: '#E74C3C' }}>Kix</span>
          </span>
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
          onClick={handleSignOut}
          className="nav-item-animate flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors duration-150 w-full"
          style={{ animationDelay: `${NAV_ITEMS.length * 50}ms` }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <nav
        className="hidden md:flex flex-col w-56 min-h-screen px-3 py-6 border-r border-white/[0.07] shrink-0"
        style={{ background: 'rgba(255,255,255,0.025)' }}
      >
        {navContent}
      </nav>

      {/* ── Mobile top bar (visible below md) ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-white/[0.07] px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(7,8,15,1)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <Link href="/select" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mathkix-icon.svg" alt="" width={28} height={24} />
          <span className="text-base font-extrabold leading-none tracking-tight">
            <span className="text-white">Math</span>
            <span style={{ color: '#E74C3C' }}>Kix</span>
          </span>
        </Link>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 mobile-backdrop-enter"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <nav
            className="mobile-drawer-enter absolute top-0 left-0 bottom-0 w-64 flex flex-col px-3 py-6 border-r border-white/[0.07]"
            style={{ background: '#0a0b12' }}
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <Link href="/select" className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mathkix-icon.svg" alt="" width={28} height={24} />
                <span className="text-base font-extrabold leading-none tracking-tight">
                  <span className="text-white">Math</span>
                  <span style={{ color: '#E74C3C' }}>Kix</span>
                </span>
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const active = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-150',
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.06]'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-white/[0.07] pt-3">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors duration-150 w-full"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="relative flex-1 p-4 pt-16 md:pt-8 md:p-8 overflow-auto">
        {children}
      </main>

      {/* ── Sign-out confirmation dialog ── */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 animate-fade-in"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowSignOutConfirm(false)}
          />
          <div
            className="relative animate-scale-in w-full max-w-sm rounded-3xl border border-white/10 p-6"
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
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                disabled={signingOut}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                style={{ background: 'linear-gradient(135deg, #C0392B, #E74C3C)' }}
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
