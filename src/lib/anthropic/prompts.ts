import type { Domain, DomainScores, QuizAnswerRecord } from '@/types/quiz'
import { getDomainsForGrade } from '@/types/quiz'
import { DOMAIN_LABELS } from '@/lib/quiz/levelMapping'

// ── Domain descriptions for the system prompt ────────────────────────────────

const DOMAIN_DESCRIPTIONS: Record<Domain, string> = {
  OA:  'Addition, subtraction, multiplication, division, word problems',
  NBT: 'Place value, multi-digit arithmetic, rounding',
  NF:  'Fractions, decimals, equivalence',
  MD:  'Measurement, time, money, data graphs',
  G:   'Shapes, area, perimeter, coordinates',
}

// ── System prompt (now generated per grade) ──────────────────────────────────

export function buildDomainAssessmentSystemPrompt(schoolGrade: number): string {
  const domains = getDomainsForGrade(schoolGrade)

  const domainList = domains
    .map((d) => `- ${d.padEnd(3)} (${DOMAIN_LABELS[d]}):${' '.repeat(Math.max(1, 14 - DOMAIN_LABELS[d].length))}${DOMAIN_DESCRIPTIONS[d]}`)
    .join('\n')

  const domainScoresJson = domains
    .map((d) => `    "${d}":  <integer 0-100>`)
    .join(',\n')

  return `You are an expert Grade 1-5 math assessment specialist aligned with the Common Core State Standards for Mathematics (CCSSM).

Your task is to analyse a child's quiz results and score their understanding in each of the ${domains.length} math domains as a percentage from 0 to 100.

Domains:
${domainList}

Scoring guidelines:
- 90-100: Strong mastery - child clearly understands this domain
- 70-89:  Good understanding - mostly solid, minor gaps
- 50-69:  Partial understanding - foundational but gaps present
- 25-49:  Developing - significant gaps, needs targeted practice
- 0-24:   Needs foundational work - start from the basics

Consider:
- Accuracy (correct / total for each domain) is the primary signal
- Higher-difficulty correct answers should increase the score
- Very slow responses (>30s average) suggest uncertainty even when correct
- Only ${domains.length === 4 ? '5' : '4'} questions per domain so use your expert judgement to interpolate

The reasoning field (2 sentences max) is written for a parent - warm, clear, actionable.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "domain_scores": {
${domainScoresJson}
  },
  "reasoning": "<2-sentence parent-friendly summary of strengths and biggest gap>"
}`
}

// Keep legacy export for backward compat (defaults to G3-5 with 5 domains)
export const DOMAIN_ASSESSMENT_SYSTEM_PROMPT = buildDomainAssessmentSystemPrompt(3)

// ── Prompt builder ─────────────────────────────────────────────────────────────

export function buildDomainAssessmentPrompt(answers: QuizAnswerRecord[], schoolGrade: number = 3): string {
  const domains = getDomainsForGrade(schoolGrade)

  // Per-domain breakdown
  const byDomain: Record<string, { correct: number; total: number; avgTime: number; avgDifficulty: number }> = {}

  for (const d of domains) {
    byDomain[d] = { correct: 0, total: 0, avgTime: 0, avgDifficulty: 0 }
  }

  for (const a of answers) {
    const d = a.domain
    if (!byDomain[d]) continue
    byDomain[d].total++
    if (a.correct) byDomain[d].correct++
    byDomain[d].avgTime += a.time_ms
    byDomain[d].avgDifficulty += a.difficulty
  }

  const domainBreakdown = domains.map((d) => {
    const stats = byDomain[d]
    if (stats.total === 0) return `  - ${DOMAIN_LABELS[d as Domain]} (${d}): no questions asked`
    const avgTime = Math.round(stats.avgTime / stats.total / 1000)
    const avgDiff = (stats.avgDifficulty / stats.total).toFixed(1)
    const pct = Math.round((stats.correct / stats.total) * 100)
    return `  - ${DOMAIN_LABELS[d as Domain]} (${d}): ${stats.correct}/${stats.total} correct (${pct}%), avg time ${avgTime}s, avg difficulty ${avgDiff}/3`
  }).join('\n')

  const questionLog = answers
    .map((a, i) =>
      `  ${i + 1}. [${a.domain}] Grade ${a.grade_level} diff ${a.difficulty}: ${a.correct ? 'CORRECT' : 'WRONG'} (${Math.round(a.time_ms / 1000)}s)`
    )
    .join('\n')

  return `Quiz results - ${answers.length} questions across ${domains.length} domains:

Per-domain performance:
${domainBreakdown}

Question-by-question log:
${questionLog}

Based on this data, score each domain 0-100 and give a 2-sentence parent summary.`
}

// ── Response parser ────────────────────────────────────────────────────────────

export interface DomainAssessmentResponse {
  domain_scores: DomainScores
  reasoning: string
}

export function parseDomainAssessmentResponse(raw: string, schoolGrade: number = 3): DomainAssessmentResponse | null {
  try {
    const json = JSON.parse(raw.trim())
    if (!json.domain_scores || typeof json.reasoning !== 'string') return null

    const domains = getDomainsForGrade(schoolGrade)
    const scores: DomainScores = {}
    for (const d of domains) {
      const val = json.domain_scores[d]
      if (typeof val !== 'number') return null
      scores[d] = Math.max(0, Math.min(100, Math.round(val)))
    }
    return { domain_scores: scores, reasoning: json.reasoning }
  } catch {
    return null
  }
}

// ── Fallback (if Claude fails) ─────────────────────────────────────────────────
// Compute domain scores purely from the answer history without Claude.

export function computeFallbackDomainScores(answers: QuizAnswerRecord[], schoolGrade: number = 3): DomainScores {
  const domains = getDomainsForGrade(schoolGrade)
  const scores: DomainScores = {}
  for (const domain of domains) {
    const domainAnswers = answers.filter((a) => a.domain === domain)
    if (domainAnswers.length === 0) { scores[domain] = 50; continue }

    const correct = domainAnswers.filter((a) => a.correct).length
    const base = (correct / domainAnswers.length) * 100
    const avgDifficulty = domainAnswers.reduce((s, a) => s + a.difficulty, 0) / domainAnswers.length
    const bonus = avgDifficulty * 5
    const avgTime = domainAnswers.reduce((s, a) => s + a.time_ms, 0) / domainAnswers.length
    const penalty = avgTime > 30_000 ? -5 : 0
    scores[domain] = Math.round(Math.max(0, Math.min(100, base + bonus + penalty)))
  }
  return scores
}
