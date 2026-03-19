export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const firstName = (meta.parentFirstName as string | null) ?? 'there'
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const subject = 'Still getting started? Here\'s a quick guide'

  const text = `Hi ${firstName},

You signed up for MathKix a few days ago. Just checking in to make sure everything is going smoothly.

If you haven't added your child yet, here's what to expect:

- Adding a child takes about 30 seconds (just a name and grade)
- Your child takes a 10-minute placement quiz in the app. It sets their personalised starting point.
- The first lesson takes about 5–8 minutes

A few things parents ask us:

Q: Who takes the placement quiz, me or my child?
A: Your child takes it in the app. It's adaptive and takes about 10 minutes. No grades, no wrong answers. It just finds their starting level.

Q: Is it stressful for my child?
A: Not at all. The questions adapt as they go so it never feels too hard. Most kids find it fun.

Q: What grade levels does MathKix cover?
A: Kindergarten through Grade 5.

Q: How often should my child use it?
A: 3–4 sessions per week is ideal. Even 10 minutes a day adds up.

Go to your dashboard: ${appUrl}/select

Reply to this email if you have any questions. We read every one.

The MathKix Team`

  return { subject, text }
}
