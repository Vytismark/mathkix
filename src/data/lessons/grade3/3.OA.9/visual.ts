import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.9',
  modality: 'visual',
  title: 'Arithmetic Patterns (Visual)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: 'Math is full of patterns! When you see a pattern, it helps you solve problems faster.\n\nLet\'s look at patterns hiding in the multiplication table.',
    },
    {
      type: 'visual',
      content: 'Look at the 2s column in the multiplication table:\n\n2 × 1 = 2\n2 × 2 = 4\n2 × 3 = 6\n2 × 4 = 8\n2 × 5 = 10\n\nWhat do you notice about all the answers?',
      visual: {
        type: 'number_line',
        data: { start: 0, end: 12, marks: [2, 4, 6, 8, 10], highlight: [2, 4, 6, 8, 10] },
        alt: 'Number line showing multiples of 2: 2, 4, 6, 8, 10 — all even numbers',
      },
    },
    {
      type: 'text',
      content: 'The 2s are always EVEN numbers!\n\nWhy? Because 2 × anything means you have pairs. Pairs are always even — nothing is left over.',
    },
    {
      type: 'visual',
      content: 'Now look at the 5s:\n\n5 × 1 = 5\n5 × 2 = 10\n5 × 3 = 15\n5 × 4 = 20\n5 × 5 = 25\n\nEvery answer ends in 0 or 5!',
      visual: {
        type: 'number_line',
        data: { start: 0, end: 30, marks: [5, 10, 15, 20, 25], highlight: [5, 10, 15, 20, 25] },
        alt: 'Number line showing multiples of 5: 5, 10, 15, 20, 25 — all end in 0 or 5',
      },
    },
    {
      type: 'visual',
      content: 'The 9s have a cool pattern too!\n\n9 × 1 = 9 → digits: 0 + 9 = 9\n9 × 2 = 18 → digits: 1 + 8 = 9\n9 × 3 = 27 → digits: 2 + 7 = 9\n9 × 4 = 36 → digits: 3 + 6 = 9\n\nThe digits always add up to 9!',
      visual: {
        type: 'array',
        data: { rows: 4, cols: 9, emoji: '🔵' },
        alt: '4 rows of 9 dots showing multiples of 9: 9, 18, 27, 36',
      },
    },
    {
      type: 'text',
      content: 'Why do the 9s digits add up to 9?\n\nWhen you go from 9 to 18, you add 10 and subtract 1. The tens digit goes up by 1 and the ones digit goes down by 1. So the digit sum stays the same!',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'What pattern do you see in the 2s multiplication facts? (2, 4, 6, 8, 10...)',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'They are all even numbers' },
        { label: 'B', value: 'They are all odd numbers' },
        { label: 'C', value: 'They all end in 5' },
        { label: 'D', value: 'They are all less than 10' },
      ],
      correct_answer: 'They are all even numbers',
      difficulty: 1,
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'Which number could be a multiple of 5?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '23' },
        { label: 'B', value: '35' },
        { label: 'C', value: '41' },
        { label: 'D', value: '18' },
      ],
      correct_answer: '35',
      difficulty: 2,
      hint: 'Multiples of 5 always end in 0 or 5.',
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 3,
      text: '9 × 7 = 63. Do the digits of 63 add up to 9?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'Yes, 6 + 3 = 9' },
        { label: 'B', value: 'No, 6 + 3 = 8' },
        { label: 'C', value: 'Yes, 6 + 3 = 10' },
        { label: 'D', value: 'No, 6 + 3 = 12' },
      ],
      correct_answer: 'Yes, 6 + 3 = 9',
      difficulty: 2,
      hint: 'Add the tens digit and the ones digit of 63.',
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
  ],
  summary: 'Multiplication tables are full of patterns! The 2s are always even, the 5s always end in 0 or 5, and the 9s digits always add up to 9. Patterns help you check your work!',
  commonMistakes: [
    'Thinking a number ending in 5 must be odd (it could be a multiple of 5)',
    'Forgetting that the 9s digit-sum pattern works for 9 × 1 through 9 × 9',
  ],
}

export default lesson
