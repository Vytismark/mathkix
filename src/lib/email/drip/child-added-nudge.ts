export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const childName = (meta.childName as string | null) ?? 'your child'
  const grade = meta.grade as number | null
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const gradeLabel =
    grade === 0 ? 'Kindergarten'
    : grade != null ? `Grade ${grade}`
    : null

  const subject = `You've added ${childName}: one step left`

  const text = `Hi,

Great, you've added ${childName}${gradeLabel ? ` (${gradeLabel})` : ''} to MathKix!

The next step is the placement quiz. ${childName} takes it directly in the app. It takes about 10 minutes and tells us exactly where ${childName} is in math, so every lesson feels right, not too easy and not too hard.

Start now (your child opens this on their device): ${appUrl}/select

There are no wrong answers. It's a quick adaptive assessment. MathKix uses it to build ${childName} a personalised learning path.

The MathKix Team`

  return { subject, text }
}
