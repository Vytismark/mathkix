import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.6',
  modality: 'story',
  title: 'Division as Unknown-Factor (Story)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: 'Ava is helping her teacher pass out supplies. She has 24 colored pencils and needs to put them into boxes of 6.\n\n"How many boxes do I need?" she wonders.',
    },
    {
      type: 'text',
      content: 'Ava writes: 24 ÷ 6 = ?\n\nBut then she remembers something. "I know my times tables! What number times 6 equals 24?"\n\nShe thinks: ? × 6 = 24.\n\n4 × 6 = 24! So she needs 4 boxes!',
    },
    {
      type: 'text',
      content: 'Ava just discovered something powerful: every division problem is really a multiplication problem with a missing number!\n\n24 ÷ 6 = ? is the same as ? × 6 = 24.\n\nDivision and multiplication are inverse operations — they undo each other.',
    },
    {
      type: 'worked_example',
      content: 'Next, Ava has 35 stickers to share equally among 5 friends.',
      example: {
        problem: '35 ÷ 5 = ?',
        steps: [
          { explanation: 'Rewrite as multiplication: ? × 5 = 35' },
          { explanation: 'Think: "What times 5 equals 35?"' },
          { explanation: 'Count by 5s: 5, 10, 15, 20, 25, 30, 35 — that\'s 7!' },
          { explanation: '7 × 5 = 35 ✓' },
        ],
        answer: '35 ÷ 5 = 7 stickers each',
      },
    },
    {
      type: 'interactive',
      content: 'Ava has 42 crayons to put into groups of 7.',
      prompt: 'Think: ? × 7 = 42. What is 42 ÷ 7?',
      expectedResponse: '6',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Ava has 20 markers to share among 4 friends. How many markers does each friend get?',
      type: 'numeric',
      correct_answer: '5',
      difficulty: 1,
      hint: 'Think: ? × 4 = 20. What times 4 equals 20?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 2,
      text: '36 ÷ 9 = ? Which multiplication fact helps you solve this?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '4 × 9 = 36' },
        { label: 'B', value: '36 × 9 = 324' },
        { label: 'C', value: '9 + 9 = 18' },
        { label: 'D', value: '36 - 9 = 27' },
      ],
      correct_answer: '4 × 9 = 36',
      difficulty: 2,
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 3,
      text: 'Ava bakes 54 cookies and puts 9 in each bag. How many bags does she fill?',
      type: 'numeric',
      correct_answer: '6',
      difficulty: 3,
      hint: 'Think: ? × 9 = 54. What times 9 equals 54?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
  ],
  summary: 'When you see a division problem, turn it into a multiplication question! Ask "what times this number equals that number?" Your times tables help you divide!',
  commonMistakes: [
    'Trying to subtract repeatedly instead of using multiplication facts',
    'Confusing which number to divide by — the divisor is the group size or number of groups',
  ],
}

export default lesson
