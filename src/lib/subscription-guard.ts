import { getTrialState } from '@/lib/trial'
import { NextResponse } from 'next/server'

/**
 * Checks if a user has an active subscription or trial.
 * Returns null if access is allowed, or a NextResponse 403 if not.
 */
export async function requireActiveSubscription(userId: string): Promise<NextResponse | null> {
  const trialState = await getTrialState(userId)

  if (trialState.status === 'expired') {
    return NextResponse.json(
      {
        error: 'Your free trial has expired. Please upgrade to continue.',
        code: 'SUBSCRIPTION_REQUIRED',
      },
      { status: 403 },
    )
  }

  return null
}
