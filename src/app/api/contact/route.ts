import { NextResponse, type NextRequest } from 'next/server'
import { resend } from '@/lib/email/resend'
import { isRateLimited } from '@/lib/rate-limit'
import { escapeHtml } from '@/lib/security'

const FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL ?? 'support@mathkix.com'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? ''

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip, { namespace: 'contact-form', maxRequests: 5, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const body = await request.json()
  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const message = String(body.message ?? '').trim()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (message.length < 10) {
    return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (!ADMIN_EMAIL) {
    console.error('ADMIN_NOTIFICATION_EMAIL not set — contact form submission dropped')
    return NextResponse.json({ ok: true })
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `[Contact Form] Message from ${escapeHtml(name)}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 3px solid #ddd; padding-left: 12px; color: #555;">
          ${escapeHtml(message).replace(/\n/g, '<br>')}
        </blockquote>
      `,
    })
  } catch (e) {
    console.error('Failed to send contact form email:', e)
  }

  return NextResponse.json({ ok: true })
}
