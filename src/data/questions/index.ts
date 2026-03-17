/**
 * Question Bank - Grade 1-5 Common Core Math
 *
 * 1,890 questions across 126 standards (21 G1, 26 G2, 25 G3, 28 G4, 26 G5)
 * Each standard: 5 Easy + 5 Medium + 5 Hard questions
 * Every question includes: standard code, answer, and explanation
 */

import grade1 from './grade1.json'
import grade2 from './grade2.json'
import grade3 from './grade3.json'
import grade4 from './grade4.json'
import grade5 from './grade5.json'

export { grade1, grade2, grade3, grade4, grade5 }

export const ALL_GRADES = [grade1, grade2, grade3, grade4, grade5] as const

export type Question = {
  question: string
  answer: string
  explanation: string
}

export type StandardQuestions = {
  easy: Question[]
  medium: Question[]
  hard: Question[]
}

export type Standard = {
  code: string
  domain: string
  domainName: string
  title: string
  explanation: string
  questions: StandardQuestions
}

export type GradeBank = {
  grade: number
  totalStandards: number
  totalQuestions: number
  standards: Standard[]
}

/** Get all standards for a specific grade (1, 2, 3, 4, or 5) */
export function getGradeBank(grade: 1 | 2 | 3 | 4 | 5): GradeBank {
  return ALL_GRADES.find(g => g.grade === grade) as GradeBank
}

/** Look up a specific standard by code, e.g. "1.OA.1" */
export function getStandard(code: string): Standard | undefined {
  for (const gradeData of ALL_GRADES) {
    const found = gradeData.standards.find(s => s.code === code)
    if (found) return found as Standard
  }
  return undefined
}

/** Get questions for a standard + difficulty */
export function getQuestions(
  standardCode: string,
  difficulty: 'easy' | 'medium' | 'hard',
): Question[] {
  const std = getStandard(standardCode)
  return (std?.questions[difficulty] ?? []) as Question[]
}

/** Get all standards for a domain, e.g. "1.OA" or "3.NBT" */
export function getStandardsByDomain(domain: string): Standard[] {
  for (const gradeData of ALL_GRADES) {
    const stds = gradeData.standards.filter(s => s.domain === domain)
    if (stds.length) return stds as Standard[]
  }
  return []
}
