import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.4',
  modality: 'story',
  title: 'Find the Missing Number (Story)',
  estimatedMinutes: 4,
  introduction: [
    {
      type: 'text',
      content: "Alex is a pet store helper. He knows some information, but not all of it. He needs to figure out the missing numbers!\n\nLet's help him.",
    },
    {
      type: 'text',
      content: 'Alex puts fish into tanks. He has 5 tanks, and he puts the same number of fish in each tank. He used 30 fish total.\n\n"How many fish did I put in each tank?" he wonders.\n\n5 × ? = 30\n\nThink: 30 ÷ 5 = 6. He put 6 fish in each tank!',
    },
    {
      type: 'text',
      content: 'Next, Alex has some bags of dog treats. Each bag has 8 treats. He counts 48 treats total.\n\n"How many bags do I have?"\n\n? × 8 = 48\n\nThink: 48 ÷ 8 = 6. He has 6 bags!',
    },
    {
      type: 'text',
      content: 'The trick: when one number is missing, use the OPPOSITE operation to find it.\n\n• Missing a number in multiplication? → Use division.\n• Missing a number in division? → Use multiplication.',
    },
    {
      type: 'worked_example',
      content: "Here's one more!",
      example: {
        problem: 'Alex has 42 dog biscuits. He divides them into bags, and each bag gets 7 biscuits. How many bags does he use? (42 ÷ ? = 7... wait, let\'s re-read!)',
        steps: [
          { explanation: 'Total biscuits: 42. Biscuits per bag: 7.' },
          { explanation: 'How many bags? That means: 42 ÷ ? = 7... but it is easier to think: ? × 7 = 42' },
          { explanation: '6 × 7 = 42 ✓' },
          { explanation: 'He needs 6 bags!' },
        ],
        answer: '42 ÷ 6 = 7, so ? = 6 bags',
      },
    },
    {
      type: 'interactive',
      content: "Now you help Alex!",
      prompt: 'Alex has some cages with 9 hamsters in each cage. There are 36 hamsters total. How many cages? (? × 9 = 36)',
      expectedResponse: '4',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'A zookeeper feeds 4 seals. She uses 24 fish total, giving each seal the same amount. How many fish does each seal get? (4 × ? = 24)',
      type: 'numeric',
      correct_answer: '6',
      difficulty: 1,
      hint: 'Think: 24 ÷ 4 = ?',
    },
    {
      id: 2,
      text: 'Find the missing number: ? × 5 = 40',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: '8' },
        { label: 'B', value: '35' },
        { label: 'C', value: '45' },
        { label: 'D', value: '7' },
      ],
      correct_answer: '8',
      difficulty: 1,
    },
    {
      id: 3,
      text: 'A pet store has 54 goldfish divided equally into tanks with 6 fish each. How many tanks are there? (54 ÷ ? = 6... find ?)',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 2,
      hint: 'Think: ? × 6 = 54. What times 6 is 54?',
    },
  ],
  summary: 'When a number is missing, flip the operation! Use division to find a missing number in multiplication, and use multiplication to find a missing number in division.',
  commonMistakes: [
    'Adding or subtracting instead of using the inverse (opposite) operation',
    'Not checking the answer by plugging it back in',
  ],
}

export default lesson
