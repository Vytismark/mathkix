// Runtime environment variable validation
// Throws at first access if a required variable is missing

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback
}

/** Server-only env vars - import this in API routes / server code */
export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() { return required('NEXT_PUBLIC_SUPABASE_URL') },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() { return required('NEXT_PUBLIC_SUPABASE_ANON_KEY') },
  get SUPABASE_SERVICE_ROLE_KEY() { return required('SUPABASE_SERVICE_ROLE_KEY') },
  get STRIPE_SECRET_KEY() { return required('STRIPE_SECRET_KEY') },
  get STRIPE_WEBHOOK_SECRET() { return required('STRIPE_WEBHOOK_SECRET') },
  get ANTHROPIC_API_KEY() { return required('ANTHROPIC_API_KEY') },
  get NEXT_PUBLIC_APP_URL() { return required('NEXT_PUBLIC_APP_URL') },
  get ADMIN_EMAILS() { return required('ADMIN_EMAILS') },
  get CRON_SECRET() { return required('CRON_SECRET') },
  get RESEND_API_KEY() { return optional('RESEND_API_KEY', '') },
  get SUPPORT_FROM_EMAIL() { return optional('SUPPORT_FROM_EMAIL', 'hello@mathkix.com') },
  get ADMIN_NOTIFICATION_EMAIL() { return optional('ADMIN_NOTIFICATION_EMAIL', '') },
} as const
