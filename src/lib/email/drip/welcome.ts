export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const firstName = (meta.parentFirstName as string | null) ?? 'there'
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const subject = 'Welcome to MathKix: here\'s how to get started'

  const text = `Hi ${firstName},

Welcome to MathKix! We're glad you're here.

MathKix helps K-5 kids build real math skills through short, adaptive lessons that meet them exactly where they are. No stress, no busywork.

Here's how to get started in 3 steps:

1. Add your child's profile (takes 30 seconds)
2. Your child takes a short placement quiz (10 minutes, no wrong answers, no pressure)
3. MathKix builds your child a personalised lesson path and they start learning

Go to your dashboard: ${appUrl}/select

If you run into anything, just reply to this email.

The MathKix Team`

  return { subject, text }
}
