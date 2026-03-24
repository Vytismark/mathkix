import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.1',
  modality: 'story',
  title: 'Multiplication as Groups (Story)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: "Mia is setting up for her birthday party! She puts out 4 tables, and she places 5 cupcakes on each table.\n\nHow can she figure out the total number of cupcakes without counting each one?",
    },
    {
      type: 'text',
      content: "She could add: 5 + 5 + 5 + 5 = 20\n\nBut there's a faster way — multiplication!\n\n4 tables × 5 cupcakes = 20 cupcakes",
    },
    {
      type: 'text',
      content: "Multiplication is a shortcut for adding equal groups.\n\n4 × 5 means \"4 groups of 5\"\n\nThe first number = how many groups\nThe second number = how many in each group",
    },
    {
      type: 'worked_example',
      content: "Mia also has party bags to fill!",
      example: {
        problem: 'Mia fills 3 party bags with 7 candies each. How many candies does she need?',
        steps: [
          { explanation: 'Groups: 3 party bags' },
          { explanation: 'Items per group: 7 candies' },
          { explanation: 'Multiplication: 3 × 7' },
          { explanation: '7 + 7 + 7 = 21 candies' },
        ],
        answer: '3 × 7 = 21 candies',
      },
    },
    {
      type: 'interactive',
      content: "Now it's your turn to help Mia!",
      prompt: 'Mia puts 6 flowers in each of 2 vases. How many flowers total?',
      expectedResponse: '12',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Leo has 3 fish tanks with 5 fish in each. How many fish does he have?',
      type: 'numeric',
      correct_answer: '15',
      difficulty: 1,
      hint: '3 groups of 5: count by 5s three times.',
    },
    {
      id: 2,
      text: 'A baker puts 4 muffins on each of 7 trays. Which equation shows the total?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '7 × 4 = 28' },
        { label: 'B', value: '7 + 4 = 11' },
        { label: 'C', value: '4 × 4 = 16' },
        { label: 'D', value: '7 - 4 = 3' },
      ],
      correct_answer: '7 × 4 = 28',
      difficulty: 1,
    },
    {
      id: 3,
      text: 'Sara reads 8 pages each night for 5 nights. How many pages does she read in total?',
      type: 'numeric',
      correct_answer: '40',
      difficulty: 2,
      hint: '5 groups of 8. Try counting by 8s: 8, 16, 24, 32, 40.',
    },
  ],
  summary: 'Multiplication is a shortcut for adding equal groups. In a story problem, look for "each" or "per" — that tells you the groups!',
  commonMistakes: [
    'Adding instead of multiplying when the problem says "each"',
    'Not identifying which number is the group and which is per group',
  ],
}

export default lesson
