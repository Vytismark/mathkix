import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_KEYS = new Set(['support_updates', 'weekly_reports', 'product_updates'])

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Validate: only allow known keys with boolean values
    const updates: Record<string, boolean> = {}
    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_KEYS.has(key)) {
        return NextResponse.json({ error: `Unknown preference: ${key}` }, { status: 400 })
      }
      if (typeof value !== 'boolean') {
        return NextResponse.json({ error: `${key} must be a boolean` }, { status: 400 })
      }
      updates[key] = value
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No preferences provided' }, { status: 400 })
    }

    // Read current preferences
    const { data: profile, error: readError } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.id)
      .single()

    if (readError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const currentPrefs = (profile.notification_preferences ?? {}) as Record<string, boolean>
    const merged = { ...currentPrefs, ...updates }

    // Update
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ notification_preferences: merged })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, preferences: merged })
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
