// ============================================================
// Algorithm Decision Logger
//
// Structured console logging for all adaptive algorithm decisions.
// Output goes to Vercel Functions logs (visible in dashboard).
//
// Log format: [ALGO:{component}] {message} {data}
//
// Components:
//   PREREQ    — prerequisite engine decisions
//   MODALITY  — modality selection decisions
//   COMPOSER  — session composition decisions
//   PROFILER  — learning profile updates
//   ENGINE    — question selection decisions
//   SESSION   — session start/complete lifecycle
// ============================================================

type LogComponent = 'PREREQ' | 'MODALITY' | 'COMPOSER' | 'PROFILER' | 'ENGINE' | 'SESSION'

interface LogEntry {
  component: LogComponent
  action: string
  childId?: string
  sessionId?: string
  data?: Record<string, unknown>
}

/**
 * Log an algorithm decision to Vercel console.
 * Structured as JSON for easy filtering in Vercel dashboard.
 */
export function logDecision(entry: LogEntry): void {
  const tag = `[ALGO:${entry.component}]`
  const context = [
    entry.childId ? `child=${entry.childId.slice(0, 8)}` : null,
    entry.sessionId ? `session=${entry.sessionId.slice(0, 8)}` : null,
  ].filter(Boolean).join(' ')

  const prefix = context ? `${tag} ${context}` : tag

  console.log(`${prefix} ${entry.action}`, entry.data ? JSON.stringify(entry.data) : '')
}

/**
 * Log a summary table (for multi-item decisions like standard priorities).
 */
export function logTable(
  component: LogComponent,
  action: string,
  rows: Array<Record<string, unknown>>,
  childId?: string,
): void {
  const tag = `[ALGO:${component}]`
  const ctx = childId ? ` child=${childId.slice(0, 8)}` : ''
  console.log(`${tag}${ctx} ${action} (${rows.length} items):`)
  for (const row of rows.slice(0, 10)) { // cap at 10 rows
    console.log(`  ${JSON.stringify(row)}`)
  }
  if (rows.length > 10) console.log(`  ... and ${rows.length - 10} more`)
}

/**
 * Log profile dimension changes after profiler runs.
 */
export function logProfileChanges(
  childId: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
): void {
  const tag = '[ALGO:PROFILER]'
  const ctx = `child=${childId.slice(0, 8)}`

  if (!before || !Object.keys(before).length) {
    console.log(`${tag} ${ctx} initialized_profile (first session)`)
    return
  }

  const changes: string[] = []
  for (const key of Object.keys(after)) {
    const beforeDim = (before as Record<string, { value?: unknown; confidence?: number }>)[key]
    const afterDim = (after as Record<string, { value?: unknown; confidence?: number }>)[key]
    if (!beforeDim || !afterDim) continue
    if (beforeDim.value !== afterDim.value) {
      changes.push(`${key}: ${String(beforeDim.value)} → ${String(afterDim.value)} (conf: ${afterDim.confidence?.toFixed(2)})`)
    } else if (beforeDim.confidence !== afterDim.confidence) {
      changes.push(`${key}: reinforced ${String(afterDim.value)} (conf: ${beforeDim.confidence?.toFixed(2)} → ${afterDim.confidence?.toFixed(2)})`)
    }
  }

  if (changes.length === 0) {
    console.log(`${tag} ${ctx} no_dimension_changes`)
  } else {
    console.log(`${tag} ${ctx} profile_updated (${changes.length} changes):`)
    for (const c of changes) console.log(`  ${c}`)
  }
}
