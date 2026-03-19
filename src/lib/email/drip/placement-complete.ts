export interface RenderResult { subject: string; text: string; html?: string }

export function render(meta: Record<string, unknown>): RenderResult {
  const childName = (meta.childName as string | null) ?? 'your child'
  const assessedGrade = meta.assessedGrade as number | null
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'

  const gradeLabel =
    assessedGrade === 0 ? 'Kindergarten level'
    : assessedGrade != null ? `Grade ${assessedGrade} level`
    : 'their grade level'

  const subject = `${childName}'s placement is done. Here's what we found`

  const text = `Hi,

${childName} just completed the MathKix placement quiz.

Based on their answers, we've set their starting point at ${gradeLabel}. From here, every lesson is tailored to ${childName} specifically, building on what they know and gently stretching into what's next.

Start the first lesson now: ${appUrl}/select

The first lesson takes about 5–8 minutes. MathKix will track ${childName}'s progress automatically from here.

The MathKix Team`

  return { subject, text }
}
