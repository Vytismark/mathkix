import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.2',
  modality: 'visual',
  title: 'Division as Sharing (Visual)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: 'Division is a way to split things into equal groups!\n\nWhen you divide, you share things fairly so every group gets the same amount.',
    },
    {
      type: 'visual',
      content: 'Imagine you have 12 cookies and you want to share them equally among 3 friends. Each friend gets 4 cookies!',
      visual: {
        type: 'groups',
        data: { groups: 3, itemsPerGroup: 4, emoji: '🍪' },
        alt: '12 cookies split into 3 equal groups of 4',
      },
    },
    {
      type: 'text',
      content: 'We write this as 12 ÷ 3 = 4\n\nThe first number is the TOTAL.\nThe second number is HOW MANY GROUPS.\nThe answer is HOW MANY IN EACH GROUP.',
    },
    {
      type: 'visual',
      content: 'Here is another way to think about division. You have 20 apples and want to put 5 in each bag. How many bags do you need?',
      visual: {
        type: 'groups',
        data: { groups: 4, itemsPerGroup: 5, emoji: '🍎' },
        alt: '20 apples arranged in 4 groups of 5',
      },
    },
    {
      type: 'text',
      content: '20 ÷ 5 = 4 bags\n\nDivision can mean two things:\n• Sharing: split 20 into 5 equal groups → how many in each?\n• Grouping: put 20 into groups of 5 → how many groups?',
    },
    {
      type: 'worked_example',
      content: "Let's solve one together using a picture!",
      example: {
        problem: 'You have 18 stars and want to put them in 3 equal rows. How many stars in each row?',
        steps: [
          { explanation: 'Total stars: 18' },
          { explanation: 'Number of rows (groups): 3' },
          { explanation: 'Deal stars one at a time into each row until all 18 are used' },
          { explanation: 'Each row gets 6 stars: 6 + 6 + 6 = 18 ✓' },
        ],
        answer: '18 ÷ 3 = 6 stars per row',
      },
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'You have 10 grapes and share them equally between 2 friends. How many grapes does each friend get?',
      type: 'numeric',
      correct_answer: '5',
      difficulty: 1,
      hint: 'Split 10 into 2 equal groups.',
    },
    {
      id: 2,
      text: 'Which picture shows 15 ÷ 3?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '3 groups of 5' },
        { label: 'B', value: '5 groups of 3' },
        { label: 'C', value: '15 groups of 3' },
        { label: 'D', value: '1 group of 15' },
      ],
      correct_answer: '3 groups of 5',
      difficulty: 1,
    },
    {
      id: 3,
      text: 'There are 24 pencils shared equally among 4 cups. How many pencils are in each cup?',
      type: 'numeric',
      correct_answer: '6',
      difficulty: 2,
      hint: 'Think: 24 split into 4 equal groups. How many in each?',
    },
  ],
  summary: 'Division means splitting a total into equal groups. 12 ÷ 3 = 4 means 12 things split into 3 groups gives 4 in each group.',
  commonMistakes: [
    'Confusing the total with the number of groups (mixing up which number comes first)',
    'Forgetting that every group must be EQUAL in division',
  ],
}

export default lesson
