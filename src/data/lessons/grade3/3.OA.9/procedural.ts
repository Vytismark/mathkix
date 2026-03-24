import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.9',
  modality: 'procedural',
  title: 'Arithmetic Patterns (Step-by-Step)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: 'You can find patterns in addition and multiplication tables by following these steps:\n\nStep 1: Write out the facts for a number.\nStep 2: Look at the answers. What do you notice?\nStep 3: Describe the pattern.\nStep 4: Explain WHY the pattern works.',
    },
    {
      type: 'text',
      content: 'Pattern Rule 1: Multiples of 2\n\nStep 1: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20\nStep 2: Every answer is even.\nStep 3: Pattern — multiplying by 2 always gives an even number.\nStep 4: Why? Because 2 groups means everything is in pairs. Pairs are always even!',
    },
    {
      type: 'text',
      content: 'Pattern Rule 2: Multiples of 5\n\nStep 1: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50\nStep 2: Every answer ends in 0 or 5.\nStep 3: Pattern — multiples of 5 always end in 0 or 5.\nStep 4: Why? Because 5 + 5 = 10. Every two groups of 5 make a 10. So you keep landing on 0 or 5.',
    },
    {
      type: 'worked_example',
      content: "Let's use the steps for the 9s:",
      example: {
        problem: 'Find and explain the pattern in multiples of 9.',
        steps: [
          { explanation: 'Step 1: Write the facts: 9, 18, 27, 36, 45, 54, 63, 72, 81' },
          { explanation: 'Step 2: Look at the digits — 0+9, 1+8, 2+7, 3+6, 4+5, 5+4, 6+3, 7+2, 8+1' },
          { explanation: 'Step 3: Pattern — the digits always add up to 9!' },
          { explanation: 'Step 4: Why? Each time you add 9, you add 10 and subtract 1. The tens go up by 1 and the ones go down by 1, so the sum stays the same.' },
        ],
        answer: 'Multiples of 9 have digits that add up to 9.',
      },
    },
    {
      type: 'text',
      content: 'Bonus pattern in addition tables:\n\nOdd + odd = even (3 + 5 = 8)\nEven + even = even (4 + 6 = 10)\nOdd + even = odd (3 + 4 = 7)\n\nWhy? Even numbers have pairs. Two sets of pairs make pairs. But odd + odd each has one leftover, and those pair up!',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Which pattern is true for multiples of 5?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'They always end in 0 or 5' },
        { label: 'B', value: 'They are always odd' },
        { label: 'C', value: 'Their digits add up to 5' },
        { label: 'D', value: 'They are always less than 50' },
      ],
      correct_answer: 'They always end in 0 or 5',
      difficulty: 1,
    },
    {
      id: 2,
      text: '9 × 6 = 54. Add the digits: 5 + 4 = ?',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 2,
      hint: 'What is 5 + 4?',
    },
    {
      id: 3,
      text: 'Why are multiples of 2 always even?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'Because 2 groups means pairs, and pairs are always even' },
        { label: 'B', value: 'Because 2 is the smallest number' },
        { label: 'C', value: 'Because 2 is an odd number' },
        { label: 'D', value: 'Because all numbers are even' },
      ],
      correct_answer: 'Because 2 groups means pairs, and pairs are always even',
      difficulty: 2,
      hint: 'Think about what it means to have groups of 2.',
    },
  ],
  summary: 'To find a pattern: (1) list the facts, (2) look at the answers, (3) describe the pattern, (4) explain why it works. The 2s are even, the 5s end in 0 or 5, and the 9s digits add to 9!',
  commonMistakes: [
    'Describing a pattern but not explaining WHY it works',
    'Confusing multiples of 5 (end in 0 or 5) with multiples of 9 (digits add to 9)',
  ],
}

export default lesson
