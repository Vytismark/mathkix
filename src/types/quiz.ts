export type QuestionType = 'multiple_choice' | 'numeric' | 'fraction'

// All G1-5 Common Core math domains (superset)
export const DOMAINS = ['OA', 'NBT', 'NF', 'MD', 'G'] as const
export type Domain = typeof DOMAINS[number]

// G1-2 do not have NF (fractions); G3-5 have all 5 domains
const DOMAINS_G1_2: readonly Domain[] = ['OA', 'NBT', 'MD', 'G']
const DOMAINS_G3_5: readonly Domain[] = DOMAINS

/** Return the Common Core domains for a given grade level (1-5). */
export function getDomainsForGrade(gradeLevel: number): readonly Domain[] {
  return gradeLevel <= 2 ? DOMAINS_G1_2 : DOMAINS_G3_5
}

/** Questions per domain in the diagnostic quiz (total always = 20). */
export function getQuestionsPerDomain(gradeLevel: number): number {
  return gradeLevel <= 2 ? 5 : 4 // 4×5=20 or 5×4=20
}

export type DomainScores = Partial<Record<Domain, number>>  // 0-100 per domain
export type DomainGrades = Partial<Record<Domain, number>>  // 1-5 effective grade per domain

export interface QuizOption {
  label: string
  value: string
}

export interface DiagnosticQuestion {
  id: string
  grade_level: number
  domain: string
  standard_code: string | null
  question_text: string
  question_type: QuestionType
  options: QuizOption[] | null
  correct_answer: string
  difficulty: number
  visual_asset: string | null
}

export interface QuizAnswerRecord {
  question_id: string
  answer_given: string
  correct: boolean
  time_ms: number
  grade_level: number
  domain: string
  difficulty: number  // 1-3, needed for domain score calculation
  standard_code?: string // captured from diagnostic_questions for per-standard mastery seeding
}

export interface QuizSession {
  id: string
  child_id: string
  status: 'in_progress' | 'completed' | 'abandoned'
  questions_asked: QuizAnswerRecord[]
  total_correct: number
  total_asked: number
  // Legacy single-grade output (now = min effective_grade across domains)
  recommended_grade: number | null
  confidence_score: number | null
  // New: per-domain results
  domain_scores: DomainScores | null
  domain_grades: DomainGrades | null
  scoring_method?: 'ai' | 'ai_fallback' | 'local_fallback'
}

// ── Domain adaptive state ──────────────────────────────────

export interface DomainState {
  questionsAsked: QuizAnswerRecord[]
  currentDifficulty: number   // 1-3
  currentGrade: number        // 1-5
}

export interface DomainAdaptiveState {
  currentDomainIndex: number                  // index into gradeDomains
  gradeDomains: readonly Domain[]             // grade-specific domain list
  questionsPerDomain: number                  // 5 for G1-2, 4 for G3-5
  domains: Partial<Record<Domain, DomainState>>
  usedQuestionIds: Set<string>
  allAnswers: QuizAnswerRecord[]
}

// ── Assessment results ─────────────────────────────────────

/** Returned by Claude and stored on quiz_sessions + children */
export interface DomainAssessmentResult {
  domain_scores: DomainScores
  reasoning: string
}

/** Legacy - kept for backwards compat, now derived from domain results */
export interface LevelAssessmentResult {
  recommended_grade: number
  confidence: number
  reasoning: string
}
