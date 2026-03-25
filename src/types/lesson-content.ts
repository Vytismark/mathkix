// ============================================================
// Lesson Content Types — Teaching Modalities & Instruction
// ============================================================

import type { QuestionType, QuizOption } from './quiz'

// ── Teaching modalities ──────────────────────────────────────

export const TEACHING_MODALITIES = [
  'visual',
  'story',
  'procedural',
  'interactive',
  'challenge',
] as const

export type TeachingModality = typeof TEACHING_MODALITIES[number]

// ── Lesson content (one modality variant for one standard) ───

export interface LessonContent {
  standardCode: string
  modality: TeachingModality
  title: string                       // e.g. "Multiplication as Groups (Visual)"
  estimatedMinutes: number            // helps session budgeting
  introduction: InstructionStep[]     // teaching cards shown before practice
  practiceQuestions: PracticeQuestion[]  // 3-5 graded practice problems
  summary: string                     // key takeaway shown at end
  commonMistakes: string[]            // "watch out for..." tips
}

// ── Instruction steps (one card per step) ────────────────────

export type InstructionStepType =
  | 'text'
  | 'visual'
  | 'worked_example'
  | 'interactive'

export interface InstructionStep {
  type: InstructionStepType
  content: string                     // markdown text for the card
  visual?: VisualAsset                // optional diagram / model
  example?: WorkedExample             // for worked_example steps
  prompt?: string                     // mid-lesson check-in question
  expectedResponse?: string           // expected answer for check-in
}

// ── Worked examples ──────────────────────────────────────────

export interface WorkedExample {
  problem: string
  steps: WorkedExampleStep[]
  answer: string
}

export interface WorkedExampleStep {
  explanation: string
  visual?: string                     // optional visual hint per step
}

// ── Visual assets ────────────────────────────────────────────

export type VisualAssetType =
  | 'number_line'
  | 'area_model'
  | 'bar_diagram'
  | 'array'
  | 'fraction_bar'
  | 'place_value_chart'
  | 'groups'
  | 'image'
  | 'custom'

export interface VisualAsset {
  type: VisualAssetType
  data: Record<string, unknown>       // type-specific rendering data
  alt: string                         // accessibility description
}

// ── Practice questions (embedded in lesson content) ──────────

export interface PracticeQuestion {
  id: number
  text: string
  type: QuestionType
  options?: QuizOption[]
  correct_answer: string
  difficulty: number                  // 1-3
  hint?: string                       // optional hint shown after wrong attempt
  visual?: VisualAsset
  /** Profiler classification: what kind of question */
  category?: 'procedural' | 'conceptual' | 'word_problem' | 'bare_number'
  /** Profiler classification: abstraction level */
  abstractionLevel?: 'concrete' | 'representational' | 'abstract'
  /** Profiler classification: how many steps to solve */
  stepsRequired?: number
}

// ── Session segments ─────────────────────────────────────────

export type SessionSegment =
  | InstructionSegment
  | PracticeSegment
  | ReviewSegment

export interface InstructionSegment {
  type: 'instruction'
  standardCode: string
  modality: TeachingModality
  content: LessonContent
}

export interface PracticeSegment {
  type: 'practice'
  standardCode: string
  questions: PracticeQuestion[]
}

export interface ReviewSegment {
  type: 'review'
  standardCode: string
  questions: PracticeQuestion[]
  isSpacedRepetition: true
}

// ── Modality tracking (stored per child) ─────────────────────

export interface ModalityScore {
  success_rate: number                // 0-1, rolling average
  engagement: number                  // 0-1, from engagement signals
  attempts: number                    // total times this modality used
  last_used: string | null            // ISO timestamp
}

export type ModalityScores = Record<TeachingModality, ModalityScore>

export function createDefaultModalityScores(): ModalityScores {
  const defaults: ModalityScore = {
    success_rate: 0,
    engagement: 0,
    attempts: 0,
    last_used: null,
  }
  return {
    visual: { ...defaults },
    story: { ...defaults },
    procedural: { ...defaults },
    interactive: { ...defaults },
    challenge: { ...defaults },
  }
}

// ── Prerequisite graph node ──────────────────────────────────

export interface PrerequisiteNode {
  id: string
  grade: number | string              // number for K-8, string for "HS"
  domain: string
  cluster: string
  description: string
  prerequisites: string[]
}

export interface PrerequisiteGraph {
  nodes: Map<string, PrerequisiteNode>
  /** Reverse index: standard_code → codes that depend on it */
  dependents: Map<string, string[]>
}
