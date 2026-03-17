import { createClient } from '@/lib/supabase/server'

/**
 * Verify the current request is from an authenticated admin user.
 * Returns the user if authorized, null otherwise.
 */
export async function verifyAdmin() {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return null
  if (!adminEmails.includes(user.email.toLowerCase())) return null

  return user
}
