export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const childName = (meta.childName as string | null) ?? 'your child'
  const xpEarned = (meta.xpEarned as number | null) ?? 0
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const subject = `${childName} just completed their first lesson!`

  const xpLine = xpEarned > 0 ? `They earned ${xpEarned} XP, their first points on the leaderboard.\n\n` : ''

  const text = `Hi,

${childName} just finished their first MathKix lesson.

${xpLine}Consistency is what moves the needle in math. Kids who do just 3 lessons a week see measurable improvement in 4–6 weeks.

Keep the momentum going: ${appUrl}/select

A daily streak is the fastest path to real progress. See if ${childName} can make it two days in a row.

The MathKix Team`

  return { subject, text }
}
