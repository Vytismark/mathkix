'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LayoutDashboard, MessageCircle, LogOut, Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/support', label: 'Support Tickets', icon: MessageCircle },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  async function handleSignOut() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  function isActive(item: typeof NAV_ITEMS[number]) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const navContent = (
    <>
      <div className="mb-8 px-2">
        <Link href="/admin" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="text-lg font-extrabold leading-none tracking-tight">
            <span className="text-white">Math</span>
            <span style={{ color: '#3678FF' }}>Kix</span>
            <span className="text-indigo-400 ml-1.5 text-xs font-medium">Admin</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 space-y-0.5">
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors duration-150 w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex flex-col w-56 min-h-screen px-3 py-6 border-r border-white/[0.07] shrink-0"
        style={{ background: 'rgba(255,255,255,0.025)' }}
      >
        {navContent}
      </nav>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-white/[0.07] px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(7,8,15,0.95)', backdropFilter: 'blur(12px)' }}
      >
        <span className="text-base font-extrabold leading-none tracking-tight">
          <span className="text-white">Math</span>
          <span style={{ color: '#3678FF' }}>Kix</span>
          <span className="text-indigo-400 ml-1.5 text-xs font-medium">Admin</span>
        </span>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setDrawerOpen(false)}
          />
          <nav
            className="absolute top-0 left-0 bottom-0 w-64 flex flex-col px-3 py-6 border-r border-white/[0.07]"
            style={{ background: '#0a0b12' }}
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <span className="text-base font-extrabold">
                <span className="text-white">Math</span>
                <span style={{ color: '#3678FF' }}>Kix</span>
                <span className="text-indigo-400 ml-1.5 text-xs font-medium">Admin</span>
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {navContent}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="relative flex-1 p-4 md:p-8 overflow-auto md:mt-0 mt-14">
        {children}
      </main>
    </div>
  )
}
