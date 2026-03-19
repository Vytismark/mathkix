export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const firstName = (meta.parentFirstName as string | null) ?? 'there'
  const planType = (meta.planType as string | null) ?? 'plan'
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const planLabel =
    planType === 'lifetime' ? 'Lifetime'
    : planType === 'annual'  ? 'Annual'
    : 'Monthly'

  const subject = `You're in - welcome to MathKix ${planLabel}`

  const text = `Hi ${firstName},

You're now a MathKix ${planLabel} member. Thank you.

Here's what you have access to:

- Unlimited lessons for up to 10 child profiles
- Full adaptive learning system (personalised paths, spaced repetition)
- Progress tracking, mastery reports, and weekly email updates
- XP, streaks, and achievement badges to keep kids motivated

Go to your dashboard: ${appUrl}/select

To manage your subscription or update billing, visit: ${appUrl}/billing

If you ever need help, our support team is available at: ${appUrl}/support

The MathKix Team`

  return { subject, text }
}
