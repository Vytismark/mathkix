import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.8',
  modality: 'interactive',
  title: 'Two-Step Word Problems (Interactive)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "Let's solve two-step problems together! I'll ask you questions along the way to make sure you've got it.",
    },
    {
      type: 'text',
      content: "Here's a problem:\n\nThere are 3 boxes of 5 markers. Then 4 markers are lost. How many markers are left?",
    },
    {
      type: 'interactive',
      content: "Let's start with the first step. We have 3 boxes of 5 markers.",
      prompt: 'What is 3 × 5?',
      expectedResponse: '15',
    },
    {
      type: 'interactive',
      content: "Great! We have 15 markers. Now 4 markers are lost.",
      prompt: 'What is 15 − 4?',
      expectedResponse: '11',
    },
    {
      type: 'text',
      content: "Awesome! The answer is 11 markers.\n\nWe can write this as an equation:\nn = 3 × 5 − 4\nn = 15 − 4\nn = 11\n\nThe letter n stands for the answer we are looking for.",
    },
    {
      type: 'interactive',
      content: "Let's check if our answer is reasonable.",
      prompt: 'We started with 15 markers and lost 4. Is 11 a reasonable answer? (yes or no)',
      expectedResponse: 'yes',
    },
    {
      type: 'text',
      content: "Now let's try a problem where we ADD in the second step.\n\nKai has 2 packs of 7 stickers. His friend gives him 3 more stickers.",
    },
    {
      type: 'interactive',
      content: "First, find the total stickers in the packs.",
      prompt: 'What is 2 × 7?',
      expectedResponse: '14',
    },
    {
      type: 'interactive',
      content: "Kai has 14 stickers from his packs, plus 3 more from his friend.",
      prompt: 'What is 14 + 3?',
      expectedResponse: '17',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'There are 4 bags with 3 oranges each. Mom adds 5 more oranges. How many oranges are there now?',
      type: 'numeric',
      correct_answer: '17',
      difficulty: 2,
      hint: 'First: 4 × 3 = 12. Then add 5 more.',
    },
    {
      id: 2,
      text: 'Leo has 6 packs of 4 cards. He trades away 9 cards. Which equation shows how many he has left?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'n = 6 × 4 − 9' },
        { label: 'B', value: 'n = 6 + 4 − 9' },
        { label: 'C', value: 'n = 6 × 9 − 4' },
        { label: 'D', value: 'n = 4 × 9 − 6' },
      ],
      correct_answer: 'n = 6 × 4 − 9',
      difficulty: 2,
      hint: 'First multiply packs times cards, then subtract the traded ones.',
    },
    {
      id: 3,
      text: 'A teacher has 5 groups of 8 students. Then 12 students leave for music class. How many students are still in the room?',
      type: 'numeric',
      correct_answer: '28',
      difficulty: 3,
      hint: 'Step 1: 5 × 8 = 40. Step 2: 40 − 12 = ?',
    },
  ],
  summary: 'Two-step problems need two operations. Solve one step at a time, write your equation with a letter, and always check — does your answer make sense?',
  commonMistakes: [
    'Trying to do both steps at once and making errors',
    'Forgetting to use the answer from step 1 in step 2',
    'Not checking if the final answer is reasonable',
  ],
}

export default lesson
