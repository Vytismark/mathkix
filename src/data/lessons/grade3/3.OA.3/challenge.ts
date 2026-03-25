import type { LessonContent } from '@/types/lesson-content'

const lesson: LessonContent = {
  standardCode: '3.OA.3',
  modality: 'challenge',
  title: 'Word Problems with Equal Groups (Challenge)',
  estimatedMinutes: 5,
  introduction: [
    {
      type: 'text',
      content: "You are in charge of planning the school Field Day! There are lots of supplies to organize. You'll need to use multiplication AND division to figure everything out.",
    },
    {
      type: 'text',
      content: 'First up: the relay race.\n\nThere are 8 teams and each team needs 4 batons. How many batons do you need?\n\n8 × 4 = 32 batons.\n\nYou know the groups and per group, so you multiply!',
    },
    {
      type: 'text',
      content: 'Next: water bottles.\n\nYou have 72 water bottles to share equally among 9 stations.\n\n72 ÷ 9 = 8 bottles per station.\n\nYou know the total and the groups, so you divide!',
    },
    {
      type: 'worked_example',
      content: "Here's a trickier one with measurement!",
      example: {
        problem: 'Each lap around the track is 4 meters. A runner goes around the track 9 times. How many meters did she run?',
        steps: [
          { explanation: 'Groups: 9 laps' },
          { explanation: 'Per group: 4 meters each lap' },
          { explanation: 'We need the total distance, so MULTIPLY' },
          { explanation: '9 × 4 = 36 meters' },
        ],
        answer: '9 × 4 = 36 meters',
      },
    },
    {
      type: 'interactive',
      content: 'Your turn! The jump rope station has 48 jump ropes stored in 6 bins.',
      prompt: 'How many jump ropes are in each bin?',
      expectedResponse: '8',
    },
  ],
  practiceQuestions: [
    {
      id: 1,
      text: 'At Field Day, each student earns 5 points per game. A student plays 7 games. How many points does she earn?',
      type: 'numeric',
      correct_answer: '35',
      difficulty: 1,
      hint: '7 games × 5 points each = ?',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
    {
      id: 2,
      text: 'There are 54 ribbons to give out equally to 6 events. How many ribbons does each event get?',
      type: 'numeric',
      correct_answer: '9',
      difficulty: 2,
      hint: '54 ÷ 6 = ? Think: 6 × ? = 54.',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 2,
    },
    {
      id: 3,
      text: 'The snack table has 8 trays. Each tray holds 9 granola bars. How many granola bars are there in all?',
      type: 'numeric',
      correct_answer: '72',
      difficulty: 2,
      hint: '8 × 9 = ? Use your multiplication facts!',
      category: 'word_problem',
      abstractionLevel: 'representational',
      stepsRequired: 1,
    },
  ],
  summary: 'Real-world problems use both multiplication and division. Read carefully to decide which one to use. If you need the total, multiply. If you know the total and need a missing piece, divide.',
  commonMistakes: [
    'Picking the wrong operation because you did not read what the question asks',
    'With measurement problems, forgetting that "each" means per group',
  ],
}

export default lesson
