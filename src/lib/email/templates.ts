import { resend } from './resend'

const FROM_EMAIL = `MathKix <${process.env.SUPPORT_FROM_EMAIL ?? 'hello@mathkix.com'}>`
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? ''

/* ─── Weekly report types ──────────────────────────────────────────────── */
export interface WeeklyReportChild {
  id: string
  name: string
  avatar_id: string
  school_grade: number | null
  streak_days: number
  weekXP: number
  weekLessons: number
  weekAvgScore: number | null
  achievements: { title: string; icon_slug: string | null; achievement_type: string | null }[]
  hasActivity: boolean
}

export interface WeeklyReportParams {
  parentEmail: string
  parentName: string | null
  weekLabel: string
  children: WeeklyReportChild[]
  appUrl: string
}

/* ─── HTML helpers ─────────────────────────────────────────────────────── */
function esc(s: string | null | undefined): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const AVATAR_EMOJI: Record<string, string> = {
  bear: '🐻', cat: '🐱', dog: '🐶', fox: '🦊',
  owl: '🦉', penguin: '🐧', rabbit: '🐰', tiger: '🐯',
}

const ACH_EMOJI: Record<string, string> = {
  fire: '🔥', star: '⭐', trophy: '🏆', brain: '🧠',
  lightning: '⚡', rocket: '🚀', gem: '💎', medal: '🥇',
  streak: '🔥', mastery: '🏆', performance: '⭐',
  consistency: '📅', spaced_repetition: '🧠',
}

function achEmoji(slug: string | null, type: string | null): string {
  if (slug && ACH_EMOJI[slug]) return ACH_EMOJI[slug]
  if (type && ACH_EMOJI[type]) return ACH_EMOJI[type]
  return '🏅'
}

const GRADE_LABELS: Record<number, string> = {
  0: 'Kindergarten', 1: 'Grade 1', 2: 'Grade 2', 3: 'Grade 3', 4: 'Grade 4', 5: 'Grade 5',
}

/* ─── Child card HTML ──────────────────────────────────────────────────── */
function childCardHtml(child: WeeklyReportChild, appUrl: string): string {
  const avatar = AVATAR_EMOJI[child.avatar_id] ?? '😊'
  const grade = child.school_grade !== null ? (GRADE_LABELS[child.school_grade] ?? `Grade ${child.school_grade}`) : ''

  const statsHtml = child.hasActivity ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td align="center" style="padding:12px 6px;background-color:#fff7ed;border-radius:8px;width:32%;">
          <div style="font-size:20px;font-weight:800;color:#c2410c;line-height:1;">${child.weekXP.toLocaleString()}</div>
          <div style="font-size:11px;color:#9a3412;margin-top:3px;">XP earned</div>
        </td>
        <td width="2%"></td>
        <td align="center" style="padding:12px 6px;background-color:#f0fdf4;border-radius:8px;width:32%;">
          <div style="font-size:20px;font-weight:800;color:#15803d;line-height:1;">${child.weekLessons}</div>
          <div style="font-size:11px;color:#166534;margin-top:3px;">Lesson${child.weekLessons !== 1 ? 's' : ''}</div>
        </td>
        <td width="2%"></td>
        <td align="center" style="padding:12px 6px;background-color:#eff6ff;border-radius:8px;width:32%;">
          <div style="font-size:20px;font-weight:800;color:#1d4ed8;line-height:1;">${child.weekAvgScore !== null ? `${child.weekAvgScore}%` : '-'}</div>
          <div style="font-size:11px;color:#1e40af;margin-top:3px;">Accuracy</div>
        </td>
      </tr>
    </table>` : `
    <p style="margin:12px 0 0;font-size:13px;color:#94a3b8;font-style:italic;">
      No practice this week - a great time to jump back in! 💪
    </p>`

  const streakHtml = child.streak_days > 0 ? `
    <p style="margin:12px 0 0;font-size:13px;color:#ea580c;font-weight:600;">
      🔥 ${child.streak_days}-day streak - keep it going!
    </p>` : ''

  const achHtml = child.achievements.length > 0 ? `
    <div style="margin-top:12px;">
      <div style="font-size:12px;font-weight:600;color:#6b7280;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;">This week&apos;s achievements</div>
      ${child.achievements.map((a) => `
        <span style="display:inline-block;background-color:#fef9c3;border:1px solid #fde047;border-radius:20px;padding:4px 12px;font-size:12px;color:#713f12;margin:2px 3px 2px 0;">
          ${achEmoji(a.icon_slug, a.achievement_type)} ${esc(a.title)}
        </span>`).join('')}
    </div>` : ''

  const ctaHtml = `
    <div style="margin-top:18px;">
      <a href="${appUrl}/children/${child.id}/progress"
         style="display:inline-block;background-color:#3678FF;color:#ffffff;text-decoration:none;border-radius:8px;padding:11px 22px;font-size:13px;font-weight:700;letter-spacing:0.01em;">
        View ${esc(child.name)}&apos;s progress &rarr;
      </a>
    </div>`

  return `
    <tr>
      <td bgcolor="#ffffff" style="background-color:#ffffff;padding:6px 32px 10px;">
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;">
          <tr>
            <td style="padding:22px 24px;">
              <!-- Child header -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:32px;line-height:1;vertical-align:middle;padding-right:12px;">${avatar}</td>
                  <td style="vertical-align:middle;">
                    <div style="font-size:17px;font-weight:800;color:#0f172a;">${esc(child.name)}</div>
                    ${grade ? `<div style="font-size:12px;color:#94a3b8;margin-top:2px;">${grade}</div>` : ''}
                  </td>
                </tr>
              </table>
              ${statsHtml}
              ${streakHtml}
              ${achHtml}
              ${ctaHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

/* ─── Full email HTML ──────────────────────────────────────────────────── */
function buildWeeklyReportHtml(params: WeeklyReportParams): string {
  const { parentName, weekLabel, children, appUrl } = params
  const firstName = esc(parentName?.split(' ')[0] ?? 'there')
  const totalXP = children.reduce((s, c) => s + c.weekXP, 0)
  const totalLessons = children.reduce((s, c) => s + c.weekLessons, 0)
  const childCardsHtml = children.map((c) => childCardHtml(c, appUrl)).join('')

  // Summary sentence for the greeting
  const summaryParts: string[] = []
  if (totalXP > 0) summaryParts.push(`<strong>${totalXP.toLocaleString()} XP earned</strong>`)
  if (totalLessons > 0) summaryParts.push(`<strong>${totalLessons} lesson${totalLessons !== 1 ? 's' : ''} completed</strong>`)
  const summaryLine = summaryParts.length > 0
    ? `This week: ${summaryParts.join(' · ')}.`
    : `Check in on your kids&apos; progress below.`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>MathKix Weekly Progress Report</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f1f5f9" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td bgcolor="#07080f" style="background-color:#07080f;border-radius:16px 16px 0 0;padding:26px 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Math<span style="color:#3678FF;">Kix</span></span>
                    <div style="font-size:13px;color:#64748b;margin-top:5px;letter-spacing:0.02em;">📊 &nbsp;WEEKLY PROGRESS REPORT</div>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <div style="font-size:12px;color:#475569;">${esc(weekLabel)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:28px 32px 16px;">
              <p style="margin:0 0 8px;font-size:21px;font-weight:800;color:#0f172a;line-height:1.3;">Hi ${firstName}! 👋</p>
              <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">${summaryLine}</p>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:0 32px;">
              <div style="height:1px;background-color:#f1f5f9;"></div>
            </td>
          </tr>

          <!-- CHILD CARDS -->
          ${childCardsHtml}

          <!-- SPACER -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:8px 0 0;"></td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;border-radius:0 0 16px 16px;padding:20px 32px 28px;border-top:1px solid #f1f5f9;">
              <p style="margin:0 0 10px;font-size:13px;color:#94a3b8;text-align:center;">
                Keep up the great work - every lesson counts! 🌟
              </p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;text-align:center;line-height:2;">
                <a href="${appUrl}/account" style="color:#94a3b8;text-decoration:underline;">Manage notifications</a>
                &nbsp;&middot;&nbsp;
                <a href="${appUrl}/privacy" style="color:#94a3b8;text-decoration:underline;">Privacy Policy</a>
                &nbsp;&middot;&nbsp;
                <a href="${appUrl}/terms" style="color:#94a3b8;text-decoration:underline;">Terms</a>
              </p>
              <p style="margin:10px 0 0;font-size:11px;color:#e2e8f0;text-align:center;">
                MathKix &middot; COPPA compliant &middot; We never sell personal data
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/* ─── Send function ────────────────────────────────────────────────────── */
export async function sendWeeklyReportEmail(params: WeeklyReportParams): Promise<void> {
  const { parentEmail, children } = params
  const totalXP = children.reduce((s, c) => s + c.weekXP, 0)
  const totalLessons = children.reduce((s, c) => s + c.weekLessons, 0)

  // Build engaging subject line from actual data
  let subject: string
  if (children.length === 1) {
    const c = children[0]
    if (c.weekXP > 0) {
      subject = `🌟 ${c.name} earned ${c.weekXP.toLocaleString()} XP this week · MathKix`
    } else {
      subject = `📊 ${c.name}'s weekly progress · MathKix`
    }
  } else {
    if (totalXP > 0) {
      subject = `🌟 Your kids earned ${totalXP.toLocaleString()} XP this week · MathKix`
    } else if (totalLessons > 0) {
      subject = `📊 ${totalLessons} lesson${totalLessons !== 1 ? 's' : ''} completed this week · MathKix`
    } else {
      subject = `📊 Your family's weekly progress · MathKix`
    }
  }

  const html = buildWeeklyReportHtml(params)

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: parentEmail,
      subject,
      html,
    })
  } catch (e) {
    console.error(`Failed to send weekly report to ${parentEmail}:`, e)
    throw e
  }
}

export async function sendNewTicketEmail(ticket: {
  id: string
  subject: string
  description: string
  parentName: string | null
  parentEmail: string
}) {
  if (!ADMIN_EMAIL) return
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[New Ticket] ${ticket.subject}`,
      html: `
        <h2>New Support Ticket</h2>
        <p><strong>From:</strong> ${ticket.parentName ?? 'Unknown'} (${ticket.parentEmail})</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 3px solid #ddd; padding-left: 12px; color: #555;">
          ${ticket.description.replace(/\n/g, '<br>')}
        </blockquote>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/admin/support/${ticket.id}">View in Admin Dashboard</a></p>
      `,
    })
  } catch (e) {
    console.error('Failed to send new ticket email:', e)
  }
}

export async function sendEscalationEmail(ticket: {
  id: string
  subject: string
  escalation_reason: string | null
  parentName: string | null
  parentEmail: string
}) {
  if (!ADMIN_EMAIL) return
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[Escalated] ${ticket.subject}`,
      html: `
        <h2>Ticket Escalated - Human Response Needed</h2>
        <p><strong>From:</strong> ${ticket.parentName ?? 'Unknown'} (${ticket.parentEmail})</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Reason:</strong> ${ticket.escalation_reason ?? 'AI could not resolve'}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/admin/support/${ticket.id}">View in Admin Dashboard</a></p>
      `,
    })
  } catch (e) {
    console.error('Failed to send escalation email:', e)
  }
}

export async function sendAdminReplyEmail(
  parentEmail: string,
  parentName: string | null,
  ticketSubject: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: parentEmail,
      subject: `Re: ${ticketSubject} - MathKix Support`,
      html: `
        <p>Hi ${parentName ?? 'there'},</p>
        <p>Our support team has replied to your ticket: <strong>${ticketSubject}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/support">View your ticket</a></p>
        <p>The MathKix Team</p>
      `,
    })
  } catch (e) {
    console.error('Failed to send admin reply email:', e)
  }
}

export async function sendTicketResolvedEmail(
  parentEmail: string,
  parentName: string | null,
  ticketSubject: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: parentEmail,
      subject: `Resolved: ${ticketSubject} - MathKix Support`,
      html: `
        <p>Hi ${parentName ?? 'there'},</p>
        <p>Your support ticket <strong>${ticketSubject}</strong> has been marked as resolved.</p>
        <p>If you still need help, you can reply by <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/support">opening a new ticket</a>.</p>
        <p>The MathKix Team</p>
      `,
    })
  } catch (e) {
    console.error('Failed to send ticket resolved email:', e)
  }
}
