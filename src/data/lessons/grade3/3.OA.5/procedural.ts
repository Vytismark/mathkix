import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.5',
  modality: 'procedural',
  title: 'Multiply & Divide Properties (Step-by-Step)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'There are three properties you can use as strategies to make multiplication and division easier. Let\'s learn each one step by step.',
    },
    {
      type: 'text',
      content: 'Property 1: Commutative Property\n\nStep 1: Look at the two numbers being multiplied.\nStep 2: Swap their order.\nStep 3: The answer stays the same!\n\nExample: 3 × 4 = 4 × 3 = 12',
    },
    {
      type: 'text',
      content: 'Property 2: Associative Property\n\nStep 1: Look at three numbers being multiplied.\nStep 2: Pick two to multiply first (use parentheses).\nStep 3: Then multiply by the third number.\nStep 4: The answer is the same no matter which two you start with!\n\nExample: (2 × 3) × 4 = 6 × 4 = 24\n2 × (3 × 4) = 2 × 12 = 24',
    },
    {
      type: 'worked_example',
      content: 'Property 3: Distributive Property\n\nThis is your best trick for hard problems! Break one number into parts.',
      example: {
        problem: 'Solve 7 × 6 by breaking apart the 6.',
        steps: [
          { explanation: 'Step 1: Break 6 into two friendly numbers: 5 + 1' },
          { explanation: 'Step 2: Multiply 7 by each part: 7 × 5 and 7 × 1' },
          { explanation: 'Step 3: 7 × 5 = 35' },
          { explanation: 'Step 4: 7 × 1 = 7' },
          { explanation: 'Step 5: Add the parts: 35 + 7 = 42' },
        ],
        answer: '7 × 6 = 42',
      },
    },
    {
      type: 'worked_example',
      content: 'Let\'s try the distributive property another way!',
      example: {
        problem: 'Solve 9 × 4 by breaking apart the 9.',
        steps: [
          { explanation: 'Step 1: Break 9 into 10 - 1' },
          { explanation: 'Step 2: Multiply 4 by each part: 10 × 4 and 1 × 4' },
          { explanation: 'Step 3: 10 × 4 = 40' },
          { explanation: 'Step 4: 1 × 4 = 4' },
          { explanation: 'Step 5: Subtract: 40 - 4 = 36' },
        ],
        answer: '9 × 4 = 36',
      },
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: '5 × 7 = 35. What is 7 × 5?',
      type: 'numeric',
      correct_answer: '35',
      difficulty: 1,
      hint: 'Commutative property: swap the numbers, same answer.',
    },
    {
      id: 2,
      text: '(2 × 4) × 5 = 8 × 5 = 40. What is 2 × (4 × 5)?',
      type: 'numeric',
      correct_answer: '40',
      difficulty: 2,
      hint: 'Associative property: group differently, same answer. 4 × 5 = 20, then 2 × 20 = ?',
    },
    {
      id: 3,
      text: 'Solve 6 × 9 by breaking apart: 6 × 9 = 6 × 10 - 6 × 1. What is 6 × 9?',
      type: 'numeric',
      correct_answer: '54',
      difficulty: 3,
      hint: '6 × 10 = 60, 6 × 1 = 6. Now subtract: 60 - 6 = ?',
    },
  ],
  summary: 'Three step-by-step strategies: (1) Commutative — swap the order, (2) Associative — regroup three factors, (3) Distributive — break apart and add. Use these to make hard problems easier!',
  commonMistakes: [
    'Forgetting to add (or subtract) both parts in the distributive property',
    'Mixing up commutative and associative — commutative swaps two numbers, associative regroups three',
  ],
}

export default lesson
