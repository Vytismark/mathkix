import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.1',
  modality: 'visual',
  title: 'Multiplication as Groups (Visual)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: 'Multiplication is a way to count things in equal groups quickly!\n\nInstead of adding the same number over and over, we can multiply.',
    },
    {
      type: 'visual',
      content: 'Look at these groups of stars. There are 3 groups, and each group has 4 stars.',
      visual: {
        type: 'groups',
        data: { groups: 3, itemsPerGroup: 4, emoji: '⭐' },
        alt: '3 groups of 4 stars = 12 stars total',
      },
    },
    {
      type: 'text',
      content: 'We write this as 3 × 4 = 12\n\nThe first number tells us HOW MANY groups.\nThe second number tells us HOW MANY in each group.',
    },
    {
      type: 'visual',
      content: 'Now look at this — 5 groups of 2 apples:',
      visual: {
        type: 'groups',
        data: { groups: 5, itemsPerGroup: 2, emoji: '🍎' },
        alt: '5 groups of 2 apples = 10 apples total',
      },
    },
    {
      type: 'worked_example',
      content: "Let's solve one together!",
      example: {
        problem: 'There are 4 plates. Each plate has 3 cookies. How many cookies in total?',
        steps: [
          { explanation: 'Count the groups: 4 plates = 4 groups' },
          { explanation: 'Count items per group: 3 cookies per plate' },
          { explanation: 'Write the multiplication: 4 × 3' },
          { explanation: 'Count: 3 + 3 + 3 + 3 = 12' },
        ],
        answer: '4 × 3 = 12 cookies',
      },
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'There are 2 boxes with 6 crayons in each box. How many crayons in total?',
      type: 'numeric',
      correct_answer: '12',
      difficulty: 1,
      hint: 'Count: 6 + 6 = ?',
    },
    {
      id: 2,
      text: 'Which multiplication shows 5 groups of 3?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '5 × 3' },
        { label: 'B', value: '3 × 5' },
        { label: 'C', value: '5 + 3' },
        { label: 'D', value: '3 + 5' },
      ],
      correct_answer: '5 × 3',
      difficulty: 1,
    },
    {
      id: 3,
      text: 'There are 6 bags with 4 marbles each. How many marbles altogether?',
      type: 'numeric',
      correct_answer: '24',
      difficulty: 2,
      hint: 'Think: 6 groups of 4. Count by 4s six times.',
    },
  ],
  summary: 'Multiplication means equal groups! The first number is how many groups, the second is how many in each group.',
  commonMistakes: [
    'Mixing up which number is the groups and which is the items per group',
    'Adding the two numbers instead of multiplying (e.g., 3 × 4 = 7 instead of 12)',
  ],
}

export default lesson
