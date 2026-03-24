import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.7',
  modality: 'challenge',
  title: 'Fluently Multiply & Divide Within 100 (Challenge)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'You\'re running a snack shop at the school carnival! You\'ll need quick multiplication and division skills to handle orders fast.',
    },
    {
      type: 'text',
      content: 'A customer orders 8 bags of popcorn at 7 tickets each. How much do they owe?\n\n8 × 7 = 56 tickets.\n\nYou need to know that FAST — no time to count on your fingers at the snack shop!',
    },
    {
      type: 'worked_example',
      content: 'You have 63 juice boxes and want to put 9 in each cooler.',
      example: {
        problem: 'How many coolers do you need? 63 ÷ 9 = ?',
        steps: [
          { explanation: 'Think: ? × 9 = 63' },
          { explanation: '7 × 9 = 63 ✓' },
        ],
        answer: '63 ÷ 9 = 7 coolers',
      },
    },
    {
      type: 'text',
      content: 'Speed tips for the hardest facts:\n\n• 6 × 7 = 42 — rhymes: "six times seven is forty-two!"\n• 6 × 8 = 48 — "six times eight is forty-eight!"\n• 7 × 8 = 56 — count up: 5, 6, 7, 8!\n• 8 × 8 = 64 — "I ate and I ate till I was sick on the floor: 8 × 8 = 64!"',
    },
    {
      type: 'interactive',
      content: 'Quick! A customer wants 9 cotton candies at 6 tickets each.',
      prompt: 'What is 9 × 6?',
      expectedResponse: '54',
    },
    {
      type: 'interactive',
      content: 'You earned 72 tickets today and need to split them equally among 8 workers.',
      prompt: 'How many tickets does each worker get? 72 ÷ 8 = ?',
      expectedResponse: '9',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'You sell 6 bags of chips at 6 tickets each. How many tickets is that?',
      type: 'numeric',
      correct_answer: '36',
      difficulty: 2,
      hint: '6 × 6 = ?',
    },
    {
      id: 2,
      text: 'You have 48 prizes to share among 8 game booths. How many prizes per booth?',
      type: 'numeric',
      correct_answer: '6',
      difficulty: 2,
      hint: '? × 8 = 48. What times 8 equals 48?',
    },
    {
      id: 3,
      text: 'The cotton candy machine makes 7 servings per batch. You need 56 servings. How many batches?',
      type: 'numeric',
      correct_answer: '8',
      difficulty: 3,
      hint: '56 ÷ 7 = ? Think: ? × 7 = 56.',
    },
  ],
  summary: 'Quick math is a superpower! The more you practice your times tables and division facts, the faster and more confident you get. Use strategies until the facts become automatic!',
  commonMistakes: [
    'Confusing nearby facts like 6 × 7 (42) and 6 × 8 (48) — practice these pairs together',
    'Panicking on division — just flip it to multiplication and use your times tables',
  ],
}

export default lesson
