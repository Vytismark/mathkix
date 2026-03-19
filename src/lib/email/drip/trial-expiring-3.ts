export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const firstName = (meta.parentFirstName as string | null) ?? 'there'
  const childName = (meta.childName as string | null) ?? null
  const xpTotal = (meta.xpTotal as number | null) ?? 0
  const streakDays = (meta.streakDays as number | null) ?? 0
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const subject = `3 days left - don't lose ${childName ?? "your child"}'s progress`

  const streakLine = streakDays > 0
    ? `They have a ${streakDays}-day streak going. That streak resets if the trial ends without a plan.`
    : ''

  const xpLine = xpTotal > 0
    ? `${childName ?? 'Your child'} has earned ${xpTotal} XP so far. `
    : ''

  const text = `Hi ${firstName},

Your free trial ends in 3 days.

${xpLine}${streakLine}

When the trial ends, your child's lesson access is paused until you upgrade. Their progress, placement, and mastery data stay safe - but they won't be able to do new lessons.

Upgrade now to keep going without a gap: ${appUrl}/billing

Monthly - $9.99/month
Annual - $79.99/year (save 33%)
Lifetime - $149.99 one-time

The MathKix Team`

  return { subject, text }
}
