import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.4',
  modality: 'challenge',
  title: 'Find the Missing Number (Challenge)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "You are running a school book fair! Some of the order forms got smudged, and numbers are missing. Can you figure them out?",
    },
    {
      type: 'text',
      content: 'The order sheet says:\n\n"We ordered ? boxes of books. Each box has 9 books. We received 63 books total."\n\n? × 9 = 63\n\nThink: 63 ÷ 9 = 7. You ordered 7 boxes!',
    },
    {
      type: 'worked_example',
      content: "Another smudged order!",
      example: {
        problem: '"We have 72 bookmarks. We want to put them in bags of ?. We need exactly 8 bags."\n\n72 ÷ ? = 8. Find the missing number.',
        steps: [
          { explanation: 'We need: 72 divided by something equals 8.' },
          { explanation: 'Use multiplication: ? × 8 = 72' },
          { explanation: '9 × 8 = 72 ✓' },
          { explanation: 'Each bag should have 9 bookmarks!' },
        ],
        answer: '? = 9 bookmarks per bag',
      },
    },
    {
      type: 'text',
      content: 'Here is a two-step challenge:\n\nYou know 6 × 8 = 48. From that ONE fact, you can solve all of these:\n\n• ? × 8 = 48 → ? = 6\n• 6 × ? = 48 → ? = 8\n• 48 ÷ 6 = ? → ? = 8\n• 48 ÷ ? = 6 → ? = 8\n\nOne fact family, four equations!',
    },
    {
      type: 'interactive',
      content: 'Your turn! Use the fact that 7 × 9 = 63.',
      prompt: 'What is the missing number in 63 ÷ ? = 9?',
      expectedResponse: '7',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'The book fair sold ? packs of stickers. Each pack costs $6. They made $54 total. How many packs were sold? (? × 6 = 54)',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 2,
      hint: '54 ÷ 6 = ?',
    },
    {
      id: 2,
      text: 'A shelf holds 8 rows of books with ? books in each row. There are 64 books total. How many in each row?',
      type: 'numeric',
      correct_answer: '8',
      difficulty: 2,
      hint: '8 × ? = 64. Think: 64 ÷ 8 = ?',
    },
    {
      id: 3,
      text: 'The fair collected 81 dollars. They want to donate equally to ? charities so each one gets 9 dollars. How many charities? (81 ÷ ? = 9)',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 3,
      hint: 'Think: ? × 9 = 81. What number times 9 is 81?',
    },
  ],
  summary: 'Multiplication and division are a fact family. If you know one fact like 7 × 8 = 56, you can solve any equation with those three numbers and a missing piece!',
  commonMistakes: [
    'Getting confused when the missing number is in an unusual position like 48 ÷ ? = 6',
    'Forgetting that one multiplication fact can help you solve four different equations',
  ],
}

export default lesson
