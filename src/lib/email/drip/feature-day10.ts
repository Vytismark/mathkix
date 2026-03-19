export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const firstName = (meta.parentFirstName as string | null) ?? 'there'
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const subject = 'How XP, streaks, and mastery work in MathKix'

  const text = `Hi ${firstName},

Most parents discover MathKix's motivation system on their own - but here's a quick tour so you know what to look for.

XP (Experience Points)
Every lesson earns XP based on accuracy and difficulty. XP accumulates over time and shows total effort at a glance. Kids who see their XP grow tend to practise more consistently.

Daily Streaks
A streak counts consecutive days with at least one lesson completed. Streaks are one of the most effective motivators for young learners - the "don't break the chain" effect.

Mastery Levels
For each math standard (e.g. "Adding within 20"), MathKix tracks mastery on a 0–3 scale:
0 = Not yet introduced
1 = Introduced
2 = Practising
3 = Mastered

Lessons are selected to reinforce weak areas while keeping things achievable - so your child always feels progress, not frustration.

You can see all of this on your child's progress page: ${appUrl}/select

The MathKix Team`

  return { subject, text }
}
