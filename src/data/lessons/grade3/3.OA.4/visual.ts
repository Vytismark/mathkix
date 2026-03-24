import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.4',
  modality: 'visual',
  title: 'Find the Missing Number (Visual)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: 'Sometimes in math, one number is MISSING and you need to find it!\n\nA question mark (?) stands for the number you need to figure out.\n\nExample: ? × 4 = 20',
    },
    {
      type: 'visual',
      content: 'Look at these groups. You know there are 20 stars total and 4 in each group. How many groups are there?',
      visual: {
        type: 'groups',
        data: { groups: 5, itemsPerGroup: 4, emoji: '⭐' },
        alt: '5 groups of 4 stars, 20 stars total',
      },
    },
    {
      type: 'text',
      content: 'Count the groups: 5!\n\nSo ? × 4 = 20 → the missing number is 5.\n\nYou can also think: 20 ÷ 4 = 5. Division helps you find the missing number!',
    },
    {
      type: 'visual',
      content: 'Now try this: 3 × ? = 18\n\nYou know there are 3 groups. The total is 18. How many are in each group?',
      visual: {
        type: 'groups',
        data: { groups: 3, itemsPerGroup: 6, emoji: '🔵' },
        alt: '3 groups of 6 blue circles, 18 total',
      },
    },
    {
      type: 'text',
      content: 'Each group has 6! So 3 × ? = 18 → ? = 6.\n\nYou can check: 3 × 6 = 18 ✓\n\nOr think: 18 ÷ 3 = 6.',
    },
    {
      type: 'worked_example',
      content: "Let's use a number line for a division problem!",
      example: {
        problem: 'Find the missing number: 36 ÷ ? = 9',
        steps: [
          { explanation: 'We need: what number do we divide 36 by to get 9?' },
          { explanation: 'Think of the related multiplication: ? × 9 = 36' },
          { explanation: '4 × 9 = 36 ✓' },
          { explanation: 'The missing number is 4!' },
        ],
        answer: '36 ÷ 4 = 9, so ? = 4',
      },
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Find the missing number: ? × 3 = 15',
      type: 'numeric',
      correct_answer: '5',
      difficulty: 1,
      hint: 'Think: how many groups of 3 make 15? Or: 15 ÷ 3 = ?',
    },
    {
      id: 2,
      text: 'What is the missing number in 4 × ? = 28?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '7' },
        { label: 'B', value: '6' },
        { label: 'C', value: '8' },
        { label: 'D', value: '24' },
      ],
      correct_answer: '7',
      difficulty: 1,
    },
    {
      id: 3,
      text: 'Find the missing number: 56 ÷ ? = 7',
      type: 'numeric',
      correct_answer: '8',
      difficulty: 2,
      hint: 'Think: ? × 7 = 56. What times 7 equals 56?',
    },
  ],
  summary: 'To find a missing number, use the opposite operation. If it is a multiplication with a missing number, divide. If it is a division with a missing number, multiply.',
  commonMistakes: [
    'Guessing the missing number instead of using the opposite operation',
    'Forgetting to check your answer by putting it back into the equation',
  ],
}

export default lesson
