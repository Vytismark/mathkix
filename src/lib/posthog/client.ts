import posthog from 'posthog-js'

export { posthog }

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (typeof window === 'undefined') return
  posthog.capture(event, properties)
}
