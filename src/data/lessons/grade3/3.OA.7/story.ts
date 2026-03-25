import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.7',
  modality: 'story',
  title: 'Fluently Multiply & Divide Within 100 (Story)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'Jake wants to be the fastest math kid in his class. His teacher says, "If you learn your times tables by heart, math will feel like a superpower!"\n\nJake decides to learn smart — using strategies, not just memorizing.',
    },
    {
      type: 'text',
      content: 'Strategy 1: Start with what you know!\n\nJake already knows his 1s, 2s, 5s, and 10s.\n\n"The 2s are just doubles!" he says. "2 × 6 is double 6 = 12."\n"The 5s always end in 0 or 5!"\n"The 10s? Just add a zero!"',
    },
    {
      type: 'text',
      content: 'Strategy 2: Use the 9s trick!\n\nJake\'s friend shows him: for 9 × 7, think 10 × 7 = 70, then subtract 7.\n70 - 7 = 63. So 9 × 7 = 63!\n\nJake tries 9 × 6: 10 × 6 = 60, minus 6 = 54. It works!',
    },
    {
      type: 'worked_example',
      content: 'Strategy 3: Use near-facts for the tricky ones!\n\nJake is stuck on 6 × 7. But he knows 6 × 6 = 36.',
      example: {
        problem: 'Find 6 × 7 using a near-fact.',
        steps: [
          { explanation: 'Jake knows 6 × 6 = 36' },
          { explanation: '6 × 7 is one more group of 6' },
          { explanation: '36 + 6 = 42' },
        ],
        answer: '6 × 7 = 42',
      },
    },
    {
      type: 'text',
      content: 'Jake also remembers that multiplication helps with division!\n\nIf he knows 8 × 7 = 56, then he also knows:\n56 ÷ 7 = 8 and 56 ÷ 8 = 7.\n\nTwo facts for free!',
    },
    {
      type: 'interactive',
      content: 'Jake is quizzing himself. Help him out!',
      prompt: 'What is 8 × 4?',
      expectedResponse: '32',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Jake knows 3 × 5 = 15. What is 15 ÷ 3?',
      type: 'numeric',
      correct_answer: '5',
      difficulty: 1,
      hint: 'If 3 × 5 = 15, then 15 ÷ 3 = 5.',
      category: 'procedural',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'What is 9 × 8? Use the 9s trick: 10 × 8 minus 8.',
      type: 'numeric',
      correct_answer: '72',
      difficulty: 2,
      hint: '10 × 8 = 80. Now subtract 8: 80 - 8 = ?',
      category: 'procedural',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'Jake knows 7 × 7 = 49. What is 7 × 8?',
      type: 'numeric',
      correct_answer: '56',
      difficulty: 3,
      hint: '7 × 8 is one more group of 7. So 49 + 7 = ?',
      category: 'procedural',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
  ],
  summary: 'Be like Jake — learn smart! Start with easy facts (2s, 5s, 10s), use the 9s trick, and build on facts you already know. Every multiplication fact also gives you division facts!',
  commonMistakes: [
    'Trying to memorize everything at once — start with easy tables and build up!',
    'Forgetting that multiplication facts also give you division facts for free',
  ],
}

export default lesson
