import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.4',
  modality: 'interactive',
  title: 'Find the Missing Number (Interactive)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "Let's play detective and find the missing numbers! I'll give you clues and you figure out the answers.",
    },
    {
      type: 'visual',
      content: 'Here are some groups of hearts. The total is 24, and there are 4 groups.',
      visual: {
        type: 'groups',
        data: { groups: 4, itemsPerGroup: 6, emoji: '❤️' },
        alt: '4 groups of 6 hearts, 24 total',
      },
    },
    {
      type: 'interactive',
      content: 'The equation is: 4 × ? = 24. Look at the picture.',
      prompt: 'How many hearts are in EACH group?',
      expectedResponse: '6',
    },
    {
      type: 'text',
      content: 'You found it! 4 × 6 = 24.\n\nYou could also solve it by dividing: 24 ÷ 4 = 6.',
    },
    {
      type: 'interactive',
      content: "Now try without a picture! Here's the equation: ? × 5 = 35.",
      prompt: 'What is the missing number? (Hint: 35 ÷ 5 = ?)',
      expectedResponse: '7',
    },
    {
      type: 'interactive',
      content: "Nice! Now a division one: 32 ÷ ? = 8.",
      prompt: 'What number goes in the blank? (Hint: ? × 8 = 32)',
      expectedResponse: '4',
    },
    {
      type: 'interactive',
      content: "Let's check your answer. If ? = 4, then 32 ÷ 4 = ?",
      prompt: 'Does 32 ÷ 4 equal 8? (Type: yes)',
      expectedResponse: 'yes',
    },
    {
      type: 'text',
      content: 'Always check by putting your answer back into the equation. If it works, you got it right!',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Find the missing number: ? × 4 = 20',
      type: 'numeric',
      correct_answer: '5',
      difficulty: 1,
      hint: 'Divide: 20 ÷ 4 = ?',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
    {
      id: 2,
      text: 'Find the missing number: 7 × ? = 49',
      type: 'numeric',
      correct_answer: '7',
      difficulty: 1,
      hint: 'Think: 49 ÷ 7 = ?',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'Find the missing number: 63 ÷ ? = 7',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 2,
      hint: 'Use multiplication: ? × 7 = 63. What times 7 is 63?',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
  ],
  summary: 'To find a missing number, use the opposite operation. Then always check your answer by putting it back into the equation!',
  commonMistakes: [
    'Forgetting to check your answer at the end',
    'Mixing up multiplication and division when finding the missing number',
  ],
}

export default lesson
