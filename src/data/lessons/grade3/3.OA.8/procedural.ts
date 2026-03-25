import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.8',
  modality: 'procedural',
  title: 'Two-Step Word Problems (Step-by-Step)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'When you see a word problem with two things happening, follow these steps:\n\nStep 1: Read the problem carefully. Find the two operations.\nStep 2: Solve the first operation.\nStep 3: Use that answer to solve the second operation.\nStep 4: Write the full equation with a letter.\nStep 5: Check — does the answer make sense?',
    },
    {
      type: 'text',
      content: 'How do you know it is a two-step problem?\n\nLook for clue words:\n• "and then" — something else happens\n• "how many are left" — subtract after another step\n• "in all" or "altogether" — add after another step',
    },
    {
      type: 'worked_example',
      content: "Let's follow the steps with a problem:",
      example: {
        problem: 'Ava has 5 bags of 4 marbles. She gives 7 marbles to a friend. How many does she have left?',
        steps: [
          { explanation: 'Step 1: Two operations — multiply bags × marbles, then subtract the ones given away.' },
          { explanation: 'Step 2: First operation: 5 × 4 = 20 marbles total' },
          { explanation: 'Step 3: Second operation: 20 − 7 = 13 marbles left' },
          { explanation: 'Step 4: Equation: n = 5 × 4 − 7, so n = 13' },
          { explanation: 'Step 5: Check — she had 20 and gave away 7. Is 13 reasonable? Yes!' },
        ],
        answer: 'n = 13 marbles',
      },
    },
    {
      type: 'worked_example',
      content: "Let's try one with addition as the second step:",
      example: {
        problem: 'Ben buys 3 packs of 6 pencils. Then he finds 5 more pencils in his desk. How many pencils does he have now?',
        steps: [
          { explanation: 'Step 1: Two operations — multiply packs × pencils, then add the extra pencils.' },
          { explanation: 'Step 2: First operation: 3 × 6 = 18 pencils' },
          { explanation: 'Step 3: Second operation: 18 + 5 = 23 pencils' },
          { explanation: 'Step 4: Equation: n = 3 × 6 + 5, so n = 23' },
          { explanation: 'Step 5: Check — 18 pencils plus 5 more is 23. Makes sense!' },
        ],
        answer: 'n = 23 pencils',
      },
    },
    {
      type: 'interactive',
      content: 'Your turn! Follow the steps.',
      prompt: 'Mia has 2 rows of 9 stickers. She uses 6 stickers on her notebook. How many stickers are left? (Follow all 5 steps!)',
      expectedResponse: '12',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'There are 4 tables with 5 books on each. A teacher adds 8 more books. How many books are there now?',
      type: 'numeric',
      correct_answer: '28',
      difficulty: 2,
      hint: 'Step 2: 4 × 5 = 20. Step 3: 20 + 8 = ?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 2,
      text: 'Which shows the correct steps for: "3 bags of 8 apples, then eat 10"?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '3 × 8 = 24, then 24 − 10 = 14' },
        { label: 'B', value: '3 + 8 = 11, then 11 − 10 = 1' },
        { label: 'C', value: '8 − 3 = 5, then 5 + 10 = 15' },
        { label: 'D', value: '3 × 10 = 30, then 30 − 8 = 22' },
      ],
      correct_answer: '3 × 8 = 24, then 24 − 10 = 14',
      difficulty: 2,
      hint: 'First multiply bags times apples, then subtract the eaten ones.',
      category: 'procedural',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'A farmer collects 7 baskets of 6 eggs. On the way home, 9 eggs break. How many good eggs are left?',
      type: 'numeric',
      correct_answer: '33',
      difficulty: 3,
      hint: 'Step 2: 7 × 6 = 42. Step 3: 42 − 9 = ?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
  ],
  summary: 'For two-step problems: (1) find the two operations, (2) solve the first, (3) use that answer for the second, (4) write the equation with a letter, (5) check your answer!',
  commonMistakes: [
    'Skipping step 1 and picking the wrong operations',
    'Doing the two operations in the wrong order',
    'Forgetting to check if the answer is reasonable at the end',
  ],
}

export default lesson
