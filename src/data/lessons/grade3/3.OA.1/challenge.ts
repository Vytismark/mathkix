import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.1',
  modality: 'challenge',
  title: 'Multiplication as Groups (Challenge)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "You're planning a school fair! You need to figure out how many supplies you need using multiplication.",
    },
    {
      type: 'text',
      content: "At the fair, there are game booths. Each booth needs prizes.\n\nIf there are 5 booths and each needs 8 prizes, you need:\n5 × 8 = 40 prizes!",
    },
    {
      type: 'worked_example',
      content: "Here's a trickier challenge:",
      example: {
        problem: 'The fair has 3 food stands. Each stand needs 9 cups AND 9 plates. How many cups are needed? How many plates?',
        steps: [
          { explanation: 'Cups: 3 stands × 9 cups = 27 cups' },
          { explanation: 'Plates: 3 stands × 9 plates = 27 plates' },
          { explanation: 'Notice: the same multiplication works for both!' },
        ],
        answer: '27 cups and 27 plates (3 × 9 = 27 for each)',
      },
    },
    {
      type: 'interactive',
      content: "Now you plan the seating!",
      prompt: 'You set up 7 rows of chairs with 6 chairs in each row. How many chairs total?',
      expectedResponse: '42',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'The face painting booth serves 9 kids per hour. How many kids can it serve in 4 hours?',
      type: 'numeric',
      correct_answer: '36',
      difficulty: 2,
      hint: '4 groups of 9: try counting by 9s.',
    },
    {
      id: 2,
      text: 'You buy 6 packs of balloons with 8 balloons in each pack. Which is correct?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '6 × 8 = 48 balloons' },
        { label: 'B', value: '6 + 8 = 14 balloons' },
        { label: 'C', value: '8 × 8 = 64 balloons' },
        { label: 'D', value: '6 × 6 = 36 balloons' },
      ],
      correct_answer: '6 × 8 = 48 balloons',
      difficulty: 2,
    },
    {
      id: 3,
      text: 'The ring toss game gives 7 rings to each player. If 9 kids play, how many rings are needed?',
      type: 'numeric',
      correct_answer: '63',
      difficulty: 3,
      hint: '9 × 7: try 9 × 7 = 63 (or 7 + 7 + 7 + 7 + 7 + 7 + 7 + 7 + 7).',
    },
  ],
  summary: 'Multiplication helps you plan! Whenever you have equal groups of things, you can multiply to find the total.',
  commonMistakes: [
    'Using addition when the problem has equal groups',
    'Getting confused by extra information in the problem — focus on the groups!',
  ],
}

export default lesson
