'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/science', label: 'Science' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Sign in' },
]

interface MarketingNavProps {
  currentPage?: 'pricing' | 'science'
}

export function MarketingNav({ currentPage }: MarketingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <nav className="landing-nav">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mathkix-logo.svg"
            alt="MathKix"
            height={32}
            className="h-7 sm:h-8 w-auto"
          />
        </Link>

        {/* Desktop links (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                currentPage === link.href.slice(1)
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/signup"
            className="cta-btn text-sm font-bold text-white px-4 py-2 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
              boxShadow: '0 2px 14px rgba(192,57,43,0.4)',
            }}
          >
            Start free
          </Link>
        </div>

        {/* Mobile hamburger (visible below sm) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="sm:hidden fixed inset-0 z-30 mobile-backdrop-enter"
            style={{ background: 'rgba(0,0,0,0.5)', top: '56px' }}
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu panel */}
          <div
            className="sm:hidden mobile-menu-enter relative z-40 border-t border-white/[0.06] px-4 pb-5 pt-3"
            style={{ background: 'rgba(7,8,15,0.97)' }}
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium px-3 py-3 rounded-xl transition-colors ${
                    currentPage === link.href.slice(1)
                      ? 'text-white bg-white/[0.08]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 px-3">
              <Link
                href="/signup"
                className="cta-btn flex items-center justify-center text-sm font-bold text-white w-full py-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
                  boxShadow: '0 2px 14px rgba(192,57,43,0.4)',
                }}
              >
                Start free for 30 days
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
