import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.1',
  modality: 'interactive',
  title: 'Multiplication as Groups (Interactive)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "Let's build multiplication step by step! You'll answer little questions along the way.",
    },
    {
      type: 'visual',
      content: "Here are some basketballs arranged in groups:",
      visual: {
        type: 'groups',
        data: { groups: 4, itemsPerGroup: 3, emoji: '🏀' },
        alt: '4 groups of 3 basketballs',
      },
    },
    {
      type: 'interactive',
      content: "Look at the basketballs above.",
      prompt: 'How many groups do you see?',
      expectedResponse: '4',
    },
    {
      type: 'interactive',
      content: "Great! Now count the basketballs in one group.",
      prompt: 'How many basketballs are in EACH group?',
      expectedResponse: '3',
    },
    {
      type: 'text',
      content: "So we have 4 groups of 3!\n\nWe write: 4 × 3 = 12\n\nThe × sign means \"groups of\"!",
    },
    {
      type: 'interactive',
      content: "Now let's try a new one!",
      prompt: 'If you have 6 groups of 2, what multiplication would you write? (Just the answer number)',
      expectedResponse: '12',
    },
    {
      type: 'visual',
      content: "Here's what 6 × 2 looks like:",
      visual: {
        type: 'groups',
        data: { groups: 6, itemsPerGroup: 2, emoji: '🌟' },
        alt: '6 groups of 2 stars = 12 stars',
      },
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'How many total? 3 groups of 5 = ?',
      type: 'numeric',
      correct_answer: '15',
      difficulty: 1,
      hint: '5 + 5 + 5 = ?',
      category: 'bare_number',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'A farmer has 4 pens with 6 chickens in each pen. What multiplication shows the total chickens?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '4 × 6 = 24' },
        { label: 'B', value: '4 + 6 = 10' },
        { label: 'C', value: '6 × 6 = 36' },
        { label: 'D', value: '6 + 6 = 12' },
      ],
      correct_answer: '4 × 6 = 24',
      difficulty: 1,
      category: 'word_problem',
      abstractionLevel: 'concrete',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'There are 8 teams and each team has 3 players. How many players are there altogether?',
      type: 'numeric',
      correct_answer: '24',
      difficulty: 2,
      hint: '8 groups of 3. Try skip counting by 3s.',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
  ],
  summary: 'Multiplication means "groups of"! Count the groups, count items per group, then multiply.',
  commonMistakes: [
    'Confusing the × sign with the + sign',
    'Counting the total groups wrong when items are spread out',
  ],
}

export default lesson
