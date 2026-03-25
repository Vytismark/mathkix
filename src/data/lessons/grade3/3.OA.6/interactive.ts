import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.6',
  modality: 'interactive',
  title: 'Division as Unknown-Factor (Interactive)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'Let\'s discover the secret connection between division and multiplication together! Answer the questions as we go.',
    },
    {
      type: 'visual',
      content: 'Here are 12 cookies arranged in groups of 4:',
      visual: {
        type: 'groups',
        data: { groups: 3, itemsPerGroup: 4, emoji: '🍪' },
        alt: '12 cookies in 3 groups of 4',
      },
    },
    {
      type: 'interactive',
      content: 'Count the groups of cookies.',
      prompt: 'How many groups of 4 are there?',
      expectedResponse: '3',
    },
    {
      type: 'text',
      content: 'Right! 12 ÷ 4 = 3.\n\nNow here is the big idea: 12 ÷ 4 = ? is the SAME question as ? × 4 = 12.',
    },
    {
      type: 'interactive',
      content: 'Let\'s test this. Think about ? × 4 = 12.',
      prompt: 'What number times 4 equals 12?',
      expectedResponse: '3',
    },
    {
      type: 'text',
      content: 'Same answer both ways! Division is really just a multiplication problem with a missing number.\n\nThis works because multiplication and division are INVERSE operations — they undo each other.',
    },
    {
      type: 'interactive',
      content: 'Now try this: 30 ÷ 5 = ?\n\nRewrite it: ? × 5 = 30.',
      prompt: 'What number times 5 equals 30?',
      expectedResponse: '6',
    },
    {
      type: 'interactive',
      content: 'Great! One more: 63 ÷ 9 = ?\n\nThink: ? × 9 = 63.',
      prompt: 'What is 63 ÷ 9?',
      expectedResponse: '7',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: '16 ÷ 4 = ? Think: ? × 4 = 16.',
      type: 'numeric',
      correct_answer: '4',
      difficulty: 1,
      hint: 'What times 4 equals 16?',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
    {
      id: 2,
      text: 'You know 8 × 5 = 40. What is 40 ÷ 5?',
      type: 'numeric',
      correct_answer: '8',
      difficulty: 2,
      hint: 'The unknown factor in ? × 5 = 40 is the same as 40 ÷ 5.',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'Which multiplication helps solve 56 ÷ 7?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '8 × 7 = 56' },
        { label: 'B', value: '56 × 7 = 392' },
        { label: 'C', value: '7 + 7 = 14' },
        { label: 'D', value: '7 × 7 = 49' },
      ],
      correct_answer: '8 × 7 = 56',
      difficulty: 2,
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
  ],
  summary: 'Division is a multiplication mystery! Whenever you see A ÷ B = ?, just ask "? × B = A" and use your times tables to find the missing number.',
  commonMistakes: [
    'Forgetting that the answer to the division IS the missing factor in the multiplication',
    'Trying to divide by subtracting over and over instead of using known multiplication facts',
  ],
}

export default lesson
