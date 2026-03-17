// ============================================================
// Answer Scoring - checks user answers against correct answers
// Handles multiple_choice, numeric, and fraction types
// ============================================================

export type QuestionType = 'multiple_choice' | 'numeric' | 'fraction'

// Normalize a string answer for comparison
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '')
}

// Parse a fraction string like "3/4" into numerator/denominator
function parseFraction(s: string): { num: number; den: number } | null {
  const match = s.match(/^(-?\d+)\/(\d+)$/)
  if (!match) return null
  return { num: parseInt(match[1]), den: parseInt(match[2]) }
}

// Check if two fractions are equivalent (e.g. 2/4 == 1/2)
function fractionsEqual(a: string, b: string): boolean {
  const fa = parseFraction(normalize(a))
  const fb = parseFraction(normalize(b))
  if (!fa || !fb) return false
  return fa.num * fb.den === fb.num * fa.den
}

export function checkAnswer(
  questionType: QuestionType,
  userAnswer: string,
  correctAnswer: string
): boolean {
  if (!userAnswer || !correctAnswer) return false

  const u = normalize(userAnswer)
  const c = normalize(correctAnswer)

  switch (questionType) {
    case 'multiple_choice':
      return u === c

    case 'numeric': {
      // Try exact string match first, then numeric equality
      if (u === c) return true
      const uNum = parseFloat(u)
      const cNum = parseFloat(c)
      if (!isNaN(uNum) && !isNaN(cNum)) return Math.abs(uNum - cNum) < 0.001
      return false
    }

    case 'fraction':
      // Accept exact match or equivalent fractions
      if (u === c) return true
      return fractionsEqual(u, c)

    default:
      return u === c
  }
}

export interface LessonQuestion {
  id: number
  text: string
  type: QuestionType
  options?: Array<{ label: string; value: string }>
  correct_answer: string
  visual_asset?: string
}

export interface ScoredResult {
  question_id: number
  correct: boolean
  answer_given: string
}

export function scoreLesson(
  questions: LessonQuestion[],
  answers: Record<number, string>
): {
  results: ScoredResult[]
  score_pct: number
  correct_count: number
} {
  const results: ScoredResult[] = questions.map((q) => {
    const given = answers[q.id] ?? ''
    return {
      question_id: q.id,
      correct: checkAnswer(q.type, given, q.correct_answer),
      answer_given: given,
    }
  })

  const correct_count = results.filter((r) => r.correct).length
  const score_pct = Math.round((correct_count / questions.length) * 100)

  return { results, score_pct, correct_count }
}

// XP reward based on score
export function calculateXP(baseXP: number, scorePct: number): number {
  if (scorePct === 100) return Math.round(baseXP * 1.5) // bonus for perfect
  if (scorePct >= 80) return baseXP
  if (scorePct >= 60) return Math.round(baseXP * 0.75)
  if (scorePct >= 40) return Math.round(baseXP * 0.5)
  return Math.round(baseXP * 0.25)
}

// Mastery level increment based on score
export function getMasteryDelta(scorePct: number): number {
  if (scorePct >= 90) return 2  // big improvement
  if (scorePct >= 70) return 1  // some improvement
  return 0                       // no change
}
