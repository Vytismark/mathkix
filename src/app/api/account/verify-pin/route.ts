import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/rate-limit'

function hashPin(pin: string, userId: string): string {
  return crypto.pbkdf2Sync(pin, userId, 100_000, 32, 'sha256').toString('hex')
}

// GET /api/account/verify-pin — check whether the user has a PIN set
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('dashboard_pin_hash')
    .eq('id', user.id)
    .single()

  return Response.json({ hasPIN: !!data?.dashboard_pin_hash })
}

// POST /api/account/verify-pin — verify a 4-digit PIN
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 5 attempts per 5 minutes
  if (isRateLimited(user.id, { namespace: 'pin-verify', maxRequests: 5, windowMs: 5 * 60 * 1000 })) {
    return Response.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const { pin } = body

  if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    return Response.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })
  }

  const { data } = await supabase
    .from('profiles')
    .select('dashboard_pin_hash')
    .eq('id', user.id)
    .single()

  if (!data?.dashboard_pin_hash) {
    // No PIN set — let through
    return Response.json({ verified: true })
  }

  const verified = hashPin(pin, user.id) === data.dashboard_pin_hash
  return Response.json({ verified })
}
