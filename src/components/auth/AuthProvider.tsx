'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
})

// Paths where an expired session should trigger a redirect to login
const PROTECTED_PREFIXES = ['/dashboard', '/children', '/billing', '/account', '/select', '/play']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  // Track whether the initial session load has completed
  const initialised = useRef(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      initialised.current = true
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)

        // Only act on SIGNED_OUT events that happen after the page has loaded
        // (not on the initial mount check). This fires when the refresh token
        // has expired and Supabase can no longer silently renew the session.
        if (event === 'SIGNED_OUT' && initialised.current) {
          const onProtectedPath = PROTECTED_PREFIXES.some((p) => pathname?.startsWith(p))
          if (onProtectedPath) {
            router.replace('/login?session=expired')
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
