export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const firstName = (meta.parentFirstName as string | null) ?? 'there'
  const childName = (meta.childName as string | null) ?? null
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const name = childName ?? 'your child'
  const subject = 'Tomorrow is your last day on MathKix'

  const text = `Hi ${firstName},

Your free trial ends tomorrow.

After today, ${name} won't be able to access lessons until you upgrade.

It takes about 2 minutes to set up a plan. Lessons continue from exactly where ${name} left off.

Upgrade now: ${appUrl}/billing

Monthly - $9.99/month
Annual - $79.99/year (save 33%)
Lifetime - $149.99 one-time

The MathKix Team`

  return { subject, text }
}
