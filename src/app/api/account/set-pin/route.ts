import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/rate-limit'

function hashPin(pin: string, userId: string): string {
  return crypto.pbkdf2Sync(pin, userId, 100_000, 32, 'sha256').toString('hex')
}

function isValidPin(pin: unknown): pin is string {
  return typeof pin === 'string' && /^\d{4}$/.test(pin)
}

// POST /api/account/set-pin
// Body: { action: "set", pin } | { action: "change", oldPin, newPin } | { action: "remove", pin }
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 10 attempts per 15 minutes
  if (isRateLimited(user.id, { namespace: 'pin-set', maxRequests: 10, windowMs: 15 * 60 * 1000 })) {
    return Response.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const { action } = body

  const { data: profile } = await supabase
    .from('profiles')
    .select('dashboard_pin_hash')
    .eq('id', user.id)
    .single()

  const currentHash = profile?.dashboard_pin_hash ?? null

  if (action === 'set') {
    if (!isValidPin(body.pin)) return Response.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })
    if (currentHash) return Response.json({ error: 'A PIN is already set. Use change instead.' }, { status: 400 })

    const hash = hashPin(body.pin, user.id)
    await supabase.from('profiles').update({ dashboard_pin_hash: hash }).eq('id', user.id)
    return Response.json({ success: true })
  }

  if (action === 'change') {
    if (!isValidPin(body.oldPin)) return Response.json({ error: 'Old PIN must be exactly 4 digits' }, { status: 400 })
    if (!isValidPin(body.newPin)) return Response.json({ error: 'New PIN must be exactly 4 digits' }, { status: 400 })
    if (!currentHash) return Response.json({ error: 'No PIN is set' }, { status: 400 })

    if (hashPin(body.oldPin, user.id) !== currentHash) {
      return Response.json({ error: 'Current PIN is incorrect' }, { status: 400 })
    }

    const newHash = hashPin(body.newPin, user.id)
    await supabase.from('profiles').update({ dashboard_pin_hash: newHash }).eq('id', user.id)
    return Response.json({ success: true })
  }

  if (action === 'remove') {
    if (!isValidPin(body.pin)) return Response.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })
    if (!currentHash) return Response.json({ error: 'No PIN is set' }, { status: 400 })

    if (hashPin(body.pin, user.id) !== currentHash) {
      return Response.json({ error: 'PIN is incorrect' }, { status: 400 })
    }

    await supabase.from('profiles').update({ dashboard_pin_hash: null }).eq('id', user.id)
    return Response.json({ success: true })
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 })
}
