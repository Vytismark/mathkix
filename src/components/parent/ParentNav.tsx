'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/children', label: 'Children', icon: Users },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/account', label: 'Account', icon: Settings },
  { href: '/how-to', label: 'How it works', icon: HelpCircle },
]

export function ParentNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <nav
      className="flex flex-col w-56 min-h-screen px-3 py-6 border-r border-white/[0.07] shrink-0"
      style={{ background: 'rgba(255,255,255,0.025)' }}
    >
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
    </nav>
  )
}
