import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.3',
  modality: 'story',
  title: 'Word Problems with Equal Groups (Story)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "Sofia is helping her dad set up for a family picnic. There are lots of things to count!\n\nLet's help her solve the problems she runs into.",
    },
    {
      type: 'text',
      content: 'Sofia puts out 6 plates. She puts 3 strawberries on each plate.\n\n"How many strawberries do I need?" she asks.\n\nShe knows the number of groups (6 plates) and how many per group (3 each). She needs the total.\n\n6 × 3 = 18 strawberries!',
    },
    {
      type: 'text',
      content: 'Next, her dad hands her 32 napkins.\n\n"Put 4 napkins at each seat," he says.\n\nNow Sofia knows the total (32) and how many per group (4). She needs to find how many groups!\n\n32 ÷ 4 = 8 seats.',
    },
    {
      type: 'text',
      content: 'Word problem clues:\n\n• "How many in all?" or "How many total?" → MULTIPLY\n• "How many in each?" or "How many groups?" → DIVIDE\n\nLook for the word "each" — it shows up in both, so read carefully!',
    },
    {
      type: 'worked_example',
      content: "Here's another picnic problem!",
      example: {
        problem: 'Sofia makes 5 sandwiches. She cuts each sandwich into 2 halves. How many half-sandwiches does she have?',
        steps: [
          { explanation: 'Groups: 5 sandwiches' },
          { explanation: 'Per group: 2 halves each' },
          { explanation: 'We need the total, so multiply' },
          { explanation: '5 × 2 = 10 half-sandwiches' },
        ],
        answer: '5 × 2 = 10 half-sandwiches',
      },
    },
    {
      type: 'interactive',
      content: "Your turn to help Sofia!",
      prompt: 'Sofia has 28 grapes to share equally among 7 cups. How many grapes go in each cup?',
      expectedResponse: '4',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'There are 4 bird nests in a tree. Each nest has 3 eggs. How many eggs are there altogether?',
      type: 'numeric',
      correct_answer: '12',
      difficulty: 1,
      hint: 'You know the groups (4) and per group (3). Multiply!',
      category: 'word_problem',
      abstractionLevel: 'concrete',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'A store has 45 apples. They put 9 apples in each bag. How many bags do they fill?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '5 bags' },
        { label: 'B', value: '9 bags' },
        { label: 'C', value: '36 bags' },
        { label: 'D', value: '54 bags' },
      ],
      correct_answer: '5 bags',
      difficulty: 1,
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'A teacher has 8 tables in her classroom. She puts 4 chairs at each table. How many chairs does she need?',
      type: 'numeric',
      correct_answer: '32',
      difficulty: 2,
      hint: '8 tables × 4 chairs each = ?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
  ],
  summary: 'In word problems, figure out what you know and what you need. If you need the total, multiply. If you know the total and need to find groups or per group, divide.',
  commonMistakes: [
    'Always multiplying without checking if the problem is really asking you to divide',
    'Ignoring clue words like "shared equally" (divide) or "in all" (multiply)',
  ],
}

export default lesson
