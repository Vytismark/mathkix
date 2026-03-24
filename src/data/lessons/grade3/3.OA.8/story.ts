import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.8',
  modality: 'story',
  title: 'Two-Step Word Problems (Story)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "Emma is helping at the school bake sale! She bakes 4 trays of cookies with 6 cookies on each tray.\n\nThen her brother eats 5 cookies before the sale starts. Oh no! How many cookies does she have left to sell?",
    },
    {
      type: 'text',
      content: "This problem has TWO parts:\n\nPart 1: How many cookies did Emma bake?\n4 trays × 6 cookies = 24 cookies\n\nPart 2: How many are left after her brother ate some?\n24 − 5 = 19 cookies left",
    },
    {
      type: 'text',
      content: "We can write this as one equation using a letter:\n\nn = 4 × 6 − 5\nn = 24 − 5\nn = 19\n\nThe letter n stands for the number we don't know yet — the answer!",
    },
    {
      type: 'worked_example',
      content: "Emma's friend Carlos is setting up the tables!",
      example: {
        problem: 'Carlos puts 3 tablecloths out. He sets 8 cups on each table. Then he adds 6 extra cups for the helpers. How many cups are there in all?',
        steps: [
          { explanation: 'Step 1: Find cups on the tables: 3 × 8 = 24 cups' },
          { explanation: 'Step 2: Add the extra cups: 24 + 6 = 30 cups' },
          { explanation: 'Equation: n = 3 × 8 + 6' },
          { explanation: 'Check: 30 cups for 3 tables plus helpers? That sounds right!' },
        ],
        answer: 'n = 30 cups',
      },
    },
    {
      type: 'interactive',
      content: "Now you help at the bake sale!",
      prompt: 'Emma makes 2 plates of 9 brownies. She sells 7 brownies. How many are left?',
      expectedResponse: '11',
    },
    {
      type: 'text',
      content: "After you solve a two-step problem, always ask yourself:\n\n\"Does my answer make sense?\"\n\nIf Emma made 18 brownies and sold 7, having 11 left makes sense. If you got 100, that would be too many!",
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Rosa buys 3 bags of 5 oranges. She eats 2 oranges on the way home. How many oranges does she have now?',
      type: 'numeric',
      correct_answer: '13',
      difficulty: 2,
      hint: 'First find the total: 3 × 5. Then subtract the ones she ate.',
    },
    {
      id: 2,
      text: 'Dan has 4 boxes of 6 toy cars. His mom gives him 3 more cars. Which equation shows how many cars Dan has?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'n = 4 × 6 + 3' },
        { label: 'B', value: 'n = 4 + 6 + 3' },
        { label: 'C', value: 'n = 4 × 3 + 6' },
        { label: 'D', value: 'n = 6 × 3 + 4' },
      ],
      correct_answer: 'n = 4 × 6 + 3',
      difficulty: 2,
      hint: 'Dan starts with 4 boxes of 6 cars (multiply), then gets 3 more (add).',
    },
    {
      id: 3,
      text: 'At the bake sale, there are 6 plates with 8 muffins each. Students buy 15 muffins. How many muffins are left?',
      type: 'numeric',
      correct_answer: '33',
      difficulty: 3,
      hint: 'Step 1: 6 × 8 = 48. Step 2: 48 − 15 = ?',
    },
  ],
  summary: 'Two-step word problems tell a story with two things happening. Solve one step at a time, write an equation with a letter for the unknown, and check that your answer makes sense!',
  commonMistakes: [
    'Stopping after the first step and forgetting there is a second part',
    'Mixing up when to add vs. subtract in the second step',
    'Not re-reading the problem to make sure you answered the right question',
  ],
}

export default lesson
