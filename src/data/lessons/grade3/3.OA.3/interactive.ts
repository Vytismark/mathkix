import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.3',
  modality: 'interactive',
  title: 'Word Problems with Equal Groups (Interactive)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "Let's practice solving word problems together! I'll walk you through each one and ask you questions along the way.",
    },
    {
      type: 'visual',
      content: 'Look at this array of flowers planted in a garden:',
      visual: {
        type: 'array',
        data: { rows: 3, cols: 6, emoji: '🌸' },
        alt: '3 rows of 6 flowers, 18 total',
      },
    },
    {
      type: 'interactive',
      content: 'Count the rows in the flower garden above.',
      prompt: 'How many rows of flowers are there?',
      expectedResponse: '3',
    },
    {
      type: 'interactive',
      content: 'Now count how many flowers are in one row.',
      prompt: 'How many flowers are in each row?',
      expectedResponse: '6',
    },
    {
      type: 'interactive',
      content: 'You know the groups (3 rows) and per group (6 flowers). Should you multiply or divide to find the total?',
      prompt: 'What is 3 × 6?',
      expectedResponse: '18',
    },
    {
      type: 'text',
      content: 'Great! 3 × 6 = 18 flowers.\n\nNow let\'s try a division word problem!',
    },
    {
      type: 'interactive',
      content: 'A teacher has 30 pencils. She puts them in cups with 5 pencils in each cup.',
      prompt: 'How many cups does she use? (30 ÷ 5 = ?)',
      expectedResponse: '6',
    },
    {
      type: 'interactive',
      content: 'How did you know to divide instead of multiply?',
      prompt: 'Was the question asking for the total, or the number of groups? (Type: groups)',
      expectedResponse: 'groups',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'There are 4 rows of seats with 7 seats in each row. How many seats are there?',
      type: 'numeric',
      correct_answer: '28',
      difficulty: 1,
      hint: 'You know rows and seats per row. Multiply!',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'A farmer has 35 eggs and puts 5 in each carton. How many cartons does he fill?',
      type: 'numeric',
      correct_answer: '7',
      difficulty: 1,
      hint: 'You know the total and per group. Divide! 35 ÷ 5 = ?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'There are 9 teams in a league. Each team has 6 players. How many players are in the league?',
      type: 'numeric',
      correct_answer: '54',
      difficulty: 2,
      hint: '9 × 6 = ? Try counting by 6s nine times.',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
  ],
  summary: 'When solving word problems, always ask: do I know the groups and per-group amount? Then multiply. Do I know the total? Then divide to find the missing piece.',
  commonMistakes: [
    'Not stopping to decide if the problem is multiplication or division',
    'Rushing through the problem without identifying what the question is asking',
  ],
}

export default lesson
