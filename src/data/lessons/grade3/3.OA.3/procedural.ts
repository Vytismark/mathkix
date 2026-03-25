import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.3',
  modality: 'procedural',
  title: 'Word Problems with Equal Groups (Step-by-Step)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'Solving word problems can feel tricky, but these 4 steps will help you every time!',
    },
    {
      type: 'text',
      content: 'Step 1: READ the problem. Circle the numbers and underline what the question asks.\n\nExample: "There are 7 bags with 5 apples in each bag. How many apples in all?"\n\nNumbers: 7 and 5. Question: How many in all?',
    },
    {
      type: 'text',
      content: 'Step 2: DECIDE — multiply or divide?\n\n• Do you know the groups AND the amount per group? → MULTIPLY to find the total.\n• Do you know the total and need to find groups or per group? → DIVIDE.',
    },
    {
      type: 'text',
      content: "Step 3: WRITE the equation.\n\n7 bags × 5 apples each = ?\n\nStep 4: SOLVE and check.\n\n7 × 5 = 35 apples. Does it make sense? 35 is bigger than 7 and 5, so yes!",
    },
    {
      type: 'worked_example',
      content: "Let's use the steps on a division problem!",
      example: {
        problem: 'Mrs. Lee has 36 markers. She shares them equally among 9 students. How many markers does each student get?',
        steps: [
          { explanation: 'Step 1: Numbers are 36 and 9. Question: how many each?' },
          { explanation: 'Step 2: We know the total (36) and groups (9). We need per group. → DIVIDE' },
          { explanation: 'Step 3: 36 ÷ 9 = ?' },
          { explanation: 'Step 4: 9 × 4 = 36, so 36 ÷ 9 = 4. Each student gets 4 markers.' },
        ],
        answer: '36 ÷ 9 = 4 markers per student',
      },
    },
    {
      type: 'interactive',
      content: 'Your turn! Use the 4 steps.',
      prompt: 'A baker puts 6 cupcakes in each box. He fills 8 boxes. How many cupcakes did he make?',
      expectedResponse: '48',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'There are 3 rows of chairs with 9 chairs in each row. How many chairs are there?',
      type: 'numeric',
      correct_answer: '27',
      difficulty: 1,
      hint: 'You know the groups (3) and per group (9). Multiply!',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'Kim has 40 stickers. She gives 8 stickers to each friend. How many friends get stickers?',
      type: 'numeric',
      correct_answer: '5',
      difficulty: 2,
      hint: 'You know the total (40) and per group (8). Divide!',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'A library has 7 shelves with 8 books on each shelf. How many books are there altogether?',
      type: 'numeric',
      correct_answer: '56',
      difficulty: 2,
      hint: '7 × 8 = ? Think of the 7s or 8s multiplication facts.',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
  ],
  summary: 'Follow the 4 steps: (1) Read and find the numbers, (2) Decide: multiply or divide, (3) Write the equation, (4) Solve and check your answer.',
  commonMistakes: [
    'Skipping the "decide" step and just multiplying every time',
    'Not checking if your answer makes sense at the end',
  ],
}

export default lesson
