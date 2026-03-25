import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.5',
  modality: 'visual',
  title: 'Multiply & Divide Properties (Visual)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: 'There are special rules about multiplication that make math easier. These rules are called PROPERTIES. Let\'s see them with pictures!',
    },
    {
      type: 'visual',
      content: 'Commutative Property: You can SWAP the order and get the same answer!\n\nLook — 3 groups of 4 stars:',
      visual: {
        type: 'groups',
        data: { groups: 3, itemsPerGroup: 4, emoji: '⭐' },
        alt: '3 groups of 4 stars = 12 stars',
      },
    },
    {
      type: 'visual',
      content: 'Now look — 4 groups of 3 stars. Same total!',
      visual: {
        type: 'groups',
        data: { groups: 4, itemsPerGroup: 3, emoji: '⭐' },
        alt: '4 groups of 3 stars = 12 stars',
      },
    },
    {
      type: 'visual',
      content: 'Associative Property: You can GROUP numbers differently and get the same answer!\n\n(2 × 3) × 4 — first make 2 rows of 3:',
      visual: {
        type: 'array',
        data: { rows: 2, cols: 3, emoji: '🔵' },
        alt: '2 rows of 3 = 6, then multiply by 4 to get 24',
      },
    },
    {
      type: 'text',
      content: 'That gives 6. Then 6 × 4 = 24.\n\nOr try 2 × (3 × 4): first do 3 × 4 = 12, then 2 × 12 = 24.\n\nSame answer both ways!',
    },
    {
      type: 'visual',
      content: 'Distributive Property: You can BREAK APART a hard problem!\n\n7 × 6 is tricky. But look — split the 6 rows into 5 rows and 1 row:',
      visual: {
        type: 'array',
        data: { rows: 6, cols: 7, emoji: '🟩' },
        alt: '6 rows of 7 = 42. Split into 5 rows of 7 (35) plus 1 row of 7 (7)',
      },
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: '4 × 5 = 20. What does 5 × 4 equal?',
      type: 'numeric',
      correct_answer: '20',
      difficulty: 1,
      hint: 'Commutative property: swapping the order gives the same answer!',
      category: 'bare_number',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'Which property says 3 × 8 = 8 × 3?',
      type: 'multiple_choice',
      options: [
        { label: 'A', value: 'Commutative' },
        { label: 'B', value: 'Associative' },
        { label: 'C', value: 'Distributive' },
        { label: 'D', value: 'Addition' },
      ],
      correct_answer: 'Commutative',
      difficulty: 2,
      category: 'conceptual',
      abstractionLevel: 'abstract',
      stepsRequired: 1,
    },
    {
      id: 3,
      text: 'Use the distributive property: 6 × 8 = 6 × 5 + 6 × 3. What is 6 × 8?',
      type: 'numeric',
      correct_answer: '48',
      difficulty: 3,
      hint: '6 × 5 = 30 and 6 × 3 = 18. Add them together!',
      category: 'procedural',
      abstractionLevel: 'abstract',
      stepsRequired: 2,
    },
  ],
  summary: 'Three properties help you multiply: Commutative (swap order), Associative (regroup), and Distributive (break apart). They all give the same answer!',
  commonMistakes: [
    'Thinking that swapping the order changes the answer (it does not for multiplication!)',
    'Forgetting to multiply BOTH parts when using the distributive property',
  ],
}

export default lesson
