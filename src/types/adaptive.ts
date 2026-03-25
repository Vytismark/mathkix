// ============================================================
// Adaptive Learning Algorithm - Type Definitions
// ============================================================

import type { Domain } from './quiz'

export type { Domain }

// ── Mixed session questions ────────────────────────────────

import type { QuestionType, QuizOption } from './quiz'

/**
 * A single question in a mixed-domain practice session.
 * Spans multiple domains in one sitting.
 */
export interface MixedQuestion {
  id: number
  text: string
  type: QuestionType
  options?: QuizOption[]
  correct_answer: string
  domain: Domain
  standard_code: string | null
  difficulty: number
  xp_per_correct: number
  lesson_id: string | null  // source lesson (for metadata/SR tracking)
}

/**
 * A question from the DB enriched with its parent lesson's metadata.
 * Used internally by the engine to score and select individual questions.
 */
export interface CandidateQuestion {
  id: number
  text: string
  type: QuestionType
  options?: QuizOption[]
  correct_answer: string
  lesson_id: string
  domain: Domain
  standard_code: string
  difficulty: number        // 1-3, from parent lesson
  xp_reward: number         // from parent lesson
}

/**
 * Context passed to scoreQuestion() for each candidate.
 * Updated iteratively as questions are selected.
 */
export interface QuestionScoringContext {
  masteryMap: Map<string, number>         // standard_code → mastery_level (0-3)
  srItemMap: Map<string, SRItem>
  pendingSR: Set<string>
  domainWeightMap: Map<Domain, number>
  affinityMap: Map<Domain, number>
  usedQuestionKeys: Set<string>           // "lessonId:questionId"
  usedStandardCounts: Map<string, number> // standard_code → count selected so far
  usedDomainCounts: Map<Domain, number>   // domain → count selected so far
  totalQuestions: number                  // target session length
}

// ── Behavioral events ──────────────────────────────────────

export type BehavioralEventType =
  | 'answer_correct'
  | 'answer_wrong'
  | 'hint_requested'
  | 'pause_long'         // response_ms > threshold
  | 'topic_pivot'        // engine switched domains mid-session
  | 'session_start'
  | 'session_end'

export interface BehavioralEvent {
  child_id:      string
  session_id:    string | null
  event_type:    BehavioralEventType
  domain:        Domain | null
  standard_code: string | null
  question_id:   string | null
  time_ms:       number | null
  metadata:      Record<string, unknown>
}

// ── Topic affinity ─────────────────────────────────────────

export interface TopicAffinity {
  id:                  string
  child_id:            string
  domain:              Domain
  affinity_score:      number    // 0-100, 50 = neutral baseline
  sessions_in_domain:  number
  correct_streak_best: number
  avg_response_ms:     number | null
  last_updated:        string
}

// ── SM-2 Spaced Repetition ─────────────────────────────────

export interface SRItem {
  id:               string
  child_id:         string
  standard_code:    string
  domain:           Domain
  grade_level:      number
  ease_factor:      number      // ≥ 1.3; default 2.5
  interval_days:    number      // days until next review
  repetitions:      number      // consecutive successful reviews
  next_review_at:   string      // ISO timestamp
  last_reviewed_at: string | null
  last_score_pct:   number | null
  times_reviewed:   number
  created_at:       string
}

/**
 * SM-2 quality score (0-5)
 * Mapped from lesson score_pct:
 *   ≥90 → 5, ≥75 → 4, ≥60 → 3, ≥40 → 2, ≥20 → 1, <20 → 0
 * Quality < 3 = failed (reset repetitions to 0)
 */
export type SRQuality = 0 | 1 | 2 | 3 | 4 | 5

// ── Engine state ───────────────────────────────────────────

export interface DomainWeight {
  domain:        Domain
  baseWeight:    number    // from mastery inversion
  affinityBonus: number    // from topic_affinity multiplier
  srBonus:       number    // from overdue SR items pressure
  finalWeight:   number    // normalised, sums to ~1 across all 5
}

export interface EngineState {
  childId:                string
  sessionId:              string
  domainWeights:          DomainWeight[]
  usedQuestionKeys:       string[]    // "lessonId:questionId" for dedup
  srDueThisSession:       string[]    // standard_codes due for SR
  srCompletedThisSession: string[]
  questionsAnswered:       number
}

// ── Engagement / disengagement ─────────────────────────────

export interface EngagementWindow {
  /** Last N response times (ms) - sliding window of 5 */
  recentResponseMs:       number[]
  /** Rolling session average response time (ms) */
  sessionAvgResponseMs:   number
  /** Current consecutive wrong-answer streak */
  errorStreak:            number
  /** Current consecutive correct-answer streak */
  correctStreak:          number
  /** Total wrong answers in session */
  totalWrong:             number
  /** Times engine has pivoted domain this session */
  pivotCount:             number
  /** Whether disengagement was triggered this session */
  disengagementTriggered: boolean
  /** Unix ms timestamp of session start */
  sessionStartMs:         number
}

export type EngagementSignal =
  | 'ok'
  | 'slowing'       // response times trending up relative to session avg
  | 'error_streak'  // 3+ consecutive wrong answers
  | 'fatigue'       // session exceeded 20 minutes
  | 'disengaged'    // combination of 2+ signals

export type EngagementAction =
  | 'continue'
  | 'reduce_difficulty'
  | 'domain_pivot'
  | 'show_encouragement'
  | 'offer_break'

// ── Legacy types (kept for backward-compat with lesson page) ──

export interface LessonSummary {
  id:           string
  title:        string
  domain:       Domain
  grade_level:  number
  difficulty:   number
  xp_reward:    number
  standard_code: string | null
  is_sr_review: boolean
}

// ── Achievements ───────────────────────────────────────────

export type AchievementCode =
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'perfect_lesson'
  | 'perfect_5'
  | 'mastery_oa'
  | 'mastery_nbt'
  | 'mastery_nf'
  | 'mastery_md'
  | 'mastery_g'
  | 'mastery_all'
  | 'comeback_kid'
  | 'sr_10'
  | 'sr_50'
  | 'speed_demon'
  | 'consistent_7'

export type AchievementType =
  | 'streak'
  | 'mastery'
  | 'performance'
  | 'consistency'
  | 'spaced_repetition'

export interface AchievementDefinition {
  code:        AchievementCode
  type:        AchievementType
  title:       string
  description: string
  icon_slug:   string
  xp_bonus:    number
  condition:   (state: AchievementCheckState) => boolean
}

export interface AchievementCheckState {
  streak_days:          number
  domain_mastery:       Record<Domain, number>   // 0-100 per domain
  sr_items_reviewed:    number                   // lifetime total
  perfect_lessons:      number                   // lifetime total (score_pct === 100)
  lessons_completed:    number
  last_lesson_score:    number | null
  last_lesson_standard: string | null
  /** standard_code → best_score_pct, used for comeback_kid detection */
  standard_best_scores: Record<string, number>
  avg_response_ms:      number | null
  existing_codes:       string[]
  /** lessons completed in the last 7 days */
  recent_week_lessons:  number
}

export interface EarnedAchievement {
  id:               string
  child_id:         string
  achievement_code: AchievementCode
  achievement_type: AchievementType
  title:            string
  description:      string
  icon_slug:        string
  xp_bonus:         number
  metadata:         Record<string, unknown>
  earned_at:        string
}

// ── AI Teacher chat ────────────────────────────────────────

export type EmotionSignal = 'neutral' | 'frustrated' | 'confused' | 'excited' | 'disengaged'

export type ProblemType =
  | 'arithmetic' | 'factors' | 'fractions' | 'geometry'
  | 'word_problem' | 'comparison' | 'patterns' | 'other'

export interface ChatMessage {
  role:    'user' | 'assistant'
  content: string
}

export interface AITeacherRequest {
  childId:          string
  message:          string
  contextHint:      string | null   // equation part the child tapped
  history:          ChatMessage[]   // last 6 turns
  struggleCount?:   number          // consecutive exchanges stuck on current question
  emotionSignal?:   EmotionSignal   // detected from child's latest message
  problemType?:     ProblemType     // classified from question text + domain
  progressSummary?: string          // e.g. "3 of 8 correct so far"
}
