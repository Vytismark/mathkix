import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
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
