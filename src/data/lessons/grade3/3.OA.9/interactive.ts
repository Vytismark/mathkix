import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.9',
  modality: 'interactive',
  title: 'Arithmetic Patterns (Interactive)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "Let's be pattern detectives! I'll show you some numbers and you figure out the patterns.",
    },
    {
      type: 'text',
      content: 'Look at the multiples of 2:\n2, 4, 6, 8, 10, 12, 14, 16, 18, 20',
    },
    {
      type: 'interactive',
      content: 'Are the multiples of 2 even numbers, odd numbers, or a mix?',
      prompt: 'Are the multiples of 2 all even, all odd, or mixed? (even, odd, or mixed)',
      expectedResponse: 'even',
    },
    {
      type: 'text',
      content: "Right! Multiples of 2 are always even. That's because 2 makes pairs, and pairs are always even.\n\nNow let's look at the 5s: 5, 10, 15, 20, 25, 30",
    },
    {
      type: 'interactive',
      content: 'Look at the last digit of each number: 5, 0, 5, 0, 5, 0...',
      prompt: 'Multiples of 5 always end in which digits? (answer with both digits separated by "or")',
      expectedResponse: '0 or 5',
    },
    {
      type: 'text',
      content: "Now for the coolest pattern — the 9s!\n\n9 × 1 = 9\n9 × 2 = 18\n9 × 3 = 27\n9 × 4 = 36\n\nLook at the digits of each answer...",
    },
    {
      type: 'interactive',
      content: 'Add the digits of 18: 1 + 8 = ?\nAdd the digits of 27: 2 + 7 = ?\nAdd the digits of 36: 3 + 6 = ?',
      prompt: 'The digits of each multiple of 9 add up to what number?',
      expectedResponse: '9',
    },
    {
      type: 'interactive',
      content: "Let's test this! What is 9 × 7?",
      prompt: 'What is 9 × 7? (Check: do the digits add up to 9?)',
      expectedResponse: '63',
    },
    {
      type: 'text',
      content: '6 + 3 = 9. The pattern works!\n\nThis pattern happens because adding 9 is the same as adding 10 and subtracting 1. The tens digit goes up by 1 and the ones digit goes down by 1.',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Is 24 a multiple of 2? (It is if it is even.)',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'Yes, because 24 is even' },
        { label: 'B', value: 'No, because 24 is odd' },
        { label: 'C', value: 'Yes, because 24 ends in 5' },
        { label: 'D', value: 'No, because 24 is too big' },
      ],
      correct_answer: 'Yes, because 24 is even',
      difficulty: 1,
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'Which of these is a multiple of 5?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '22' },
        { label: 'B', value: '37' },
        { label: 'C', value: '45' },
        { label: 'D', value: '13' },
      ],
      correct_answer: '45',
      difficulty: 2,
      hint: 'Look for the number that ends in 0 or 5.',
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 3,
      text: '9 × 9 = 81. What do the digits 8 + 1 add up to?',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 2,
      hint: 'Just add the two digits: 8 + 1 = ?',
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
  ],
  summary: 'You are a pattern detective! Multiples of 2 are always even, multiples of 5 end in 0 or 5, and the digits of multiples of 9 add to 9. Knowing patterns helps you check your math!',
  commonMistakes: [
    'Thinking that ending in 0 means a number is only a multiple of 10 (it is also a multiple of 5)',
    'Adding digits wrong when checking the 9s pattern',
  ],
}

export default lesson
