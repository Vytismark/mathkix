import type { ProblemType } from '@/types/adaptive'

/**
 * Classify a question into a problem type using domain + text heuristics.
 * Used to select problem-specific teaching guidance in the AI teacher prompt.
 */
export function detectProblemType(question: { text: string; domain: string }): ProblemType {
  const lower = question.text.toLowerCase()
  const domain = question.domain.toUpperCase()

  // Domain-first checks
  if (domain === 'NF') return 'fractions'
  if (domain === 'G') return 'geometry'

  // Text-pattern checks (override domain)
  if (/factor|multiple|divisib|divides?\s+evenly/.test(lower)) return 'factors'
  if (/greater\s+than|less\s+than|compare|which\s+is\s+(more|less|bigger|smaller)|[><]/.test(lower)) return 'comparison'
  if (/pattern|sequence|next\s+number|what\s+comes\s+next|rule/.test(lower)) return 'patterns'

  // Fraction indicators in text (even if domain isn't NF)
  if (/\d+\s*\/\s*\d+|fraction|numerator|denominator|half|thirds?|fourths?|quarters?/.test(lower)) return 'fractions'

  // Word problem: longer text with story signals
  if (lower.length > 40 && /how\s+many|altogether|left\s+over|total|each|shared|split|gave|bought|sold/.test(lower)) return 'word_problem'

  // Arithmetic: OA/NBT with operator symbols or keywords
  if ((domain === 'OA' || domain === 'NBT') && /[+\-x\u00d7\u00f7\/=]|\bplus\b|\bminus\b|\btimes\b/.test(lower)) return 'arithmetic'

  // Short OA/NBT without operators - still likely arithmetic
  if (domain === 'OA' || domain === 'NBT') return 'arithmetic'

  return 'other'
}
