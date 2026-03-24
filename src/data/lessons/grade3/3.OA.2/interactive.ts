import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.2',
  modality: 'interactive',
  title: 'Division as Sharing (Interactive)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "Let's explore division together! I'll ask you questions as we go. Ready?",
    },
    {
      type: 'visual',
      content: 'Look at these strawberries:',
      visual: {
        type: 'groups',
        data: { groups: 3, itemsPerGroup: 5, emoji: '🍓' },
        alt: '15 strawberries in 3 groups of 5',
      },
    },
    {
      type: 'interactive',
      content: 'Count all the strawberries above.',
      prompt: 'How many strawberries are there in total?',
      expectedResponse: '15',
    },
    {
      type: 'interactive',
      content: 'Good! Now look at how they are grouped.',
      prompt: 'How many equal groups do you see?',
      expectedResponse: '3',
    },
    {
      type: 'interactive',
      content: 'So we have 15 strawberries in 3 equal groups.',
      prompt: 'How many strawberries are in EACH group?',
      expectedResponse: '5',
    },
    {
      type: 'text',
      content: 'You just did division!\n\n15 ÷ 3 = 5\n\nDivision means splitting a total into equal groups and finding how many are in each group.',
    },
    {
      type: 'interactive',
      content: "Now let's try it the other way! You have 24 oranges and want to put 6 in each bag.",
      prompt: 'How many bags do you need? (24 ÷ 6 = ?)',
      expectedResponse: '4',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'You have 14 socks and sort them into pairs (groups of 2). How many pairs do you get?',
      type: 'numeric',
      correct_answer: '7',
      difficulty: 1,
      hint: '14 ÷ 2 = ? Think: 2 × ? = 14.',
    },
    {
      id: 2,
      text: '21 kids split into 3 equal teams. How many on each team?',
      type: 'numeric',
      correct_answer: '7',
      difficulty: 1,
      hint: '21 ÷ 3 = ? Think: 3 × ? = 21.',
    },
    {
      id: 3,
      text: 'A box holds 8 crayons. You have 40 crayons. How many boxes do you need?',
      type: 'numeric',
      correct_answer: '5',
      difficulty: 2,
      hint: '40 ÷ 8 = ? Count by 8s until you reach 40.',
    },
  ],
  summary: 'Division splits a total into equal groups. You can divide to find how many in each group OR how many groups you can make.',
  commonMistakes: [
    'Confusing "how many in each group" with "how many groups" — read the problem carefully!',
    'Forgetting that division is the opposite of multiplication',
  ],
}

export default lesson
