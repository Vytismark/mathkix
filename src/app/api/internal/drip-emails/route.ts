import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/email/resend'
import { enqueueEmail, DRIP_KEYS, type DripKey } from '@/lib/email/drip-queue'

// Template renderers - one per sequence_key
import { render as renderWelcome }               from '@/lib/email/drip/welcome'
import { render as renderChildAddedNudge }        from '@/lib/email/drip/child-added-nudge'
import { render as renderPlacementComplete }      from '@/lib/email/drip/placement-complete'
import { render as renderFirstLessonComplete }    from '@/lib/email/drip/first-lesson-complete'
import { render as renderOnboardingDay3 }         from '@/lib/email/drip/onboarding-day3'
import { render as renderOnboardingDay7 }         from '@/lib/email/drip/onboarding-day7'
import { render as renderFeatureDay10 }           from '@/lib/email/drip/feature-day10'
import { render as renderMidtrialDay14 }          from '@/lib/email/drip/midtrial-day14'
import { render as renderTrialExpiring7 }         from '@/lib/email/drip/trial-expiring-7'
import { render as renderTrialExpiring3 }         from '@/lib/email/drip/trial-expiring-3'
import { render as renderTrialExpiring1 }         from '@/lib/email/drip/trial-expiring-1'
import { render as renderTrialEnded }             from '@/lib/email/drip/trial-ended'
import { render as renderWelcomePaid }            from '@/lib/email/drip/welcome-paid'
import { render as renderReengagement7day }       from '@/lib/email/drip/reengagement-7day'

const FROM_EMAIL = `MathKix <${process.env.SUPPORT_FROM_EMAIL ?? 'hello@mathkix.com'}>`
const BATCH_SIZE = 50

type RenderFn = (meta: Record<string, unknown>) => { subject: string; text: string; html?: string }

const RENDERERS: Record<DripKey, RenderFn> = {
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

export async function POST(request: Request) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date().toISOString()

  // ── 1. Enqueue re-engagement emails for inactive users ─────────────────────
  await enqueueReengagementEmails(admin)

  // ── 2. Fetch pending emails due for sending ────────────────────────────────
  const { data: pending, error: fetchError } = await admin
    .from('email_queue')
    .select('id, profile_id, sequence_key, metadata')
    .lte('send_at', now)
    .is('sent_at', null)
    .is('cancelled_at', null)
    .is('failed_at', null)
    .order('send_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (fetchError) {
    console.error('drip-emails: failed to fetch pending queue:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, total: 0 })
  }

  // Fetch profile emails + first child stats for all unique profile IDs in batch
  const profileIds = [...new Set(pending.map((r) => r.profile_id))]
  const [{ data: profiles }, { data: children }] = await Promise.all([
    admin
      .from('profiles')
      .select('id, email, full_name, notification_preferences')
      .in('id', profileIds),
    admin
      .from('children')
      .select('id, profile_id, name, school_grade, xp_total, streak_days, last_active')
      .in('profile_id', profileIds)
      .order('created_at', { ascending: true }),
  ])

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  )

  // Fetch live lesson counts for all children in one query
  const allChildIds = (children ?? []).map((c) => c.id)
  const { data: attempts } = allChildIds.length > 0
    ? await admin
        .from('lesson_attempts')
        .select('child_id')
        .eq('status', 'completed')
        .in('child_id', allChildIds)
    : { data: [] as { child_id: string }[] }

  const lessonCountByChild = new Map<string, number>()
  for (const a of attempts ?? []) {
    lessonCountByChild.set(a.child_id, (lessonCountByChild.get(a.child_id) ?? 0) + 1)
  }

  // First child per profile with live lesson count
  const childMap = new Map<string, {
    name: string; school_grade: number | null
    xp_total: number; streak_days: number; lessonCount: number
  }>()
  for (const child of children ?? []) {
    if (!childMap.has(child.profile_id)) {
      childMap.set(child.profile_id, {
        name:        child.name,
        school_grade: child.school_grade,
        xp_total:    child.xp_total ?? 0,
        streak_days: child.streak_days ?? 0,
        lessonCount: lessonCountByChild.get(child.id) ?? 0,
      })
    }
  }

  let sent = 0
  let failed = 0

  for (const row of pending) {
    const profile = profileMap.get(row.profile_id)
    if (!profile?.email) {
      // Mark failed - no email address
      await admin
        .from('email_queue')
        .update({ failed_at: now, error: 'no_email' })
        .eq('id', row.id)
      failed++
      continue
    }

    // All drip emails are lifecycle emails (onboarding, trial, re-engagement) - not marketing.
    // We do not gate them on product_updates. A future `lifecycle_emails` preference key
    // could be added here when explicit opt-out is needed.

    const renderer = RENDERERS[row.sequence_key as DripKey]
    if (!renderer) {
      await admin
        .from('email_queue')
        .update({ failed_at: now, error: `unknown_sequence_key:${row.sequence_key}` })
        .eq('id', row.id)
      failed++
      continue
    }

    // Build metadata: enqueue-time base + live profile + live child stats
    // Live data always wins over stale enqueue-time values for child fields
    const firstName = profile.full_name?.split(' ')[0] ?? null
    const child = childMap.get(row.profile_id)
    const meta: Record<string, unknown> = {
      ...(row.metadata as Record<string, unknown>),
      parentFirstName: firstName,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://mathkix.com',
      // Live child data - always overrides stale enqueue-time values
      ...(child ? {
        childName:   child.name,
        grade:       child.school_grade,
        xpTotal:     child.xp_total,
        streakDays:  child.streak_days,
        lessonCount: child.lessonCount,
      } : {}),
    }

    try {
      const { subject, text, html } = renderer(meta)
      await resend.emails.send({
        from: FROM_EMAIL,
        to: profile.email,
        subject,
        text,
        ...(html ? { html } : {}),
      })
      await admin
        .from('email_queue')
        .update({ sent_at: now })
        .eq('id', row.id)
      sent++
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      await admin
        .from('email_queue')
        .update({ failed_at: now, error: msg.slice(0, 500) })
        .eq('id', row.id)
      failed++
    }
  }

  console.log(`drip-emails: sent=${sent} failed=${failed} total=${pending.length}`)
  return NextResponse.json({ sent, failed, total: pending.length })
}

// ── Re-engagement: users with no lesson in 7 days ──────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function enqueueReengagementEmails(admin: ReturnType<typeof createAdminClient>) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()

  // Find children with last_active older than 7 days (or never)
  const { data: staleChildren } = await admin
    .from('children')
    .select('id, profile_id, name, xp_total, last_active')
    .or(`last_active.lt.${sevenDaysAgo},last_active.is.null`)
    .limit(200)

  if (!staleChildren?.length) return

  for (const child of staleChildren) {
    await enqueueEmail(
      child.profile_id,
      DRIP_KEYS.REENGAGEMENT_7DAY,
      new Date(),
      {
        childName: child.name,
        xpTotal:   child.xp_total ?? 0,
      },
    ).catch(() => { /* ignore duplicate key errors */ })
  }
}
