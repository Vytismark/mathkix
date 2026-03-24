import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.7',
  modality: 'procedural',
  title: 'Fluently Multiply & Divide Within 100 (Step-by-Step)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'To be fluent with multiplication and division, you need strategies. Here are step-by-step methods for each group of facts.',
    },
    {
      type: 'text',
      content: 'Strategy 1: Doubles (× 2)\n\nStep 1: Look at the other number.\nStep 2: Double it (add it to itself).\n\nExample: 2 × 8 → double 8 → 8 + 8 = 16.',
    },
    {
      type: 'text',
      content: 'Strategy 2: Fives (× 5)\n\nStep 1: Count by 5s up to that many times.\nStep 2: Or use the clock! 5 × 7 = where the 7 points on a clock = 35.\n\nEvery answer ends in 0 or 5.',
    },
    {
      type: 'text',
      content: 'Strategy 3: Nines (× 9)\n\nStep 1: Multiply by 10 instead.\nStep 2: Subtract the other number.\n\nExample: 9 × 6 → 10 × 6 = 60 → 60 - 6 = 54.',
    },
    {
      type: 'worked_example',
      content: 'Strategy 4: Near-facts — use a fact you know to find one you don\'t!',
      example: {
        problem: 'Find 6 × 8 using a near-fact.',
        steps: [
          { explanation: 'Step 1: Pick a nearby fact you know. You know 6 × 7 = 42.' },
          { explanation: 'Step 2: 6 × 8 is one more group of 6 than 6 × 7.' },
          { explanation: 'Step 3: 42 + 6 = 48.' },
        ],
        answer: '6 × 8 = 48',
      },
    },
    {
      type: 'text',
      content: 'Strategy 5: Division — use multiplication!\n\nFor 63 ÷ 9, think: ? × 9 = 63.\nYou know 7 × 9 = 63, so 63 ÷ 9 = 7.\n\nEvery multiplication fact gives you two division facts!',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Use the doubles strategy: What is 2 × 9?',
      type: 'numeric',
      correct_answer: '18',
      difficulty: 1,
      hint: 'Double 9: 9 + 9 = ?',
    },
    {
      id: 2,
      text: 'Use the 9s strategy: 9 × 7 = 10 × 7 - 7. What is 9 × 7?',
      type: 'numeric',
      correct_answer: '63',
      difficulty: 2,
      hint: '10 × 7 = 70. Subtract 7: 70 - 7 = ?',
    },
    {
      id: 3,
      text: 'You know 8 × 8 = 64. What is 64 ÷ 8?',
      type: 'numeric',
      correct_answer: '8',
      difficulty: 2,
      hint: 'If 8 × 8 = 64, then 64 ÷ 8 = ?',
    },
  ],
  summary: 'Use these strategies: doubles for 2s, skip-count for 5s, "times 10 minus one group" for 9s, and near-facts for everything else. For division, think of the matching multiplication fact!',
  commonMistakes: [
    'Skipping the strategy step and guessing — always use a strategy until the fact is memorized',
    'Forgetting to subtract when using the 9s trick (10 × n, then subtract n)',
  ],
}

export default lesson
