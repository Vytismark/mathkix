export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const firstName = (meta.parentFirstName as string | null) ?? 'there'
  const childName = (meta.childName as string | null) ?? null
  const lessonCount = (meta.lessonCount as number | null) ?? 0
  const xpTotal = (meta.xpTotal as number | null) ?? 0
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'
  const isActive = lessonCount > 0

  const subject = isActive
    ? `One week in: ${childName ?? 'your child'} is off to a great start`
    : 'One week in: MathKix is ready when you are'

  const activeText = childName
    ? `${childName} has completed ${lessonCount} lesson${lessonCount !== 1 ? 's' : ''} and earned ${xpTotal} XP in their first week. That's a real start.\n\nKeep going: ${appUrl}/select`
    : `Your child has completed ${lessonCount} lesson${lessonCount !== 1 ? 's' : ''} and earned ${xpTotal} XP in their first week.\n\nKeep going: ${appUrl}/select`

  const inactiveText = `You still have 23 days left in your free trial. Thousands of K-5 parents use MathKix to help their kids build real math confidence, without homework battles.\n\nWhat parents tell us:\n\n"My daughter went from dreading math to asking to do more lessons. I didn't expect that." - Parent of a Grade 3 student\n\n"We tried two other apps. MathKix is the only one that actually adapts to where my son is." - Parent of a Grade 1 student\n\nGet started today: ${appUrl}/select`

  const text = `Hi ${firstName},

It's been one week since you joined MathKix.

${isActive ? activeText : inactiveText}

The MathKix Team`

  return { subject, text }
}
