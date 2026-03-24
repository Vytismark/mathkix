import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.5',
  modality: 'interactive',
  title: 'Multiply & Divide Properties (Interactive)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'Let\'s explore three powerful multiplication properties together! I\'ll ask you questions along the way to check your understanding.',
    },
    {
      type: 'visual',
      content: 'Look at this array. Count the rows and columns:',
      visual: {
        type: 'array',
        data: { rows: 3, cols: 5, emoji: '🍎' },
        alt: '3 rows of 5 apples = 15 apples',
      },
    },
    {
      type: 'interactive',
      content: 'That array shows 3 × 5 = 15.',
      prompt: 'If we turn the array sideways so it becomes 5 rows of 3, what is the total?',
      expectedResponse: '15',
    },
    {
      type: 'text',
      content: 'Yes! 3 × 5 = 5 × 3 = 15. That\'s the Commutative Property — swap the order, same answer!',
    },
    {
      type: 'interactive',
      content: 'Now let\'s try the Associative Property.\n\n(2 × 3) × 4: First, what is 2 × 3?',
      prompt: 'What is 2 × 3?',
      expectedResponse: '6',
    },
    {
      type: 'interactive',
      content: 'Good! 2 × 3 = 6. Now multiply by 4.',
      prompt: 'What is 6 × 4?',
      expectedResponse: '24',
    },
    {
      type: 'text',
      content: 'Now let\'s try the Distributive Property! To solve 8 × 7, break the 7 into 5 + 2:\n\n8 × 7 = 8 × 5 + 8 × 2 = 40 + 16 = 56',
    },
    {
      type: 'interactive',
      content: 'Your turn! Solve 6 × 7 by breaking 7 into 5 + 2.\n\n6 × 5 = 30 and 6 × 2 = 12.',
      prompt: 'What is 30 + 12?',
      expectedResponse: '42',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: '9 × 2 = 18. What is 2 × 9?',
      type: 'numeric',
      correct_answer: '18',
      difficulty: 1,
      hint: 'Swap the numbers — the answer stays the same!',
    },
    {
      id: 2,
      text: 'Which shows the distributive property?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '4 × 6 = 4 × 5 + 4 × 1' },
        { label: 'B', value: '4 × 6 = 6 × 4' },
        { label: 'C', value: '(4 × 6) × 1 = 4 × (6 × 1)' },
        { label: 'D', value: '4 + 6 = 6 + 4' },
      ],
      correct_answer: '4 × 6 = 4 × 5 + 4 × 1',
      difficulty: 2,
    },
    {
      id: 3,
      text: 'Use the distributive property: 7 × 8 = 7 × 5 + 7 × 3. What is 7 × 8?',
      type: 'numeric',
      correct_answer: '56',
      difficulty: 3,
      hint: '7 × 5 = 35 and 7 × 3 = 21. Add them together!',
    },
  ],
  summary: 'You explored three properties: Commutative (swap), Associative (regroup), and Distributive (break apart). Use them to make multiplication easier!',
  commonMistakes: [
    'Thinking the commutative property works for division (it does NOT — 12 ÷ 3 is not the same as 3 ÷ 12)',
    'Breaking apart one number but forgetting to multiply both parts',
  ],
}

export default lesson
