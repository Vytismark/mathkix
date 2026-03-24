import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.5',
  modality: 'challenge',
  title: 'Multiply & Divide Properties (Challenge)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'You\'re in charge of organizing the school talent show! You\'ll use multiplication properties to solve real planning problems.',
    },
    {
      type: 'text',
      content: 'The auditorium has chairs set up in 8 rows of 5. A parent asks, "Is that the same as 5 rows of 8?"\n\nYes! The commutative property tells us 8 × 5 = 5 × 8 = 40 chairs either way.',
    },
    {
      type: 'worked_example',
      content: 'You need to set up decorations. There are 2 hallways, each with 3 walls, and each wall gets 5 balloons.',
      example: {
        problem: 'How many balloons do you need? Find (2 × 3) × 5.',
        steps: [
          { explanation: 'Method 1 — Associative: (2 × 3) × 5 = 6 × 5 = 30' },
          { explanation: 'Method 2 — Associative: 2 × (3 × 5) = 2 × 15 = 30' },
          { explanation: 'Same answer both ways! Pick whichever is easier for you.' },
        ],
        answer: '30 balloons',
      },
    },
    {
      type: 'worked_example',
      content: 'Each performer needs 9 tickets for their family. There are 8 performers. Use the distributive property!',
      example: {
        problem: 'Find 9 × 8 by breaking apart.',
        steps: [
          { explanation: 'Break 9 into 10 - 1' },
          { explanation: '10 × 8 = 80' },
          { explanation: '1 × 8 = 8' },
          { explanation: '80 - 8 = 72' },
        ],
        answer: '9 × 8 = 72 tickets',
      },
    },
    {
      type: 'interactive',
      content: 'You need to buy 7 packs of 8 glow sticks for the after-party. Use the distributive property to find 7 × 8.',
      prompt: '7 × 8 = 7 × 5 + 7 × 3 = 35 + 21 = ?',
      expectedResponse: '56',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'You set up 6 tables with 9 cups each. Your friend says that is the same as 9 tables with 6 cups each. Is the total the same? What is it?',
      type: 'numeric',
      correct_answer: '54',
      difficulty: 2,
      hint: '6 × 9 = 9 × 6. What is 6 × 9?',
    },
    {
      id: 2,
      text: 'Find 8 × 6 using the distributive property: 8 × 6 = 8 × 5 + 8 × 1. What is 8 × 6?',
      type: 'numeric',
      correct_answer: '48',
      difficulty: 2,
      hint: '8 × 5 = 40 and 8 × 1 = 8. Add them!',
    },
    {
      id: 3,
      text: 'There are 2 floors, each with 4 classrooms, and each classroom has 5 posters. Which grouping is correct?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '(2 × 4) × 5 = 40 posters' },
        { label: 'B', value: '2 + 4 + 5 = 11 posters' },
        { label: 'C', value: '2 × 4 + 5 = 13 posters' },
        { label: 'D', value: '2 × 5 × 4 × 3 = 120 posters' },
      ],
      correct_answer: '(2 × 4) × 5 = 40 posters',
      difficulty: 3,
    },
  ],
  summary: 'Multiplication properties are real-world tools! Swap (commutative), regroup (associative), or break apart (distributive) to solve tricky planning problems.',
  commonMistakes: [
    'Using addition when the problem calls for multiplication of groups',
    'Not applying the distributive property to BOTH parts — you must multiply each part separately, then add',
  ],
}

export default lesson
