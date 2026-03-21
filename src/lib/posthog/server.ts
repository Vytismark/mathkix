import { PostHog } from 'posthog-node'

/**
 * Fire a server-side PostHog event from an API route or webhook.
 * Creates a one-shot client per call (required for serverless).
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!apiKey) return

  const client = new PostHog(apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  })

  try {
    client.capture({ distinctId, event, properties })
    await client.shutdown()
  } catch {
    // Non-critical - never fail the primary request
  }
}
