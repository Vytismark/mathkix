export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const firstName = (meta.parentFirstName as string | null) ?? 'there'
  const childName = (meta.childName as string | null) ?? null
  const xpTotal = (meta.xpTotal as number | null) ?? 0
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const name = childName ?? 'your child'
  const subject = `${childName ? childName + ' hasn' : 'You haven'}'t been on MathKix in a week`

  const xpLine = xpTotal > 0 ? `${name} has ${xpTotal} XP saved up. ` : ''

  const text = `Hi ${firstName},

${name} hasn't done a MathKix lesson in 7 days.

${xpLine}Math skills fade quickly without regular practice - but they come back fast too. Even one 10-minute session today makes a difference.

Jump back in: ${appUrl}/select

If something isn't working or the lessons feel off, reply to this email and let us know. We adjust ${name}'s path based on feedback.

The MathKix Team`

  return { subject, text }
}
