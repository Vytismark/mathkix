export interface RenderResult { subject: string; text: string; html?: string }

function esc(s: string | null | undefined): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function render(meta: Record<string, unknown>): RenderResult {
  const firstName = (meta.parentFirstName as string | null) ?? 'there'
  const childName = (meta.childName as string | null) ?? null
  const lessonCount = (meta.lessonCount as number | null) ?? 0
  const xpTotal = (meta.xpTotal as number | null) ?? 0
  const streakDays = (meta.streakDays as number | null) ?? 0
  const appUrl = (meta.appUrl as string) || 'https://mathkix.com'
  const isActive = lessonCount > 0

  const subject = isActive
    ? `Two weeks in: ${childName ?? 'your child'}'s progress so far`
    : 'Two weeks in: your trial is halfway done'

  const text = isActive
    ? `Hi ${firstName},\n\nTwo weeks into MathKix! ${childName ?? 'Your child'} has completed ${lessonCount} lesson${lessonCount !== 1 ? 's' : ''} and earned ${xpTotal} XP${streakDays > 0 ? `, with a ${streakDays}-day streak` : ''}.\n\nKeep the momentum going: ${appUrl}/select\n\nThe MathKix Team`
    : `Hi ${firstName},\n\nTwo weeks have passed since you joined MathKix - your free trial is halfway done.\n\nIf you haven't started yet, now is a great time. Getting your child placed and doing even 5 lessons in the next 2 weeks will show you what MathKix can do.\n\nGet started: ${appUrl}/select\n\nThe MathKix Team`

  if (!isActive) {
    return { subject, text }
  }

  // Rich HTML for active users
  const statCols = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td align="center" style="padding:14px 6px;background-color:#fff7ed;border-radius:8px;width:32%;">
          <div style="font-size:22px;font-weight:800;color:#c2410c;line-height:1;">${xpTotal.toLocaleString()}</div>
          <div style="font-size:11px;color:#9a3412;margin-top:4px;">Total XP</div>
        </td>
        <td width="2%"></td>
        <td align="center" style="padding:14px 6px;background-color:#f0fdf4;border-radius:8px;width:32%;">
          <div style="font-size:22px;font-weight:800;color:#15803d;line-height:1;">${lessonCount}</div>
          <div style="font-size:11px;color:#166534;margin-top:4px;">Lesson${lessonCount !== 1 ? 's' : ''}</div>
        </td>
        <td width="2%"></td>
        <td align="center" style="padding:14px 6px;background-color:#eff6ff;border-radius:8px;width:32%;">
          <div style="font-size:22px;font-weight:800;color:#1d4ed8;line-height:1;">${streakDays}</div>
          <div style="font-size:11px;color:#1e40af;margin-top:4px;">Day streak</div>
        </td>
      </tr>
    </table>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Two-week MathKix update</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f1f5f9">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <tr>
            <td bgcolor="#07080f" style="background-color:#07080f;border-radius:16px 16px 0 0;padding:26px 32px 24px;">
              <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Math<span style="color:#E74C3C;">Kix</span></span>
              <div style="font-size:13px;color:#64748b;margin-top:5px;">Two-week progress update</div>
            </td>
          </tr>

          <tr>
            <td bgcolor="#ffffff" style="padding:28px 32px 24px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">Hi ${esc(firstName)}!</p>
              <p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.6;">
                Two weeks in - here's how ${esc(childName ?? 'your child')} is doing.
              </p>
              ${statCols}
              <div style="margin-top:22px;">
                <a href="${appUrl}/select"
                   style="display:inline-block;background-color:#E74C3C;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 24px;font-size:14px;font-weight:700;">
                  Continue lessons &rarr;
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td bgcolor="#ffffff" style="border-radius:0 0 16px 16px;padding:16px 32px 28px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#cbd5e1;text-align:center;">
                <a href="${appUrl}/account" style="color:#94a3b8;text-decoration:underline;">Manage notifications</a>
                &nbsp;&middot;&nbsp;
                <a href="${appUrl}/privacy" style="color:#94a3b8;text-decoration:underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, text, html }
}
