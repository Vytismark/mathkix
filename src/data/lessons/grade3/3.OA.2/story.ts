import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.2',
  modality: 'story',
  title: 'Division as Sharing (Story)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: "Jake has 24 stickers and wants to share them equally with his 3 best friends (4 kids total, counting Jake).\n\nHow many stickers does each kid get?",
    },
    {
      type: 'text',
      content: "Jake deals them out one by one, like dealing cards.\n\nRound 1: each kid gets 1 sticker (4 used)\nRound 2: each kid gets another (8 used)\nHe keeps going until all 24 are gone.\n\nEach kid ends up with 6 stickers!\n\n24 ÷ 4 = 6",
    },
    {
      type: 'text',
      content: 'When a story says "shared equally" or "split evenly," that is a clue to DIVIDE!\n\nThe total amount ÷ the number of people (or groups) = how many each person gets.',
    },
    {
      type: 'worked_example',
      content: "Jake's mom baked cookies for the class!",
      example: {
        problem: 'She made 35 cookies for 7 tables. Each table gets the same number. How many cookies per table?',
        steps: [
          { explanation: 'Total: 35 cookies' },
          { explanation: 'Number of groups: 7 tables' },
          { explanation: 'Division: 35 ÷ 7' },
          { explanation: 'Think: 7 × ? = 35 → 7 × 5 = 35' },
        ],
        answer: '35 ÷ 7 = 5 cookies per table',
      },
    },
    {
      type: 'interactive',
      content: "Now you help Jake!",
      prompt: 'Jake has 18 trading cards and wants to share them equally among 3 friends. How many cards does each friend get?',
      expectedResponse: '6',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Emma picks 16 flowers and puts them equally into 4 vases. How many flowers go in each vase?',
      type: 'numeric',
      correct_answer: '4',
      difficulty: 1,
      hint: '16 shared equally among 4. Think: 4 × ? = 16.',
    },
    {
      id: 2,
      text: 'A teacher has 30 crayons to share equally among 5 students. Which equation shows this?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '30 ÷ 5 = 6' },
        { label: 'B', value: '30 × 5 = 150' },
        { label: 'C', value: '30 - 5 = 25' },
        { label: 'D', value: '30 + 5 = 35' },
      ],
      correct_answer: '30 ÷ 5 = 6',
      difficulty: 1,
    },
    {
      id: 3,
      text: 'A farmer has 56 eggs and packs them into boxes of 8. How many boxes does he need?',
      type: 'numeric',
      correct_answer: '7',
      difficulty: 2,
      hint: 'This is grouping! How many groups of 8 fit in 56?',
    },
  ],
  summary: 'In story problems, words like "shared equally," "split evenly," or "each" tell you to divide. Total ÷ groups = amount per group.',
  commonMistakes: [
    'Using multiplication when the problem says "shared equally" — that means divide!',
    'Mixing up the total and the number of groups in the division',
  ],
}

export default lesson
