import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.4',
  modality: 'procedural',
  title: 'Find the Missing Number (Step-by-Step)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: 'When you see an equation with a missing number, follow these steps to solve it:',
    },
    {
      type: 'text',
      content: 'Step 1: IDENTIFY the missing number.\n\nLook at the equation. Which number is replaced by a "?" or a blank?\n\nExamples:\n• ? × 6 = 42 → the first number is missing\n• 8 × ? = 56 → the second number is missing\n• 48 ÷ ? = 6 → the divisor is missing',
    },
    {
      type: 'text',
      content: 'Step 2: USE THE OPPOSITE OPERATION.\n\nMultiplication and division are opposites!\n\n• If the equation uses ×, divide to find the missing number.\n• If the equation uses ÷, multiply to find the missing number.',
    },
    {
      type: 'text',
      content: 'Step 3: SOLVE.\n\n? × 6 = 42 → Think: 42 ÷ 6 = 7. So ? = 7.\n\nStep 4: CHECK by putting the number back.\n\n7 × 6 = 42 ✓ It works!',
    },
    {
      type: 'worked_example',
      content: "Let's use the steps!",
      example: {
        problem: 'Find the missing number: 8 × ? = 72',
        steps: [
          { explanation: 'Step 1: The second number is missing.' },
          { explanation: 'Step 2: The equation uses ×, so use ÷ (the opposite).' },
          { explanation: 'Step 3: 72 ÷ 8 = 9. So ? = 9.' },
          { explanation: 'Step 4: Check — 8 × 9 = 72 ✓' },
        ],
        answer: '? = 9',
      },
    },
    {
      type: 'interactive',
      content: 'Your turn! Follow the steps.',
      prompt: 'Find the missing number: ? × 7 = 63',
      expectedResponse: '9',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Find the missing number: 6 × ? = 30',
      type: 'numeric',
      correct_answer: '5',
      difficulty: 1,
      hint: 'Use the opposite: 30 ÷ 6 = ?',
    },
    {
      id: 2,
      text: 'Find the missing number: 45 ÷ ? = 5',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 2,
      hint: 'Use the opposite: ? × 5 = 45. What times 5 is 45?',
    },
    {
      id: 3,
      text: 'Find the missing number: ? × 8 = 64',
      type: 'numeric',
      correct_answer: '8',
      difficulty: 2,
      hint: 'Think: 64 ÷ 8 = ?',
    },
  ],
  summary: 'To find a missing number: (1) find what is missing, (2) use the opposite operation, (3) solve, (4) check your answer!',
  commonMistakes: [
    'Forgetting to use the opposite operation and trying to guess',
    'Skipping the check step — always put your answer back in to make sure it works!',
  ],
}

export default lesson
