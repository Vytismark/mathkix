import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.6',
  modality: 'visual',
  title: 'Division as Unknown-Factor (Visual)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: 'Division and multiplication are connected! When you divide, you are really asking a multiplication question with a missing number.',
    },
    {
      type: 'visual',
      content: '12 ÷ 3 = ? means: how many groups of 3 fit in 12?\n\nLook — 12 apples split into groups of 3:',
      visual: {
        type: 'groups',
        data: { groups: 4, itemsPerGroup: 3, emoji: '🍎' },
        alt: '12 apples arranged in 4 groups of 3',
      },
    },
    {
      type: 'text',
      content: 'We see 4 groups! So 12 ÷ 3 = 4.\n\nBut here is the KEY idea:\n12 ÷ 3 = ? is the SAME as asking ? × 3 = 12.\n\nThink: "What times 3 equals 12?" The answer is 4!',
    },
    {
      type: 'visual',
      content: 'Let\'s try another. 18 ÷ 6 = ?\n\nThink: ? × 6 = 18. Look at 18 stars in groups of 6:',
      visual: {
        type: 'groups',
        data: { groups: 3, itemsPerGroup: 6, emoji: '⭐' },
        alt: '18 stars arranged in 3 groups of 6',
      },
    },
    {
      type: 'text',
      content: '3 groups of 6 = 18. So 18 ÷ 6 = 3.\n\nDivision and multiplication are INVERSE operations — they undo each other!',
    },
    {
      type: 'visual',
      content: 'One more: 24 ÷ 8 = ? Think: ? × 8 = 24.\n\nHere are 24 hearts in rows of 8:',
      visual: {
        type: 'array',
        data: { rows: 3, cols: 8, emoji: '❤️' },
        alt: '3 rows of 8 hearts = 24 hearts',
      },
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: '15 ÷ 5 = ? Think: what number times 5 equals 15?',
      type: 'numeric',
      correct_answer: '3',
      difficulty: 1,
      hint: '? × 5 = 15. Count by 5s: 5, 10, 15 — that\'s 3 times!',
    },
    {
      id: 2,
      text: '48 ÷ 6 = ? is the same as which multiplication?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '? × 6 = 48' },
        { label: 'B', value: '48 × 6 = ?' },
        { label: 'C', value: '6 + ? = 48' },
        { label: 'D', value: '48 - 6 = ?' },
      ],
      correct_answer: '? × 6 = 48',
      difficulty: 2,
    },
    {
      id: 3,
      text: 'If ? × 7 = 56, what is 56 ÷ 7?',
      type: 'numeric',
      correct_answer: '8',
      difficulty: 2,
      hint: 'The unknown factor IS the answer to the division problem!',
    },
  ],
  summary: 'Division is really a missing-number multiplication problem! 48 ÷ 6 = ? means ? × 6 = 48. Use multiplication facts you already know to solve division!',
  commonMistakes: [
    'Thinking division and multiplication are completely separate — they are inverses!',
    'Putting the numbers in the wrong order when rewriting as multiplication',
  ],
}

export default lesson
