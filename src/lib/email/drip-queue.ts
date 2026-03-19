/**
 * Drip email queue helpers.
 * All writes use the service-role client so they bypass RLS.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/database'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mathkix.com'

// ── sequence keys ────────────────────────────────────────────────────────────
export const DRIP_KEYS = {
  WELCOME:                 'welcome',
  CHILD_ADDED_NUDGE:       'child_added_nudge',
  PLACEMENT_COMPLETE:      'placement_complete',
  FIRST_LESSON_COMPLETE:   'first_lesson_complete',
  ONBOARDING_DAY3:         'onboarding_day3',
  ONBOARDING_DAY7:         'onboarding_day7',
  FEATURE_DAY10:           'feature_day10',
  MIDTRIAL_DAY14:          'midtrial_day14',
  TRIAL_EXPIRING_7:        'trial_expiring_7',
  TRIAL_EXPIRING_3:        'trial_expiring_3',
  TRIAL_EXPIRING_1:        'trial_expiring_1',
  TRIAL_ENDED:             'trial_ended',
  WELCOME_PAID:            'welcome_paid',
  REENGAGEMENT_7DAY:       'reengagement_7day',
} as const

export type DripKey = (typeof DRIP_KEYS)[keyof typeof DRIP_KEYS]

// Trial-expiry keys that get cancelled on paid conversion
const TRIAL_EXPIRY_KEYS: DripKey[] = [
  DRIP_KEYS.TRIAL_EXPIRING_7,
  DRIP_KEYS.TRIAL_EXPIRING_3,
  DRIP_KEYS.TRIAL_EXPIRING_1,
  DRIP_KEYS.TRIAL_ENDED,
]

// ── low-level insert (idempotent via ON CONFLICT DO NOTHING) ─────────────────
export async function enqueueEmail(
  profileId: string,
  sequenceKey: DripKey,
  sendAt: Date,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const admin = createAdminClient()
  await admin.from('email_queue').upsert(
    { profile_id: profileId, sequence_key: sequenceKey, send_at: sendAt.toISOString(), metadata: metadata as unknown as Json },
    { onConflict: 'profile_id,sequence_key', ignoreDuplicates: true },
  )
}

// ── enqueue the full onboarding + trial nurture + conversion series ───────────
export async function enqueueDripSeries(
  profileId: string,
  trialEnd: Date,
  parentFirstName?: string | null,
): Promise<void> {
  const now = new Date()

  const meta = { appUrl: APP_URL, parentFirstName: parentFirstName ?? null }

  // Welcome — immediate
  await enqueueEmail(profileId, DRIP_KEYS.WELCOME, now, meta)

  // Nurture drip — relative to signup (now)
  const day = (n: number) => new Date(now.getTime() + n * 86_400_000)

  await enqueueEmail(profileId, DRIP_KEYS.ONBOARDING_DAY3,  day(3),  meta)
  await enqueueEmail(profileId, DRIP_KEYS.ONBOARDING_DAY7,  day(7),  meta)
  await enqueueEmail(profileId, DRIP_KEYS.FEATURE_DAY10,    day(10), meta)
  await enqueueEmail(profileId, DRIP_KEYS.MIDTRIAL_DAY14,   day(14), meta)

  // Trial conversion — relative to trial_end
  const daysBeforeEnd = (n: number) => new Date(trialEnd.getTime() - n * 86_400_000)

  await enqueueEmail(profileId, DRIP_KEYS.TRIAL_EXPIRING_7, daysBeforeEnd(7), meta)
  await enqueueEmail(profileId, DRIP_KEYS.TRIAL_EXPIRING_3, daysBeforeEnd(3), meta)
  await enqueueEmail(profileId, DRIP_KEYS.TRIAL_EXPIRING_1, daysBeforeEnd(1), meta)
  await enqueueEmail(profileId, DRIP_KEYS.TRIAL_ENDED,      trialEnd,         meta)
}

// ── cancel trial-expiry emails when user converts ───────────────────────────
export async function cancelTrialEmails(profileId: string): Promise<void> {
  const admin = createAdminClient()
  await admin
    .from('email_queue')
    .update({ cancelled_at: new Date().toISOString() })
    .eq('profile_id', profileId)
    .in('sequence_key', TRIAL_EXPIRY_KEYS)
    .is('sent_at', null)
    .is('cancelled_at', null)
}
