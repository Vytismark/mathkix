import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.8',
  modality: 'visual',
  title: 'Two-Step Word Problems (Visual)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'Some math problems need TWO steps to solve!\n\nYou do one operation first, then use that answer to do a second operation.',
    },
    {
      type: 'visual',
      content: 'Sam has 3 bags with 6 apples in each bag. Look at all the apples:',
      visual: {
        type: 'groups',
        data: { groups: 3, itemsPerGroup: 6, emoji: '🍎' },
        alt: '3 bags of 6 apples = 18 apples total',
      },
    },
    {
      type: 'text',
      content: 'Step 1: Find the total apples.\n3 × 6 = 18 apples\n\nNow Sam eats 4 apples. We need to subtract!\n\nStep 2: 18 − 4 = 14 apples left',
    },
    {
      type: 'visual',
      content: 'We can show this on a number line. Start at 18, jump back 4:',
      visual: {
        type: 'number_line',
        data: { start: 10, end: 20, marks: [14, 18], highlight: [14, 18] },
        alt: 'Number line from 10 to 20 showing 18 minus 4 equals 14',
      },
    },
    {
      type: 'worked_example',
      content: 'We can write one equation using a letter for the unknown:\n\nn = 3 × 6 − 4',
      example: {
        problem: 'Sam has 3 bags of 6 apples and eats 4. How many are left?',
        steps: [
          { explanation: 'Step 1: Multiply to find the total: 3 × 6 = 18' },
          { explanation: 'Step 2: Subtract the ones eaten: 18 − 4 = 14' },
          { explanation: 'Write it as one equation: n = 3 × 6 − 4' },
          { explanation: 'Check: Does 14 apples make sense? He started with 18 and only ate 4, so yes!' },
        ],
        answer: 'n = 14 apples',
      },
    },
    {
      type: 'visual',
      content: 'Here is another example. There are 4 rows of 5 chairs, and 3 more chairs are added:',
      visual: {
        type: 'array',
        data: { rows: 4, cols: 5, emoji: '🪑' },
        alt: '4 rows of 5 chairs = 20 chairs, then add 3 more',
      },
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Lily has 2 packs of 8 stickers. She gives away 5 stickers. How many does she have left? (Hint: first find 2 × 8, then subtract 5)',
      type: 'numeric',
      correct_answer: '11',
      difficulty: 2,
      hint: 'Step 1: 2 × 8 = 16. Step 2: 16 − 5 = ?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 2,
      text: 'Jake buys 3 boxes of 7 crayons and then finds 4 more crayons. Which equation shows the total?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'n = 3 × 7 + 4' },
        { label: 'B', value: 'n = 3 + 7 + 4' },
        { label: 'C', value: 'n = 3 × 7 × 4' },
        { label: 'D', value: 'n = 7 × 4 + 3' },
      ],
      correct_answer: 'n = 3 × 7 + 4',
      difficulty: 2,
      hint: 'First multiply the boxes times crayons, then add the extra ones.',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'A store has 5 shelves with 9 toys on each shelf. A worker removes 8 toys. How many toys are on the shelves now?',
      type: 'numeric',
      correct_answer: '37',
      difficulty: 3,
      hint: 'Step 1: 5 × 9 = 45. Step 2: 45 − 8 = ?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
  ],
  summary: 'Two-step problems need two operations. Solve step by step, use a letter like n for the unknown, and always check — does your answer make sense?',
  commonMistakes: [
    'Doing only one step and forgetting the second operation',
    'Doing the operations in the wrong order (subtract before multiplying)',
    'Not checking if the answer is reasonable',
  ],
}

export default lesson
