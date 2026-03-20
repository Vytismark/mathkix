import { createClient } from '@/lib/supabase/server'

/**
 * Verify the current request is from an authenticated reviewer.
 * Reviewers are set via REVIEWER_EMAILS env var (comma-separated).
 * Admins (ADMIN_EMAILS) automatically have reviewer access too.
 */
export async function verifyReviewer() {
  const reviewerEmails = (process.env.REVIEWER_EMAILS ?? '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  const allowed = [...new Set([...reviewerEmails, ...adminEmails])]

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) return null
  if (!allowed.includes(user.email.toLowerCase())) return null
  return user
}
