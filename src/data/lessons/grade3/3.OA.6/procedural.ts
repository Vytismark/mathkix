import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.6',
  modality: 'procedural',
  title: 'Division as Unknown-Factor (Step-by-Step)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: 'Here is a step-by-step method to solve any division problem by using multiplication!',
    },
    {
      type: 'text',
      content: 'Step 1: Look at the division problem.\nExample: 32 ÷ 8 = ?\n\nStep 2: Rewrite it as multiplication with a missing number.\n? × 8 = 32\n\nStep 3: Ask yourself, "What number times 8 equals 32?"\n\nStep 4: Use your times tables to find the answer.\n4 × 8 = 32 ✓\n\nSo 32 ÷ 8 = 4.',
    },
    {
      type: 'text',
      content: 'Why does this work?\n\nDivision and multiplication are INVERSE operations. That means they undo each other.\n\nIf 4 × 8 = 32, then 32 ÷ 8 = 4.\nIf 4 × 8 = 32, then 32 ÷ 4 = 8.\n\nOne multiplication fact gives you TWO division facts!',
    },
    {
      type: 'worked_example',
      content: 'Let\'s practice the steps with a new problem.',
      example: {
        problem: '45 ÷ 9 = ?',
        steps: [
          { explanation: 'Step 1: The division problem is 45 ÷ 9 = ?' },
          { explanation: 'Step 2: Rewrite as ? × 9 = 45' },
          { explanation: 'Step 3: Ask "What times 9 equals 45?"' },
          { explanation: 'Step 4: 5 × 9 = 45 ✓' },
        ],
        answer: '45 ÷ 9 = 5',
      },
    },
    {
      type: 'worked_example',
      content: 'One more!',
      example: {
        problem: '48 ÷ 6 = ?',
        steps: [
          { explanation: 'Step 1: The problem is 48 ÷ 6 = ?' },
          { explanation: 'Step 2: Rewrite as ? × 6 = 48' },
          { explanation: 'Step 3: "What times 6 equals 48?"' },
          { explanation: 'Step 4: 8 × 6 = 48 ✓' },
        ],
        answer: '48 ÷ 6 = 8',
      },
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Solve 21 ÷ 7. Think: ? × 7 = 21.',
      type: 'numeric',
      correct_answer: '3',
      difficulty: 1,
      hint: 'What number times 7 equals 21? Try counting by 7s.',
      category: 'procedural',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
    {
      id: 2,
      text: 'You know that 6 × 7 = 42. Which division facts does this give you?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '42 ÷ 6 = 7 and 42 ÷ 7 = 6' },
        { label: 'B', value: '42 ÷ 42 = 1 and 42 ÷ 1 = 42' },
        { label: 'C', value: '6 ÷ 7 = 42 and 7 ÷ 6 = 42' },
        { label: 'D', value: '42 + 6 = 48 and 42 + 7 = 49' },
      ],
      correct_answer: '42 ÷ 6 = 7 and 42 ÷ 7 = 6',
      difficulty: 2,
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 3,
      text: 'Solve 72 ÷ 8 using the unknown-factor method.',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 3,
      hint: '? × 8 = 72. What times 8 equals 72?',
      category: 'procedural',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
  ],
  summary: 'To divide, rewrite as multiplication: A ÷ B = ? becomes ? × B = A. Then use your times tables! One multiplication fact gives you two division facts.',
  commonMistakes: [
    'Putting numbers in the wrong place when rewriting — the big number (dividend) goes on the right side of the equals sign',
    'Not realizing that one multiplication fact (like 6 × 7 = 42) gives two division facts',
  ],
}

export default lesson
