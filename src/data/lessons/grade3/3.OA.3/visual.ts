import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.3',
  modality: 'visual',
  title: 'Word Problems with Equal Groups (Visual)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'Word problems tell a story with numbers. To solve them, you need to figure out if you should MULTIPLY or DIVIDE.\n\nPictures can help you see what is happening!',
    },
    {
      type: 'visual',
      content: 'Problem: There are 4 rows of desks with 5 desks in each row. How many desks are there?\n\nLook at this array — rows and columns make it easy to see!',
      visual: {
        type: 'array',
        data: { rows: 4, cols: 5, emoji: '🟦' },
        alt: '4 rows of 5 desks shown as an array, 20 total',
      },
    },
    {
      type: 'text',
      content: 'An ARRAY shows items in rows and columns.\n\n4 rows × 5 columns = 20 desks\n\nWhen a problem asks for the TOTAL and gives you groups and amount per group, MULTIPLY!',
    },
    {
      type: 'visual',
      content: 'Now a division problem: You have 18 oranges and put 3 in each bag. How many bags?\n\nPicture 18 oranges sorted into groups of 3:',
      visual: {
        type: 'groups',
        data: { groups: 6, itemsPerGroup: 3, emoji: '🍊' },
        alt: '18 oranges in 6 groups of 3',
      },
    },
    {
      type: 'text',
      content: '18 ÷ 3 = 6 bags\n\nWhen a problem gives you the TOTAL and asks how many groups or how many per group, DIVIDE!',
    },
    {
      type: 'worked_example',
      content: "Let's draw a picture to solve this one!",
      example: {
        problem: 'A garden has 3 rows of flowers with 8 flowers in each row. How many flowers are there?',
        steps: [
          { explanation: 'Draw an array: 3 rows, 8 in each row' },
          { explanation: 'We know the groups (3) and items per group (8)' },
          { explanation: 'We need the total, so we MULTIPLY' },
          { explanation: '3 × 8 = 24 flowers' },
        ],
        answer: '3 × 8 = 24 flowers',
      },
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'There are 5 shelves with 6 books on each shelf. How many books are there in all?',
      type: 'numeric',
      correct_answer: '30',
      difficulty: 1,
      hint: 'You know the groups and how many per group. Multiply! 5 × 6 = ?',
      category: 'word_problem',
      abstractionLevel: 'concrete',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'A farmer has 24 carrots and puts 4 in each bunch. How many bunches does he make?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '6 bunches' },
        { label: 'B', value: '4 bunches' },
        { label: 'C', value: '8 bunches' },
        { label: 'D', value: '28 bunches' },
      ],
      correct_answer: '6 bunches',
      difficulty: 1,
      category: 'word_problem',
      abstractionLevel: 'concrete',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'A parking lot has 6 rows with 7 cars in each row. How many cars are in the lot?',
      type: 'numeric',
      correct_answer: '42',
      difficulty: 2,
      hint: 'Think of it as an array: 6 rows × 7 columns.',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
  ],
  summary: 'Use pictures like arrays and groups to understand word problems. If you know the groups and the amount per group, multiply to find the total. If you know the total, divide to find the missing piece.',
  commonMistakes: [
    'Not reading the problem carefully to decide if you should multiply or divide',
    'Confusing rows and columns in an array — rows go across, columns go up and down',
  ],
}

export default lesson
