import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/rate-limit'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (isRateLimited(ip, { namespace: 'admin-login', maxRequests: 5, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 15 minutes.' },
      { status: 429 },
    )
  }

  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  if (ADMIN_EMAILS.length === 0) {
    console.error('ADMIN_EMAILS is not configured — all admin logins will be rejected')
    return NextResponse.json({ error: 'Admin access not configured' }, { status: 500 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  if (!ADMIN_EMAILS.includes(data.user.email?.toLowerCase() ?? '')) {
    await supabase.auth.signOut()
    return NextResponse.json({ error: 'Unauthorized — not an admin account' }, { status: 403 })
  }

  return NextResponse.json({ ok: true })
}
