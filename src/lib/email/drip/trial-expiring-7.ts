export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const firstName = (meta.parentFirstName as string | null) ?? 'there'
  const childName = (meta.childName as string | null) ?? null
  const xpTotal = (meta.xpTotal as number | null) ?? 0
  const lessonCount = (meta.lessonCount as number | null) ?? 0
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const subject = 'Your MathKix free trial ends in 7 days'

  const progressLine = lessonCount > 0
    ? `${childName ?? 'Your child'} has completed ${lessonCount} lesson${lessonCount !== 1 ? 's' : ''} and earned ${xpTotal} XP. That progress is worth keeping.`
    : `You have 7 days left to try MathKix before your trial ends.`

  const text = `Hi ${firstName},

Your free trial ends in 7 days.

${progressLine}

When your trial ends, access to lessons is paused. To keep going without interruption, choose a plan before your trial runs out.

Plans start at $9.99/month - less than a single tutoring session.

Monthly - $9.99/month
Annual - $79.99/year (save 33%)
Lifetime - $149.99 one-time

Choose a plan: ${appUrl}/billing

Questions? Reply to this email.

The MathKix Team`

  return { subject, text }
}
