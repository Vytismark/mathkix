import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.7',
  modality: 'visual',
  title: 'Fluently Multiply & Divide Within 100 (Visual)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'Knowing your times tables by heart makes math SO much faster! Let\'s look at patterns and pictures that help you remember them.',
    },
    {
      type: 'visual',
      content: 'Doubles: The 2s table is just doubling! Look at 2 rows of each number:',
      visual: {
        type: 'array',
        data: { rows: 2, cols: 7, emoji: '🔵' },
        alt: '2 rows of 7 = 14. Doubling 7 gives 14.',
      },
    },
    {
      type: 'visual',
      content: 'The 5s table makes a pattern on the number line! Every answer ends in 0 or 5.',
      visual: {
        type: 'number_line',
        data: { start: 0, end: 50, marks: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50], highlight: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50] },
        alt: 'Number line showing multiples of 5 from 0 to 50',
      },
    },
    {
      type: 'visual',
      content: 'The 10s table is even easier — just put a 0 at the end!\n\n10, 20, 30, 40, 50, 60, 70, 80, 90.',
      visual: {
        type: 'number_line',
        data: { start: 0, end: 100, marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], highlight: [10, 20, 30, 40, 50, 60, 70, 80, 90] },
        alt: 'Number line showing multiples of 10 from 0 to 100',
      },
    },
    {
      type: 'text',
      content: 'The 9s trick: Look at your hands! For 9 × 3, put down finger 3. You see 2 fingers on the left and 7 on the right = 27!\n\nAlso, the digits in every 9s answer add up to 9:\n9, 18, 27, 36, 45, 54, 63, 72, 81.',
    },
    {
      type: 'visual',
      content: 'For harder facts like 7 × 8, use an array to see the pattern:',
      visual: {
        type: 'array',
        data: { rows: 7, cols: 8, emoji: '🟦' },
        alt: '7 rows of 8 = 56',
      },
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'What is 5 × 6?',
      type: 'numeric',
      correct_answer: '30',
      difficulty: 1,
      hint: 'Count by 5s: 5, 10, 15, 20, 25, 30.',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'What is 9 × 4?',
      type: 'numeric',
      correct_answer: '36',
      difficulty: 2,
      hint: 'Use the 9s trick: 10 × 4 = 40, subtract 4 to get 36. Or: digits add to 9!',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 3,
      text: 'What is 7 × 8?',
      type: 'numeric',
      correct_answer: '56',
      difficulty: 3,
      hint: 'Think: 5, 6, 7, 8 — "56 = 7 × 8"!',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
  ],
  summary: 'Use patterns to remember your times tables! 2s = doubles, 5s end in 0 or 5, 10s add a zero, 9s digits add to 9. Practice until you know them by heart!',
  commonMistakes: [
    'Mixing up 6 × 7 = 42 with 6 × 8 = 48 — these are close, so practice them extra',
    'Forgetting the 9s pattern and guessing instead of using the trick',
  ],
}

export default lesson
