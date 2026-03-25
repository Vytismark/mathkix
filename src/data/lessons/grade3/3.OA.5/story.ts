import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.5',
  modality: 'story',
  title: 'Multiply & Divide Properties (Story)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'Carlos is helping at his family\'s fruit stand. He discovers some cool tricks that make counting fruit much easier!',
    },
    {
      type: 'text',
      content: 'Carlos puts 3 rows of 4 oranges on the table. That\'s 3 × 4 = 12 oranges.\n\nHis sister turns the tray sideways — now it looks like 4 rows of 3! But there are still 12 oranges.\n\n"Hey!" says Carlos. "Switching the order doesn\'t change the total!"\n\nThis is the Commutative Property: 3 × 4 = 4 × 3.',
    },
    {
      type: 'text',
      content: 'Next, Carlos needs to stack boxes. He has 2 stacks of 3 boxes, and each box holds 4 oranges.\n\nHe can think: (2 × 3) × 4 = 6 × 4 = 24 oranges.\nOr he can think: 2 × (3 × 4) = 2 × 12 = 24 oranges.\n\nSame answer! This is the Associative Property — you can group the numbers differently.',
    },
    {
      type: 'worked_example',
      content: 'Carlos needs to pack 7 bags with 6 apples each. That\'s a lot of counting! But he knows a trick.',
      example: {
        problem: 'Find 7 × 6 using the distributive property.',
        steps: [
          { explanation: 'Break 6 into two easier numbers: 6 = 5 + 1' },
          { explanation: '7 × 6 = 7 × 5 + 7 × 1' },
          { explanation: '7 × 5 = 35' },
          { explanation: '7 × 1 = 7' },
          { explanation: '35 + 7 = 42' },
        ],
        answer: '7 × 6 = 42',
      },
    },
    {
      type: 'interactive',
      content: 'Carlos has 8 baskets with 5 peaches each. His sister says she can also think of it as 5 baskets of 8.',
      prompt: 'Is his sister right? What is 8 × 5?',
      expectedResponse: '40',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'Carlos knows 6 × 3 = 18. What is 3 × 6?',
      type: 'numeric',
      correct_answer: '18',
      difficulty: 1,
      hint: 'Commutative property: swap the numbers, same answer!',
      category: 'bare_number',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'Carlos breaks 8 × 4 into 8 × 2 + 8 × 2. What property is he using?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'Distributive' },
        { label: 'B', value: 'Commutative' },
        { label: 'C', value: 'Associative' },
        { label: 'D', value: 'Subtraction' },
      ],
      correct_answer: 'Distributive',
      difficulty: 2,
      category: 'conceptual',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
    {
      id: 3,
      text: 'Use the distributive property to solve 8 × 7. Break it into 8 × 5 + 8 × 2. What is 8 × 7?',
      type: 'numeric',
      correct_answer: '56',
      difficulty: 3,
      hint: '8 × 5 = 40 and 8 × 2 = 16. Add them!',
      category: 'procedural',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
  ],
  summary: 'Carlos learned three tricks: swap the order (commutative), regroup numbers (associative), and break apart hard problems (distributive). They all give the same answer!',
  commonMistakes: [
    'Confusing which property is which — commutative means swap, distributive means break apart',
    'Only multiplying one part when using the distributive property (you must multiply BOTH parts)',
  ],
}

export default lesson
