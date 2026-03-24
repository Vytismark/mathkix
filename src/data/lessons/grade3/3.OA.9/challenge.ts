import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.9',
  modality: 'challenge',
  title: 'Arithmetic Patterns (Challenge)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "You're helping your teacher create a math bulletin board! You need to sort numbers and find patterns to make the display.",
    },
    {
      type: 'text',
      content: 'For the display, you need to sort these numbers:\n12, 15, 18, 20, 25, 27, 30, 36, 40, 45\n\nWhich ones are multiples of 2? (even numbers)\n12, 18, 20, 30, 36, 40\n\nWhich ones are multiples of 5? (end in 0 or 5)\n15, 20, 25, 30, 40, 45\n\nSome numbers fit BOTH patterns! 20, 30, and 40 are multiples of 2 AND 5.',
    },
    {
      type: 'worked_example',
      content: "Your teacher asks you to check a student's work using the 9s pattern:",
      example: {
        problem: 'A student says 9 × 8 = 74. Use the digit-sum pattern to check. Is the student correct?',
        steps: [
          { explanation: 'The pattern says: digits of a multiple of 9 add up to 9.' },
          { explanation: 'Check 74: 7 + 4 = 11. That is NOT 9!' },
          { explanation: 'So 74 is probably wrong. Let us find the real answer.' },
          { explanation: '9 × 8 = 72. Check: 7 + 2 = 9. That follows the pattern!' },
        ],
        answer: 'The student was wrong. 9 × 8 = 72, not 74.',
      },
    },
    {
      type: 'text',
      content: "Here's another cool pattern from the addition table:\n\nOdd + odd = even (7 + 3 = 10)\nEven + even = even (6 + 4 = 10)\nOdd + even = odd (7 + 4 = 11)\n\nWhy? Odd numbers have one leftover. Two leftovers make a pair, so odd + odd = even!",
    },
    {
      type: 'interactive',
      content: "Time to use patterns to solve a challenge!",
      prompt: 'A student says 9 × 6 = 52. Add the digits of 52. Is this a correct multiple of 9? (yes or no)',
      expectedResponse: 'no',
    },
    {
      type: 'text',
      content: "5 + 2 = 7, not 9. So 52 cannot be right!\n\nThe real answer is 9 × 6 = 54, because 5 + 4 = 9.\n\nPatterns are like secret math tools — they help you catch mistakes!",
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'A student says 9 × 4 = 34. Use the digit-sum pattern: is this correct?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'No, because 3 + 4 = 7, not 9' },
        { label: 'B', value: 'Yes, because 3 + 4 = 9' },
        { label: 'C', value: 'No, because 34 is even' },
        { label: 'D', value: 'Yes, because 34 ends in 4' },
      ],
      correct_answer: 'No, because 3 + 4 = 7, not 9',
      difficulty: 1,
    },
    {
      id: 2,
      text: 'Which number is a multiple of BOTH 2 and 5?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '15' },
        { label: 'B', value: '22' },
        { label: 'C', value: '30' },
        { label: 'D', value: '35' },
      ],
      correct_answer: '30',
      difficulty: 2,
      hint: 'It must be even (multiple of 2) AND end in 0 or 5 (multiple of 5). Which number is even and ends in 0?',
    },
    {
      id: 3,
      text: 'Is 7 + 5 even or odd? Use the odd + even pattern to predict before you add.',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'Even, because odd + odd = even' },
        { label: 'B', value: 'Odd, because odd + even = odd' },
        { label: 'C', value: 'Even, because 7 + 5 = 12' },
        { label: 'D', value: 'Odd, because 7 + 5 = 11' },
      ],
      correct_answer: 'Even, because odd + odd = even',
      difficulty: 2,
      hint: '7 is odd and 5 is odd. What does odd + odd always equal?',
    },
  ],
  summary: 'Patterns are powerful math tools! You can use them to check answers, sort numbers, and predict results. The 2s, 5s, and 9s patterns are especially helpful on the multiplication table.',
  commonMistakes: [
    'Confusing which number must be even vs. end in 0 or 5 vs. have digits adding to 9',
    'Thinking odd + odd = odd (it is actually even!)',
    'Forgetting that numbers like 20, 30, 40 are multiples of both 2 and 5',
  ],
}

export default lesson
