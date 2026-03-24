import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.2',
  modality: 'procedural',
  title: 'Division as Sharing (Step-by-Step)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: 'When you see a division problem like 56 ÷ 8, follow these steps to figure out what it means and solve it:',
    },
    {
      type: 'text',
      content: 'Step 1: Find the TOTAL. That is the first number.\n\n56 ÷ 8 → The total is 56.',
    },
    {
      type: 'text',
      content: 'Step 2: Find the DIVISOR. That is the second number. It tells you either:\n• How many groups to make, OR\n• How many go in each group.\n\n56 ÷ 8 → 8 is the divisor.',
    },
    {
      type: 'text',
      content: 'Step 3: Think of the RELATED MULTIPLICATION.\n\nAsk yourself: 8 × ? = 56\n\nIf you know your 8s facts, you know 8 × 7 = 56.\n\nSo 56 ÷ 8 = 7!',
    },
    {
      type: 'worked_example',
      content: "Let's use the steps on another problem!",
      example: {
        problem: 'Solve 42 ÷ 6.',
        steps: [
          { explanation: 'Step 1: Total = 42' },
          { explanation: 'Step 2: Divisor = 6 (we are splitting into 6 groups)' },
          { explanation: 'Step 3: Think — 6 × ? = 42' },
          { explanation: '6 × 7 = 42, so the answer is 7!' },
        ],
        answer: '42 ÷ 6 = 7',
      },
    },
    {
      type: 'interactive',
      content: 'Try the steps yourself!',
      prompt: 'Solve 36 ÷ 9 using the think-multiplication trick. What is the answer?',
      expectedResponse: '4',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'What does 20 ÷ 4 mean?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '20 split into 4 equal groups' },
        { label: 'B', value: '20 plus 4 more' },
        { label: 'C', value: '4 groups of 20' },
        { label: 'D', value: '20 taken away 4 times' },
      ],
      correct_answer: '20 split into 4 equal groups',
      difficulty: 1,
    },
    {
      id: 2,
      text: 'Use the think-multiplication trick to solve 27 ÷ 3.',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 1,
      hint: 'Think: 3 × ? = 27.',
    },
    {
      id: 3,
      text: 'Solve 48 ÷ 8 by thinking of the related multiplication fact.',
      type: 'numeric',
      correct_answer: '6',
      difficulty: 2,
      hint: '8 × ? = 48. Count by 8s: 8, 16, 24, 32, 40, 48.',
    },
  ],
  summary: 'To solve a division problem: (1) find the total, (2) find the divisor, (3) think of the related multiplication. Division and multiplication are opposites!',
  commonMistakes: [
    'Forgetting to use the think-multiplication trick and trying to guess',
    'Mixing up the dividend (total) and the divisor (number of groups)',
  ],
}

export default lesson
