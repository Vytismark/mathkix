import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.6',
  modality: 'challenge',
  title: 'Division as Unknown-Factor (Challenge)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'You\'re the manager of a pet shelter! You need to use division to organize animals into their homes. The trick? Think of every division as a multiplication puzzle!',
    },
    {
      type: 'text',
      content: 'The shelter just got 36 hamsters. You need to put 4 hamsters in each cage.\n\n36 ÷ 4 = ? means ? × 4 = 36.\n\nThink: "What times 4 equals 36?"\n9 × 4 = 36, so you need 9 cages!',
    },
    {
      type: 'worked_example',
      content: 'A delivery truck brings 72 cans of dog food. You want to stack them on shelves with 8 cans per shelf.',
      example: {
        problem: 'How many shelves do you need? 72 ÷ 8 = ?',
        steps: [
          { explanation: 'Rewrite: ? × 8 = 72' },
          { explanation: '"What times 8 equals 72?"' },
          { explanation: '9 × 8 = 72 ✓' },
        ],
        answer: '72 ÷ 8 = 9 shelves',
      },
    },
    {
      type: 'text',
      content: 'Here\'s a cool pattern to remember:\n\nIf 9 × 8 = 72, you get TWO division facts for free:\n• 72 ÷ 8 = 9\n• 72 ÷ 9 = 8\n\nEvery multiplication fact is like a family of three facts!',
    },
    {
      type: 'interactive',
      content: 'You have 56 fish to put in tanks. Each tank holds 7 fish.',
      prompt: 'How many tanks do you need? Think: ? × 7 = 56.',
      expectedResponse: '8',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'The shelter has 27 birds and puts 9 in each aviary. How many aviaries are needed?',
      type: 'numeric',
      correct_answer: '3',
      difficulty: 2,
      hint: '? × 9 = 27. What times 9 equals 27?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 2,
      text: 'You know 7 × 6 = 42. The shelter has 42 rabbits. Which TWO division facts can you write?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '42 ÷ 7 = 6 and 42 ÷ 6 = 7' },
        { label: 'B', value: '42 ÷ 42 = 1 and 42 ÷ 1 = 42' },
        { label: 'C', value: '7 ÷ 42 = 6 and 6 ÷ 42 = 7' },
        { label: 'D', value: '42 ÷ 7 = 6 and 42 - 7 = 35' },
      ],
      correct_answer: '42 ÷ 7 = 6 and 42 ÷ 6 = 7',
      difficulty: 2,
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 3,
      text: '81 treats are shared equally among 9 dogs. How many treats does each dog get?',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 3,
      hint: '? × 9 = 81. What times 9 equals 81?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
  ],
  summary: 'At the shelter (and everywhere!), division problems are really multiplication puzzles. Ask "what times this equals that?" and use your times tables to find the answer!',
  commonMistakes: [
    'Forgetting that one multiplication fact gives you two free division facts',
    'Getting confused about what to divide by — read the problem carefully to find the group size',
  ],
}

export default lesson
