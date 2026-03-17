import type { QuestionType, QuizOption } from './quiz'

export interface LessonQuestion {
  id: number
  text: string
  type: QuestionType
  options?: QuizOption[]
  correct_answer: string
  visual_asset?: string
}

export interface Lesson {
  id: string
  grade_level: number
  domain: string
  standard_code: string | null
  title: string
  description: string | null
  lesson_type: 'practice' | 'concept' | 'challenge'
  difficulty: number
  xp_reward: number
  questions: LessonQuestion[]
  sort_order: number
  is_active: boolean
}

export interface LessonWithMastery extends Lesson {
  mastery_level: number  // 0-3 for this child
  attempt_count: number
  best_score_pct: number | null
}
