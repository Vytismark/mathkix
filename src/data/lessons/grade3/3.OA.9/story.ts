import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.9',
  modality: 'story',
  title: 'Arithmetic Patterns (Story)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: "Zara loves collecting seashells at the beach. She puts them in rows to count them.\n\nOn Monday she found 5 shells. On Tuesday she found 10. On Wednesday she found 15.\n\n\"Hey!\" she says. \"I see a pattern! Every day I find 5 more!\"",
    },
    {
      type: 'text',
      content: "Zara's shells are multiples of 5:\n5, 10, 15, 20, 25, 30...\n\nShe notices something: every number ends in 0 or 5!\n\n\"That's because I'm always adding 5,\" she says. \"5 + 5 = 10, and 10 + 5 = 15. It keeps switching between 0 and 5 at the end!\"",
    },
    {
      type: 'text',
      content: "Zara's friend Marco collects shells in pairs. He always picks up 2 at a time.\n\nHis totals: 2, 4, 6, 8, 10, 12...\n\n\"Mine are all even!\" Marco says.\n\n\"That makes sense,\" says Zara. \"Two things always make a pair. Pairs are even numbers — nothing is left out!\"",
    },
    {
      type: 'worked_example',
      content: "Then they look at groups of 9 shells:",
      example: {
        problem: 'Zara arranges shells in groups of 9. She has 1 group (9), 2 groups (18), 3 groups (27). What pattern do you see in the digits?',
        steps: [
          { explanation: '9: digits are 0 + 9 = 9' },
          { explanation: '18: digits are 1 + 8 = 9' },
          { explanation: '27: digits are 2 + 7 = 9' },
          { explanation: 'The digits always add up to 9!' },
        ],
        answer: 'The digits of every multiple of 9 add up to 9.',
      },
    },
    {
      type: 'interactive',
      content: "Zara wants to test the pattern with 9 × 5.",
      prompt: 'What is 9 × 5? (Check: do the digits add up to 9?)',
      expectedResponse: '45',
    },
    {
      type: 'text',
      content: "4 + 5 = 9. The pattern works!\n\nKnowing patterns helps you check your answers. If you multiply by 9 and the digits don't add to 9, you know to try again!",
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Marco picks up shells in pairs: 2, 4, 6, 8... Are these even or odd numbers?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'All even' },
        { label: 'B', value: 'All odd' },
        { label: 'C', value: 'Some even, some odd' },
        { label: 'D', value: 'None of these' },
      ],
      correct_answer: 'All even',
      difficulty: 1,
      category: 'conceptual',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'Zara counts by 5s: 5, 10, 15, 20, 25, 30. What comes next?',
      type: 'numeric',
      correct_answer: '35',
      difficulty: 2,
      hint: 'Add 5 to the last number. What does 30 + 5 equal?',
      category: 'conceptual',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
    {
      id: 3,
      text: '9 × 8 = 72. Do the digits add up to 9?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'Yes, 7 + 2 = 9' },
        { label: 'B', value: 'No, 7 + 2 = 8' },
        { label: 'C', value: 'Yes, 7 + 2 = 10' },
        { label: 'D', value: 'No, 7 + 2 = 11' },
      ],
      correct_answer: 'Yes, 7 + 2 = 9',
      difficulty: 2,
      hint: 'Add the digits: 7 + 2 = ?',
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
  ],
  summary: 'Patterns are everywhere in math! Multiples of 2 are always even, multiples of 5 end in 0 or 5, and the digits of multiples of 9 add up to 9. Use patterns to check your work!',
  commonMistakes: [
    'Not looking at the ones digit when checking multiples of 5',
    'Forgetting that even numbers include 0, 2, 4, 6, and 8 in the ones place',
  ],
}

export default lesson
