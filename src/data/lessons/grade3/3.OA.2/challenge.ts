import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.2',
  modality: 'challenge',
  title: 'Division as Sharing (Challenge)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "You are the camp counselor at Summer Fun Camp! You need to divide campers and supplies into fair, equal groups. Let's use division!",
    },
    {
      type: 'text',
      content: "There are 48 campers arriving today. You need to split them into 6 equal teams for Color Wars.\n\n48 ÷ 6 = 8 campers per team.",
    },
    {
      type: 'worked_example',
      content: "Now let's handle the supplies!",
      example: {
        problem: 'The camp kitchen made 72 sandwiches for 9 tables. How many sandwiches go on each table?',
        steps: [
          { explanation: 'Total sandwiches: 72' },
          { explanation: 'Number of tables: 9' },
          { explanation: 'Think: 9 × ? = 72' },
          { explanation: '9 × 8 = 72, so each table gets 8 sandwiches.' },
        ],
        answer: '72 ÷ 9 = 8 sandwiches per table',
      },
    },
    {
      type: 'interactive',
      content: 'The camp has 54 life jackets stored equally in 6 bins.',
      prompt: 'How many life jackets are in each bin?',
      expectedResponse: '9',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'The camp got 63 new tennis balls for 7 courts. How many balls does each court get?',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 2,
      hint: '63 ÷ 7 = ? Think: 7 × ? = 63.',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'There are 56 oars that need to go into canoes. Each canoe holds 8 oars. How many canoes are there?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '7 canoes' },
        { label: 'B', value: '8 canoes' },
        { label: 'C', value: '6 canoes' },
        { label: 'D', value: '48 canoes' },
      ],
      correct_answer: '7 canoes',
      difficulty: 2,
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'The camp has 81 campers who each need a buddy. If buddies are in groups of 9, how many buddy groups are there?',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 3,
      hint: '81 ÷ 9 = ? Think: 9 × 9 = ?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
  ],
  summary: 'Division helps you share things fairly! Whether you are splitting into groups or figuring out how many groups, the math works the same way.',
  commonMistakes: [
    'Multiplying instead of dividing when you need to share equally',
    'With bigger numbers, losing track — use your multiplication facts to help!',
  ],
}

export default lesson
