import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.8',
  modality: 'challenge',
  title: 'Two-Step Word Problems (Challenge)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "You're in charge of planning the class field trip to the zoo! You'll need to solve two-step problems to get everything ready.",
    },
    {
      type: 'text',
      content: "The class needs snacks for the trip. You buy 6 boxes of granola bars with 8 bars in each box. On the bus, 11 bars get eaten before you even arrive!\n\nHow many bars are left for the zoo?",
    },
    {
      type: 'worked_example',
      content: "Let's figure out the snack situation:",
      example: {
        problem: 'You buy 6 boxes of 8 granola bars. 11 get eaten on the bus. How many are left?',
        steps: [
          { explanation: 'Step 1: Total bars bought: 6 × 8 = 48 bars' },
          { explanation: 'Step 2: Subtract what was eaten: 48 − 11 = 37 bars left' },
          { explanation: 'Equation: n = 6 × 8 − 11, so n = 37' },
          { explanation: 'Reasonableness check: You bought 48 and only 11 were eaten, so 37 left sounds right.' },
        ],
        answer: 'n = 37 granola bars',
      },
    },
    {
      type: 'interactive',
      content: "Now plan the water bottles!",
      prompt: 'You have 4 cases of 9 water bottles. You hand out 15 bottles in the morning. How many are left for the afternoon?',
      expectedResponse: '21',
    },
    {
      type: 'text',
      content: "Let's write that one as an equation:\n\nn = 4 × 9 − 15\nn = 36 − 15\nn = 21 water bottles\n\nDoes 21 make sense? You had 36 bottles and gave out 15. Yes, 21 is reasonable!",
    },
    {
      type: 'text',
      content: "Pro tip: When a problem has big numbers, you can estimate first to check your work.\n\n4 × 9 is close to 4 × 10 = 40\n40 − 15 = 25\n\nOur real answer of 21 is close to 25, so we're on the right track!",
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'At the zoo gift shop, you buy 3 packs of 9 postcards. You mail 8 postcards to friends. How many postcards do you have left?',
      type: 'numeric',
      correct_answer: '19',
      difficulty: 2,
      hint: 'Step 1: 3 × 9 = 27. Step 2: 27 − 8 = ?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 2,
      text: 'The zoo has 7 tanks with 6 fish in each tank. A zookeeper adds 13 new fish. Which equation shows the total fish?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'n = 7 × 6 + 13' },
        { label: 'B', value: 'n = 7 + 6 + 13' },
        { label: 'C', value: 'n = 7 × 13 + 6' },
        { label: 'D', value: 'n = 6 × 13 + 7' },
      ],
      correct_answer: 'n = 7 × 6 + 13',
      difficulty: 2,
      hint: 'First find fish in all tanks (multiply), then add the new fish.',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'The bus has 8 rows of 4 seats. There are 23 students and 6 adults on the trip. How many empty seats are there?',
      type: 'numeric',
      correct_answer: '3',
      difficulty: 3,
      hint: 'Step 1: Total seats = 8 × 4 = 32. Step 2: People on the bus = 23 + 6 = 29. Step 3: 32 − 29 = ?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 3,
    },
  ],
  summary: 'Real-world problems often need two steps. Write an equation with a letter for the unknown, solve step by step, and always estimate to check if your answer is reasonable!',
  commonMistakes: [
    'Getting confused by larger numbers — break it into steps!',
    'Forgetting to check reasonableness with estimation',
    'Missing a hidden step (like adding two groups of people before subtracting)',
  ],
}

export default lesson
