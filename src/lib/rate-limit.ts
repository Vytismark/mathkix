// Simple in-memory rate limiter for API routes
// Not suitable for multi-instance deployments - use Redis in production

interface RateLimitEntry {
  count: number
  resetAt: number
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

interface RateLimitOptions {
  /** Unique namespace for this limiter (e.g. 'admin-login', 'export-data') */
  namespace: string
  /** Max requests allowed within the window */
  maxRequests: number
  /** Window duration in milliseconds */
  windowMs: number
}

export function isRateLimited(key: string, opts: RateLimitOptions): boolean {
  if (!stores.has(opts.namespace)) {
    stores.set(opts.namespace, new Map())
  }
  const store = stores.get(opts.namespace)!
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs })
    return false
  }

  entry.count++
  return entry.count > opts.maxRequests
}
