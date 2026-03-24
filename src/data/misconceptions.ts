// ============================================================
// Misconception Catalog — Common Math Misconceptions (Grades 3-5)
//
// Each misconception has a detection function that analyzes
// wrong answers to identify the pattern. Used by the profiler
// to flag active misconceptions on the child's learning profile.
// ============================================================

import type { Domain } from '@/types/quiz'

export interface Misconception {
  code: string
  domain: Domain
  standards: string[]
  description: string
  detection: (wrongAnswer: WrongAnswerContext) => boolean
  remediation: string
}

export interface WrongAnswerContext {
  questionText: string
  correctAnswer: string
  givenAnswer: string
  domain: Domain
  standardCode: string | null
  difficulty: number
}

// ── Misconception catalog ────────────────────────────────────

const MISCONCEPTIONS: Misconception[] = [
  // ── Operations & Algebraic Thinking (OA) ──────────
  {
    code: 'MULT_AS_ADD',
    domain: 'OA',
    standards: ['3.OA.1', '3.OA.3'],
    description: 'Adds instead of multiplying (e.g., 3 × 4 = 7)',
    detection: (ctx) => {
      const nums = extractNumbers(ctx.questionText)
      if (nums.length < 2) return false
      const givenNum = parseFloat(ctx.givenAnswer)
      return nums[0] + nums[1] === givenNum && givenNum !== parseFloat(ctx.correctAnswer)
    },
    remediation: 'Reinforce that × means "groups of", not "plus". Use visual groups.',
  },
  {
    code: 'MULT_MAKES_BIGGER',
    domain: 'OA',
    standards: ['3.OA.1', '3.OA.5', '3.OA.7'],
    description: 'Believes multiplication always makes numbers bigger',
    detection: (ctx) => {
      // Detected when child answers > correct on multiplication by 1 or 0
      if (!ctx.questionText.toLowerCase().includes('× 1') && !ctx.questionText.toLowerCase().includes('× 0')) return false
      const given = parseFloat(ctx.givenAnswer)
      const correct = parseFloat(ctx.correctAnswer)
      return !isNaN(given) && !isNaN(correct) && given > correct
    },
    remediation: 'Practice identity property (×1) and zero property (×0) with visuals.',
  },
  {
    code: 'DIV_ORDER_SWAP',
    domain: 'OA',
    standards: ['3.OA.2', '3.OA.6'],
    description: 'Swaps dividend and divisor (e.g., 6 ÷ 24 instead of 24 ÷ 6)',
    detection: (ctx) => {
      const nums = extractNumbers(ctx.questionText)
      if (nums.length < 2) return false
      const given = parseFloat(ctx.givenAnswer)
      const correct = parseFloat(ctx.correctAnswer)
      if (isNaN(given) || isNaN(correct)) return false
      // Check if answer matches reverse division
      return correct !== 0 && given !== 0 && Math.abs(given - (nums[1] / nums[0])) < 0.01
    },
    remediation: 'Use sharing language: "24 shared among 6" not "6 shared among 24".',
  },
  {
    code: 'EQUAL_MEANS_ANSWER',
    domain: 'OA',
    standards: ['3.OA.4', '3.OA.8'],
    description: 'Believes = means "the answer is" rather than "is equal to"',
    detection: (ctx) => {
      // Hard to detect from answer alone; flagged when child fails balance/missing-number problems
      // but succeeds at standard computation
      return false // requires cross-session analysis
    },
    remediation: 'Use balance beam visuals. Show equations with unknowns on both sides.',
  },
  {
    code: 'WRONG_OPERATION_WORD',
    domain: 'OA',
    standards: ['3.OA.3', '3.OA.8'],
    description: 'Picks wrong operation based on keyword (e.g., "more" always means add)',
    detection: (ctx) => {
      const text = ctx.questionText.toLowerCase()
      const hasMore = text.includes('more') || text.includes('total') || text.includes('altogether')
      const correctNum = parseFloat(ctx.correctAnswer)
      const givenNum = parseFloat(ctx.givenAnswer)
      if (isNaN(correctNum) || isNaN(givenNum)) return false
      // If word suggests addition but answer should be multiplication
      const nums = extractNumbers(ctx.questionText)
      if (nums.length >= 2 && hasMore) {
        return givenNum === nums[0] + nums[1] && correctNum !== givenNum
      }
      return false
    },
    remediation: 'Teach to read the full problem, not just keywords. Practice with misleading keywords.',
  },

  // ── Number & Operations in Base Ten (NBT) ─────────
  {
    code: 'PLACE_VALUE_IGNORE',
    domain: 'NBT',
    standards: ['3.NBT.1', '3.NBT.2'],
    description: 'Ignores place value when adding/subtracting (e.g., 47 + 35 = 712)',
    detection: (ctx) => {
      const nums = extractNumbers(ctx.questionText)
      if (nums.length < 2) return false
      const given = ctx.givenAnswer
      const correct = ctx.correctAnswer
      // Concatenation instead of addition
      return given === `${nums[0]}${nums[1]}` || given === `${nums[1]}${nums[0]}`
    },
    remediation: 'Use place value charts. Break numbers into tens and ones before computing.',
  },
  {
    code: 'ROUND_WRONG_DIRECTION',
    domain: 'NBT',
    standards: ['3.NBT.1'],
    description: 'Always rounds up or always rounds down instead of using the 5-rule',
    detection: (ctx) => {
      if (!ctx.questionText.toLowerCase().includes('round')) return false
      const given = parseFloat(ctx.givenAnswer)
      const correct = parseFloat(ctx.correctAnswer)
      if (isNaN(given) || isNaN(correct)) return false
      // Check if they rounded in the wrong direction
      const diff = Math.abs(given - correct)
      return diff === 10 || diff === 100 // off by one rounding step
    },
    remediation: 'Practice the "look at the digit to the right" rule with number lines.',
  },

  // ── Fractions (NF) ────────────────────────────────
  {
    code: 'FRAC_BIGGER_DENOM_BIGGER',
    domain: 'NF',
    standards: ['3.NF.1', '3.NF.3d'],
    description: 'Believes larger denominator means larger fraction (e.g., 1/8 > 1/4)',
    detection: (ctx) => {
      if (!ctx.correctAnswer.includes('/') || !ctx.givenAnswer.includes('/')) return false
      const text = ctx.questionText.toLowerCase()
      if (!text.includes('larger') && !text.includes('greater') && !text.includes('bigger') && !text.includes('compare')) return false
      // Check if child picked the fraction with the bigger denominator
      const correctParts = ctx.correctAnswer.split('/')
      const givenParts = ctx.givenAnswer.split('/')
      if (correctParts.length !== 2 || givenParts.length !== 2) return false
      return parseInt(givenParts[1]) > parseInt(correctParts[1])
    },
    remediation: 'Use fraction bars to show that more pieces = smaller pieces when the whole is the same.',
  },
  {
    code: 'FRAC_ADD_ACROSS',
    domain: 'NF',
    standards: ['3.NF.3a', '3.NF.3b'],
    description: 'Adds numerators and denominators separately (e.g., 1/4 + 1/4 = 2/8)',
    detection: (ctx) => {
      if (!ctx.correctAnswer.includes('/')) return false
      const text = ctx.questionText.toLowerCase()
      if (!text.includes('+') && !text.includes('add') && !text.includes('sum')) return false
      // Check if answer looks like num1+num2 / denom1+denom2
      const givenParts = ctx.givenAnswer.split('/')
      if (givenParts.length !== 2) return false
      const correctParts = ctx.correctAnswer.split('/')
      if (correctParts.length !== 2) return false
      const givenDenom = parseInt(givenParts[1])
      const correctDenom = parseInt(correctParts[1])
      return givenDenom === correctDenom * 2 // denominator doubled = added across
    },
    remediation: 'Show that the denominator names the size of pieces. Same-size pieces: only add the count (numerator).',
  },
  {
    code: 'FRAC_WHOLE_CONFUSION',
    domain: 'NF',
    standards: ['3.NF.3c'],
    description: 'Cannot express whole numbers as fractions (e.g., 3 = 3/3 instead of 3/1)',
    detection: (ctx) => {
      if (!ctx.questionText.toLowerCase().includes('fraction') && !ctx.questionText.includes('/')) return false
      // Check if they put the whole number as both numerator and denominator
      const given = ctx.givenAnswer
      const nums = extractNumbers(ctx.questionText)
      if (nums.length === 0) return false
      return given === `${nums[0]}/${nums[0]}`
    },
    remediation: 'Show that 3 = 3/1 (three wholes). Use number line to demonstrate.',
  },

  // ── Measurement & Data (MD) ───────────────────────
  {
    code: 'AREA_PERIMETER_SWAP',
    domain: 'MD',
    standards: ['3.MD.5', '3.MD.6', '3.MD.7', '3.MD.8'],
    description: 'Confuses area and perimeter formulas',
    detection: (ctx) => {
      const text = ctx.questionText.toLowerCase()
      const isArea = text.includes('area')
      const isPerimeter = text.includes('perimeter')
      if (!isArea && !isPerimeter) return false
      const nums = extractNumbers(ctx.questionText)
      if (nums.length < 2) return false
      const given = parseFloat(ctx.givenAnswer)
      const correct = parseFloat(ctx.correctAnswer)
      if (isNaN(given) || isNaN(correct)) return false
      // If area problem: check if they computed perimeter instead (or vice versa)
      if (isArea) return given === 2 * (nums[0] + nums[1]) // perimeter formula
      if (isPerimeter) return given === nums[0] * nums[1]   // area formula
      return false
    },
    remediation: 'Area = inside space (square units). Perimeter = around the edge (linear units). Use grid paper.',
  },
  {
    code: 'UNIT_CONFUSION',
    domain: 'MD',
    standards: ['3.MD.1', '3.MD.2'],
    description: 'Confuses units of measurement (minutes vs hours, grams vs kilograms)',
    detection: (ctx) => {
      // Hard to detect from numeric answer alone; would need unit in answer
      return false
    },
    remediation: 'Practice with real-world examples. Which is heavier: a gram or a kilogram?',
  },

  // ── Geometry (G) ──────────────────────────────────
  {
    code: 'SHAPE_ORIENTATION',
    domain: 'G',
    standards: ['3.G.1'],
    description: 'Only recognizes shapes in standard orientation (e.g., rotated square not recognized)',
    detection: () => false, // requires visual question analysis
    remediation: 'Practice identifying shapes in various orientations. Rotate shapes interactively.',
  },
  {
    code: 'PARTITION_UNEQUAL',
    domain: 'G',
    standards: ['3.G.2'],
    description: 'Accepts unequal partitions as valid fractions of a whole',
    detection: () => false, // requires visual question analysis
    remediation: 'Emphasize "equal parts" with side-by-side examples of equal vs unequal splits.',
  },

  // ── Cross-domain ──────────────────────────────────
  {
    code: 'OFF_BY_ONE',
    domain: 'OA',
    standards: [],
    description: 'Consistently off by 1 (counting error, fence-post problem)',
    detection: (ctx) => {
      const given = parseFloat(ctx.givenAnswer)
      const correct = parseFloat(ctx.correctAnswer)
      if (isNaN(given) || isNaN(correct)) return false
      return Math.abs(given - correct) === 1
    },
    remediation: 'Practice careful counting. Use number lines to track each step.',
  },
  {
    code: 'DIGIT_REVERSAL',
    domain: 'NBT',
    standards: [],
    description: 'Reverses digits in answer (e.g., writes 31 instead of 13)',
    detection: (ctx) => {
      const given = ctx.givenAnswer.trim()
      const correct = ctx.correctAnswer.trim()
      if (given.length !== correct.length || given.length < 2) return false
      return given === correct.split('').reverse().join('')
    },
    remediation: 'Practice place value awareness. Write numbers in expanded form first.',
  },
]

// ── Detection function ───────────────────────────────────────

export function detectMisconceptions(
  wrongAnswers: WrongAnswerContext[],
): Misconception[] {
  const detected = new Set<string>()
  const results: Misconception[] = []

  for (const wrong of wrongAnswers) {
    for (const misconception of MISCONCEPTIONS) {
      if (detected.has(misconception.code)) continue
      try {
        if (misconception.detection(wrong)) {
          detected.add(misconception.code)
          results.push(misconception)
        }
      } catch {
        // Detection functions should never crash the profiler
      }
    }
  }

  return results
}

/** Get all misconceptions for a specific domain */
export function getMisconceptionsForDomain(domain: Domain): Misconception[] {
  return MISCONCEPTIONS.filter(m => m.domain === domain)
}

/** Get a misconception by code */
export function getMisconception(code: string): Misconception | null {
  return MISCONCEPTIONS.find(m => m.code === code) ?? null
}

// ── Utility ──────────────────────────────────────────────────

function extractNumbers(text: string): number[] {
  const matches = text.match(/\d+/g)
  return matches ? matches.map(Number) : []
}
