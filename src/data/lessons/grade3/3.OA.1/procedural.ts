import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.1',
  modality: 'procedural',
  title: 'Multiplication as Groups (Step-by-Step)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: 'When you see a multiplication like 3 × 4, follow these steps to understand what it means:',
    },
    {
      type: 'text',
      content: 'Step 1: Read the FIRST number — that is how many GROUPS you have.\n\n3 × 4 → 3 groups',
    },
    {
      type: 'text',
      content: 'Step 2: Read the SECOND number — that is how many are IN EACH group.\n\n3 × 4 → 4 in each group',
    },
    {
      type: 'text',
      content: 'Step 3: Add the second number that many times.\n\n3 × 4 = 4 + 4 + 4 = 12',
    },
    {
      type: 'worked_example',
      content: "Let's use the steps on a new problem!",
      example: {
        problem: 'What does 5 × 6 mean? Find the answer.',
        steps: [
          { explanation: 'Step 1: First number = 5 groups' },
          { explanation: 'Step 2: Second number = 6 in each group' },
          { explanation: 'Step 3: Add 6 five times: 6 + 6 + 6 + 6 + 6' },
          { explanation: '6 + 6 = 12, + 6 = 18, + 6 = 24, + 6 = 30' },
        ],
        answer: '5 × 6 = 30',
      },
    },
    {
      type: 'interactive',
      content: 'Try the steps yourself!',
      prompt: 'What is 4 × 5? (Hint: 4 groups of 5)',
      expectedResponse: '20',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'What does 2 × 9 mean?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '2 groups of 9' },
        { label: 'B', value: '9 groups of 2' },
        { label: 'C', value: '2 + 9' },
        { label: 'D', value: '9 - 2' },
      ],
      correct_answer: '2 groups of 9',
      difficulty: 1,
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'Use repeated addition to solve 3 × 7.',
      type: 'numeric',
      correct_answer: '21',
      difficulty: 1,
      hint: '7 + 7 + 7 = ?',
      category: 'procedural',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'Find 7 × 4 using the steps you learned.',
      type: 'numeric',
      correct_answer: '28',
      difficulty: 2,
      hint: '7 groups of 4: 4 + 4 + 4 + 4 + 4 + 4 + 4',
      category: 'procedural',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
  ],
  summary: 'To understand multiplication: (1) first number = groups, (2) second number = items per group, (3) add repeatedly.',
  commonMistakes: [
    'Forgetting which number is the groups vs. items per group',
    'Losing count during repeated addition — try skip counting instead',
  ],
}

export default lesson
