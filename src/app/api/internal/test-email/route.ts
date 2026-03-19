/**
 * DEV-ONLY test route for the email drip system.
 * Never ship this in production — it bypasses auth.
 *
 * GET /api/internal/test-email?key=welcome&send=false
 *
 * Query params:
 *   key    — sequence_key to render (required)
 *   send   — "true" to actually send via Resend, omit to just preview
 *   to     — override recipient email (required if send=true)
 *   enqueue — "true" to insert into email_queue for the signed-in user's profileId
 *   profileId — profile UUID to use for enqueue test
 */

import { NextResponse, type NextRequest } from 'next/server'
import { DRIP_KEYS, enqueueEmail, enqueueDripSeries, cancelTrialEmails } from '@/lib/email/drip-queue'
import { resend } from '@/lib/email/resend'

// Template renderers
import { render as renderWelcome }             from '@/lib/email/drip/welcome'
import { render as renderChildAddedNudge }      from '@/lib/email/drip/child-added-nudge'
import { render as renderPlacementComplete }    from '@/lib/email/drip/placement-complete'
import { render as renderFirstLessonComplete }  from '@/lib/email/drip/first-lesson-complete'
import { render as renderOnboardingDay3 }       from '@/lib/email/drip/onboarding-day3'
import { render as renderOnboardingDay7 }       from '@/lib/email/drip/onboarding-day7'
import { render as renderFeatureDay10 }         from '@/lib/email/drip/feature-day10'
import { render as renderMidtrialDay14 }        from '@/lib/email/drip/midtrial-day14'
import { render as renderTrialExpiring7 }       from '@/lib/email/drip/trial-expiring-7'
import { render as renderTrialExpiring3 }       from '@/lib/email/drip/trial-expiring-3'
import { render as renderTrialExpiring1 }       from '@/lib/email/drip/trial-expiring-1'
import { render as renderTrialEnded }           from '@/lib/email/drip/trial-ended'
import { render as renderWelcomePaid }          from '@/lib/email/drip/welcome-paid'
import { render as renderReengagement7day }     from '@/lib/email/drip/reengagement-7day'
import type { DripKey } from '@/lib/email/drip-queue'

if (process.env.NODE_ENV === 'production') {
  throw new Error('test-email route must not be used in production')
}

const RENDERERS: Record<DripKey, (meta: Record<string, unknown>) => { subject: string; text: string; html?: string }> = {
  [DRIP_KEYS.WELCOME]:               renderWelcome,
  [DRIP_KEYS.CHILD_ADDED_NUDGE]:     renderChildAddedNudge,
  [DRIP_KEYS.PLACEMENT_COMPLETE]:    renderPlacementComplete,
  [DRIP_KEYS.FIRST_LESSON_COMPLETE]: renderFirstLessonComplete,
  [DRIP_KEYS.ONBOARDING_DAY3]:       renderOnboardingDay3,
  [DRIP_KEYS.ONBOARDING_DAY7]:       renderOnboardingDay7,
  [DRIP_KEYS.FEATURE_DAY10]:         renderFeatureDay10,
  [DRIP_KEYS.MIDTRIAL_DAY14]:        renderMidtrialDay14,
  [DRIP_KEYS.TRIAL_EXPIRING_7]:      renderTrialExpiring7,
  [DRIP_KEYS.TRIAL_EXPIRING_3]:      renderTrialExpiring3,
  [DRIP_KEYS.TRIAL_EXPIRING_1]:      renderTrialExpiring1,
  [DRIP_KEYS.TRIAL_ENDED]:           renderTrialEnded,
  [DRIP_KEYS.WELCOME_PAID]:          renderWelcomePaid,
  [DRIP_KEYS.REENGAGEMENT_7DAY]:     renderReengagement7day,
}

// Sample metadata for each key — gives realistic preview output
const SAMPLE_META: Record<DripKey, Record<string, unknown>> = {
  [DRIP_KEYS.WELCOME]:               { parentFirstName: 'Alex' },
  [DRIP_KEYS.CHILD_ADDED_NUDGE]:     { childName: 'Sam', grade: 2 },
  [DRIP_KEYS.PLACEMENT_COMPLETE]:    { childName: 'Sam', assessedGrade: 2 },
  [DRIP_KEYS.FIRST_LESSON_COMPLETE]: { childName: 'Sam', xpEarned: 50 },
  [DRIP_KEYS.ONBOARDING_DAY3]:       { parentFirstName: 'Alex' },
  [DRIP_KEYS.ONBOARDING_DAY7]:       { parentFirstName: 'Alex', childName: 'Sam', lessonCount: 4, xpTotal: 200 },
  [DRIP_KEYS.FEATURE_DAY10]:         { parentFirstName: 'Alex' },
  [DRIP_KEYS.MIDTRIAL_DAY14]:        { parentFirstName: 'Alex', childName: 'Sam', lessonCount: 8, xpTotal: 450, streakDays: 5 },
  [DRIP_KEYS.TRIAL_EXPIRING_7]:      { parentFirstName: 'Alex', childName: 'Sam', xpTotal: 500, lessonCount: 10 },
  [DRIP_KEYS.TRIAL_EXPIRING_3]:      { parentFirstName: 'Alex', childName: 'Sam', xpTotal: 600, streakDays: 7 },
  [DRIP_KEYS.TRIAL_EXPIRING_1]:      { parentFirstName: 'Alex', childName: 'Sam' },
  [DRIP_KEYS.TRIAL_ENDED]:           { parentFirstName: 'Alex', childName: 'Sam' },
  [DRIP_KEYS.WELCOME_PAID]:          { parentFirstName: 'Alex', planType: 'annual' },
  [DRIP_KEYS.REENGAGEMENT_7DAY]:     { parentFirstName: 'Alex', childName: 'Sam', xpTotal: 300 },
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key') as DripKey | null
  const shouldSend = searchParams.get('send') === 'true'
  const to = searchParams.get('to')
  const shouldEnqueue = searchParams.get('enqueue') === 'true'
  const profileId = searchParams.get('profileId')
  const action = searchParams.get('action') // 'list', 'cancel-trial', 'enqueue-series'

  // ── action-based routes (no key needed) ───────────────────────────────────
  if (action === 'list') {
    return NextResponse.json({ keys: Object.values(DRIP_KEYS) })
  }

  if (action === 'cancel-trial') {
    if (!profileId) return NextResponse.json({ error: 'profileId required' }, { status: 400 })
    await cancelTrialEmails(profileId)
    return NextResponse.json({ ok: true, action: 'cancelled trial emails', profileId })
  }

  if (action === 'enqueue-series') {
    if (!profileId) return NextResponse.json({ error: 'profileId required' }, { status: 400 })
    const trialEnd = new Date(Date.now() + 30 * 86_400_000)
    await enqueueDripSeries(profileId, trialEnd, 'TestUser')
    return NextResponse.json({ ok: true, action: 'enqueued drip series', profileId, trialEnd })
  }

  // ── key required below this point ─────────────────────────────────────────
  if (!key) {
    return NextResponse.json({ keys: Object.values(DRIP_KEYS) })
  }

  const renderer = RENDERERS[key]
  if (!renderer) {
    return NextResponse.json({ error: `Unknown key: ${key}`, validKeys: Object.values(DRIP_KEYS) }, { status: 400 })
  }

  const meta = SAMPLE_META[key] ?? {}
  const { subject, text, html } = renderer(meta)

  // ── enqueue a single email ─────────────────────────────────────────────────
  if (shouldEnqueue) {
    if (!profileId) return NextResponse.json({ error: 'profileId required for enqueue' }, { status: 400 })
    await enqueueEmail(profileId, key, new Date(), meta)
    return NextResponse.json({ ok: true, action: 'enqueued', key, profileId })
  }

  // ── send immediately via Resend ────────────────────────────────────────────
  if (shouldSend) {
    if (!to) return NextResponse.json({ error: 'to= email required when send=true' }, { status: 400 })
    const fromEmail = `MathKix <${process.env.SUPPORT_FROM_EMAIL ?? 'hello@mathkix.com'}>`
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
    })
    return NextResponse.json({ ok: true, subject, to })
  }

  // ── preview only (no send) ─────────────────────────────────────────────────
  if (html) {
    return new Response(html, { headers: { 'Content-Type': 'text/html' } })
  }
  return new Response(`Subject: ${subject}\n\n${text}`, { headers: { 'Content-Type': 'text/plain' } })
}
