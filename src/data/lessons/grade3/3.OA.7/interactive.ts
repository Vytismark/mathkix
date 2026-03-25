import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.7',
  modality: 'interactive',
  title: 'Fluently Multiply & Divide Within 100 (Interactive)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'Let\'s practice multiplication and division facts together! I\'ll teach you tricks and quiz you along the way.',
    },
    {
      type: 'interactive',
      content: 'Let\'s warm up with the 2s table. The 2s are just doubles!',
      prompt: 'What is 2 × 7? (Double 7!)',
      expectedResponse: '14',
    },
    {
      type: 'interactive',
      content: 'Great! Now the 5s. Every 5s answer ends in 0 or 5.',
      prompt: 'What is 5 × 8?',
      expectedResponse: '40',
    },
    {
      type: 'text',
      content: 'The 9s trick is super useful!\n\nTo multiply by 9, multiply by 10 first, then subtract the other number.\n\n9 × 5 = 10 × 5 - 5 = 50 - 5 = 45.',
    },
    {
      type: 'interactive',
      content: 'Try the 9s trick yourself!',
      prompt: 'What is 9 × 3? (Think: 10 × 3 = 30, then subtract 3.)',
      expectedResponse: '27',
    },
    {
      type: 'interactive',
      content: 'Now let\'s try near-facts. You know 6 × 6 = 36. To find 6 × 7, just add one more group of 6.',
      prompt: '36 + 6 = ? So what is 6 × 7?',
      expectedResponse: '42',
    },
    {
      type: 'interactive',
      content: 'Division time! Remember: use multiplication to divide.\n\n48 ÷ 8 = ? Think: ? × 8 = 48.',
      prompt: 'What is 48 ÷ 8?',
      expectedResponse: '6',
    },
    {
      type: 'interactive',
      content: 'One more challenge!',
      prompt: 'What is 72 ÷ 9? (Think: ? × 9 = 72)',
      expectedResponse: '8',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'What is 4 × 6?',
      type: 'numeric',
      correct_answer: '24',
      difficulty: 1,
      hint: 'Think of 4 groups of 6, or double 12 (since 2 × 6 = 12, 4 × 6 = double that).',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'What is 54 ÷ 6?',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 2,
      hint: 'Think: ? × 6 = 54. What times 6 equals 54?',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 3,
      text: 'What is 8 × 7?',
      type: 'numeric',
      correct_answer: '56',
      difficulty: 3,
      hint: 'Near-fact: 8 × 7 = 8 × 5 + 8 × 2 = 40 + 16 = 56. Or remember: 5, 6, 7, 8!',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
  ],
  summary: 'You practiced strategies: doubles for 2s, skip-counting for 5s, the 10-minus trick for 9s, and near-facts for tricky ones. Keep practicing until these are automatic!',
  commonMistakes: [
    'Rushing and making small errors — slow down and use a strategy',
    'Not connecting multiplication and division — every times fact gives you a division fact!',
  ],
}

export default lesson
