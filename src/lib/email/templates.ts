import { resend } from './resend'

const FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL ?? 'support@mathkix.com'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? ''

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
        <h2>Ticket Escalated — Human Response Needed</h2>
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
      subject: `Re: ${ticketSubject} — MathKix Support`,
      html: `
        <p>Hi ${parentName ?? 'there'},</p>
        <p>Our support team has replied to your ticket: <strong>${ticketSubject}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/support">View your ticket</a></p>
        <p>— The MathKix Team</p>
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
      subject: `Resolved: ${ticketSubject} — MathKix Support`,
      html: `
        <p>Hi ${parentName ?? 'there'},</p>
        <p>Your support ticket <strong>${ticketSubject}</strong> has been marked as resolved.</p>
        <p>If you still need help, you can reply by <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/support">opening a new ticket</a>.</p>
        <p>— The MathKix Team</p>
      `,
    })
  } catch (e) {
    console.error('Failed to send ticket resolved email:', e)
  }
}
