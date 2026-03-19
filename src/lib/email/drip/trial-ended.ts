export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const firstName = (meta.parentFirstName as string | null) ?? 'there'
  const childName = (meta.childName as string | null) ?? null
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const name = childName ?? 'your child'
  const subject = 'Your MathKix trial has ended'

  const text = `Hi ${firstName},

Your 30-day free trial has ended.

${name}'s progress, placement results, and mastery data are all saved and waiting. Reactivating takes about 2 minutes and lessons continue from exactly where ${name} left off.

Reactivate your account: ${appUrl}/billing

Monthly - $9.99/month
Annual - $79.99/year (save 33%)
Lifetime - $149.99 one-time

If you have questions or ran into any issues during your trial, reply to this email - we'd love to hear from you.

The MathKix Team`

  return { subject, text }
}
