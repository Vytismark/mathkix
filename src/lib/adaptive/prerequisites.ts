// ============================================================
// Prerequisite Engine — DAG-based standard sequencing
//
// Loads the prerequisite map and provides:
//   1. Graph traversal (ancestors, dependents, ready standards)
//   2. "Strict but not blocking" readiness scoring
//   3. Priority scoring for next-standard selection
//
// Readiness tiers:
//   - "ideal":    ALL prerequisites at mastery ≥ 2
//   - "ready":    ≥ 50% of prerequisites at mastery ≥ 2
//   - "unlocked": at least 1 prerequisite at mastery ≥ 1
//   - "blocked":  none of the above (but never permanently)
//
// A child stuck on prerequisites for 3+ sessions gets the next
// standard unlocked at reduced difficulty to keep progressing.
// ============================================================

import type { Domain } from '@/types/quiz'
import type {
  PrerequisiteNode,
  PrerequisiteGraph,
} from '@/types/lesson-content'
import { logDecision, logTable } from './algo-logger'
import prerequisiteData from '../../../mathkix_prerequisite_map.json'

// ── Types ────────────────────────────────────────────────────

export type ReadinessTier = 'ideal' | 'ready' | 'unlocked' | 'blocked'

export interface StandardReadiness {
  standardCode: string
  tier: ReadinessTier
  prerequisitesMet: number        // count at mastery ≥ 2
  prerequisitesTotal: number
  /** Ratio 0-1 of prerequisites met */
  readinessRatio: number
}

export interface StandardPriority {
  standardCode: string
  readiness: StandardReadiness
  score: number                   // composite priority score
  domain: string
  grade: number | string
  description: string
}

// ── Graph loading (singleton) ────────────────────────────────

let cachedGraph: PrerequisiteGraph | null = null

export function loadPrerequisiteGraph(): PrerequisiteGraph {
  if (cachedGraph) return cachedGraph

  const nodes = new Map<string, PrerequisiteNode>()
  const dependents = new Map<string, string[]>()

  const standards = prerequisiteData.standards as Record<string, {
    id: string
    grade: number | string
    domain: string
    cluster: string
    description: string
    prerequisites: string[]
  }>

  for (const [code, data] of Object.entries(standards)) {
    nodes.set(code, {
      id: data.id,
      grade: data.grade,
      domain: data.domain,
      cluster: data.cluster,
      description: data.description,
      prerequisites: data.prerequisites ?? [],
    })

    // Build reverse index
    for (const prereq of data.prerequisites ?? []) {
      const existing = dependents.get(prereq) ?? []
      existing.push(code)
      dependents.set(prereq, existing)
    }
  }

  cachedGraph = { nodes, dependents }
  return cachedGraph
}

// ── Basic graph queries ──────────────────────────────────────

export function getPrerequisites(standardCode: string): string[] {
  const graph = loadPrerequisiteGraph()
  return graph.nodes.get(standardCode)?.prerequisites ?? []
}

export function getDependents(standardCode: string): string[] {
  const graph = loadPrerequisiteGraph()
  return graph.dependents.get(standardCode) ?? []
}

export function getStandardInfo(standardCode: string): PrerequisiteNode | null {
  const graph = loadPrerequisiteGraph()
  return graph.nodes.get(standardCode) ?? null
}

/**
 * Returns all transitive prerequisites (ancestors) via BFS.
 * Includes the entire prerequisite chain back to root nodes.
 */
export function getTransitivePrerequisites(standardCode: string): string[] {
  const graph = loadPrerequisiteGraph()
  const visited = new Set<string>()
  const queue = [...(graph.nodes.get(standardCode)?.prerequisites ?? [])]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)
    const node = graph.nodes.get(current)
    if (node) {
      for (const prereq of node.prerequisites) {
        if (!visited.has(prereq)) queue.push(prereq)
      }
    }
  }

  return [...visited]
}

/**
 * Returns all standards in the graph for a given grade level.
 */
export function getStandardsForGrade(grade: number | string): string[] {
  const graph = loadPrerequisiteGraph()
  const result: string[] = []
  for (const [code, node] of graph.nodes) {
    if (node.grade === grade) result.push(code)
  }
  return result
}

// ── Readiness assessment ─────────────────────────────────────

const MASTERY_THRESHOLD = 2 // "practicing" level required for prereq to count as met

/**
 * Assess readiness for a single standard given child's mastery map.
 */
export function assessReadiness(
  standardCode: string,
  masteryMap: Map<string, number>,
): StandardReadiness {
  const prereqs = getPrerequisites(standardCode)

  // Root nodes (no prerequisites) are always ideal
  if (prereqs.length === 0) {
    return {
      standardCode,
      tier: 'ideal',
      prerequisitesMet: 0,
      prerequisitesTotal: 0,
      readinessRatio: 1,
    }
  }

  let met = 0
  let anyIntroduced = false

  for (const prereq of prereqs) {
    const mastery = masteryMap.get(prereq) ?? 0
    if (mastery >= MASTERY_THRESHOLD) met++
    if (mastery >= 1) anyIntroduced = true
  }

  const ratio = met / prereqs.length

  let tier: ReadinessTier
  if (met === prereqs.length) {
    tier = 'ideal'
  } else if (ratio >= 0.5) {
    tier = 'ready'
  } else if (anyIntroduced) {
    tier = 'unlocked'
  } else {
    tier = 'blocked'
  }

  return {
    standardCode,
    tier,
    prerequisitesMet: met,
    prerequisitesTotal: prereqs.length,
    readinessRatio: ratio,
  }
}

/**
 * Find all standards at a grade level that are ready or ideal.
 * Optionally includes "unlocked" tier if includeUnlocked is true.
 */
export function findReadyStandards(
  masteryMap: Map<string, number>,
  gradeLevel: number,
  includeUnlocked: boolean = false,
): StandardReadiness[] {
  const standards = getStandardsForGrade(gradeLevel)
  const results: StandardReadiness[] = []

  for (const code of standards) {
    const readiness = assessReadiness(code, masteryMap)
    const isReady = readiness.tier === 'ideal' || readiness.tier === 'ready'
    const include = isReady || (includeUnlocked && readiness.tier === 'unlocked')
    if (include) results.push(readiness)
  }

  return results
}

/**
 * For a target standard the child is struggling with, find the deepest
 * unmastered prerequisite to remediate first.
 *
 * Returns null if all prerequisites are mastered.
 */
export function findDeepestGap(
  targetStandard: string,
  masteryMap: Map<string, number>,
): string | null {
  const prereqs = getPrerequisites(targetStandard)
  if (prereqs.length === 0) return null

  // Find unmastered prerequisites
  const unmastered = prereqs.filter(p => (masteryMap.get(p) ?? 0) < MASTERY_THRESHOLD)
  if (unmastered.length === 0) return null

  // Recurse into each unmastered prereq to find the deepest gap
  for (const prereq of unmastered) {
    const deeper = findDeepestGap(prereq, masteryMap)
    if (deeper) return deeper
  }

  // No deeper gap found — the gap is at this level
  // Return the unmastered prereq with lowest mastery
  return unmastered.reduce((worst, code) => {
    const worstMastery = masteryMap.get(worst) ?? 0
    const codeMastery = masteryMap.get(code) ?? 0
    return codeMastery < worstMastery ? code : worst
  })
}

// ── Priority scoring for next standard selection ─────────────

const W_READINESS = 40
const W_NEED = 20
const W_SR_URGENCY = 5
const W_DOMAIN_BALANCE = 15
const W_ENGAGEMENT = 10
const W_STALENESS = 3

export interface PriorityScoringContext {
  masteryMap: Map<string, number>         // standard_code → mastery_level (0-3)
  domainMastery: Record<string, number>   // domain → 0-100
  affinityMap: Map<Domain, number>        // domain → 0-100 affinity
  srOverdueDays: Map<string, number>      // standard_code → overdue days
  recentStandards: Set<string>            // standards practiced in last 3 sessions
  sessionsSinceMap: Map<string, number>   // standard_code → sessions since last practiced
}

/**
 * Score all standards at a grade level and return them sorted by priority.
 * Higher score = should teach next.
 */
export function scoreStandardPriorities(
  gradeLevel: number,
  ctx: PriorityScoringContext,
): StandardPriority[] {
  const graph = loadPrerequisiteGraph()
  const standards = getStandardsForGrade(gradeLevel)
  const priorities: StandardPriority[] = []

  // Calculate average domain mastery for balance scoring
  const domainValues = Object.values(ctx.domainMastery)
  const avgDomainMastery = domainValues.length > 0
    ? domainValues.reduce((a, b) => a + b, 0) / domainValues.length
    : 0

  for (const code of standards) {
    const node = graph.nodes.get(code)
    if (!node) continue

    const currentMastery = ctx.masteryMap.get(code) ?? 0

    // Skip already-mastered standards (mastery 3) unless SR overdue
    const srOverdue = ctx.srOverdueDays.get(code) ?? 0
    if (currentMastery >= 3 && srOverdue <= 0) continue

    const readiness = assessReadiness(code, ctx.masteryMap)

    // ── Readiness score (0-40) ──
    const readinessScore = readiness.readinessRatio * W_READINESS

    // ── Need score (0-60) ── higher for unmastered
    const needScore = (3 - currentMastery) * W_NEED

    // ── SR urgency (0-unbounded, capped at 50) ──
    const srScore = Math.min(srOverdue * W_SR_URGENCY, 50)

    // ── Domain balance (0-30) ── boost underserved domains
    const domainCode = extractDomainCode(code)
    const thisDomainMastery = ctx.domainMastery[domainCode] ?? 0
    const domainDeficit = Math.max(0, avgDomainMastery - thisDomainMastery)
    const domainBalance = Math.min(domainDeficit / 100 * W_DOMAIN_BALANCE * 2, 30)

    // ── Engagement bonus (0-10) ── slight preference for enjoyed topics
    const affinity = ctx.affinityMap.get(domainCode as Domain) ?? 50
    const engagementBonus = ((affinity - 50) / 50) * W_ENGAGEMENT

    // ── Staleness penalty (negative) ── avoid grinding same standard
    const sessionsSince = ctx.sessionsSinceMap.get(code) ?? 999
    const recentlyPracticed = ctx.recentStandards.has(code)
    const stalenessPenalty = recentlyPracticed ? 15 : Math.max(0, (5 - sessionsSince) * W_STALENESS)

    // ── Tier penalty for blocked/unlocked ──
    let tierPenalty = 0
    if (readiness.tier === 'blocked') tierPenalty = 30
    else if (readiness.tier === 'unlocked') tierPenalty = 10

    const score = readinessScore + needScore + srScore + domainBalance + engagementBonus - stalenessPenalty - tierPenalty

    priorities.push({
      standardCode: code,
      readiness,
      score,
      domain: node.domain,
      grade: node.grade,
      description: node.description,
    })
  }

  // Sort descending by score
  priorities.sort((a, b) => b.score - a.score)
  return priorities
}

/**
 * Select the top N standards to teach in the next session.
 * Ensures domain diversity: no more than 1 standard per domain unless
 * there aren't enough domains with ready standards.
 */
export function selectNextStandards(
  gradeLevel: number,
  ctx: PriorityScoringContext,
  count: number = 2,
): StandardPriority[] {
  const scored = scoreStandardPriorities(gradeLevel, ctx)

  logDecision({ component: 'PREREQ', action: 'scored_standards', data: {
    grade: gradeLevel, totalScored: scored.length,
    top5: scored.slice(0, 5).map(s => ({ code: s.standardCode, score: Math.round(s.score), tier: s.readiness.tier, domain: s.domain })),
  }})

  if (scored.length === 0) return []

  const selected: StandardPriority[] = []
  const usedDomains = new Set<string>()

  // First pass: pick top standard from each domain
  for (const priority of scored) {
    if (selected.length >= count) break
    const domain = extractDomainCode(priority.standardCode)
    if (!usedDomains.has(domain)) {
      selected.push(priority)
      usedDomains.add(domain)
    }
  }

  // Second pass: fill remaining slots regardless of domain
  if (selected.length < count) {
    const selectedCodes = new Set(selected.map(s => s.standardCode))
    for (const priority of scored) {
      if (selected.length >= count) break
      if (!selectedCodes.has(priority.standardCode)) {
        selected.push(priority)
      }
    }
  }

  return selected
}

// ── Utility ──────────────────────────────────────────────────

/**
 * Extract the domain code (OA, NBT, NF, MD, G) from a standard code.
 * e.g. "3.OA.1" → "OA", "3.NBT.2" → "NBT", "HSN-RN.1" → "N-RN"
 */
function extractDomainCode(standardCode: string): string {
  // Standard format: "3.OA.1", "3.NF.2a", "3.MD.5b"
  const parts = standardCode.split('.')
  if (parts.length >= 2) {
    // Grade 2-8 format: "3.OA.1" → "OA"
    return parts[1]
  }
  // HS format: "HSN-RN.1" → "N-RN"
  return standardCode.replace(/^HS/, '').split('.')[0]
}

/**
 * Map a CCSS domain name to the app's Domain type code.
 * e.g. "Operations and Algebraic Thinking" → "OA"
 */
export function domainNameToCode(domainName: string): Domain | null {
  const mapping: Record<string, Domain> = {
    'Operations and Algebraic Thinking': 'OA',
    'Number and Operations in Base Ten': 'NBT',
    'Number and Operations—Fractions': 'NF',
    'Measurement and Data': 'MD',
    'Geometry': 'G',
  }
  return mapping[domainName] ?? null
}
