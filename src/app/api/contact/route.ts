import { NextResponse, type NextRequest } from 'next/server'
import { resend } from '@/lib/email/resend'

const FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL ?? 'support@mathkix.com'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? ''

// Simple in-memory rate limiting (per IP, 5 submissions per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }
  entry.count++
  return entry.count > 5
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
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
      subject: `[Contact Form] Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 3px solid #ddd; padding-left: 12px; color: #555;">
          ${message.replace(/\n/g, '<br>')}
        </blockquote>
      `,
    })
  } catch (e) {
    console.error('Failed to send contact form email:', e)
  }

  return NextResponse.json({ ok: true })
}
