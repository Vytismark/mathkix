export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'app-header'; name: string; price: string; ages: string; platforms: string }
  | { type: 'verdict'; shines: string; fallsShort: string }
  | { type: 'pick'; scenario: string; choice: string; note: string }
  | { type: 'highlight'; text: string }
  | { type: 'divider' }
  | { type: 'cta'; heading: string; body: string; label: string; href: string }

export interface BlogPost {
  slug: string
  title: string
  description: string
  category: string
  date: string
  readTime: number
  author?: string
  body?: ContentBlock[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'tested-7-math-apps-30-days',
    title: 'I Tested 7 Math Apps With My Kids for 30 Days. Here\'s What Actually Helped Them Learn.',
    description:
      'My second grader got a B+ on her math test — then couldn\'t answer a subtraction question at dinner. That sent me down a rabbit hole. Here\'s what I found after 30 days of real testing.',
    category: 'Reviews',
    date: '2026-03-22',
    readTime: 12,
    author: 'The MathKix Team',
    body: [
      {
        type: 'paragraph',
        text: 'My second grader came home last month with a math test score that surprised me. Not because it was bad. She got a B+. The surprise was that she couldn\'t answer a basic subtraction question at the dinner table that night.',
      },
      {
        type: 'paragraph',
        text: 'She had memorized the classroom patterns well enough to pass. But she didn\'t actually understand what she was doing.',
      },
      {
        type: 'paragraph',
        text: 'That sent me down a rabbit hole every parent eventually falls into: searching "best math app for kids" and getting hit with a wall of options, each claiming to be the one that will finally make math click.',
      },
      {
        type: 'paragraph',
        text: 'So instead of reading more reviews, I did something different. I signed up for seven of the most popular math apps and had my two kids (ages 6 and 9, grades 1 and 4) use each one for at least four days. I watched over their shoulders. I tracked what held their attention and what made them shut the tablet. I noted which apps taught them something new versus which ones just kept them busy.',
      },
      {
        type: 'paragraph',
        text: "Here's what I found.",
      },
      {
        type: 'heading',
        text: 'What I Was Looking For',
      },
      {
        type: 'paragraph',
        text: "Before diving in, I set three criteria. Every parent's priorities are different, but these are the questions I kept coming back to:",
      },
      {
        type: 'list',
        items: [
          'Does it find where my kid actually is? Not grade level. Actual understanding. My daughter was "at grade level" on paper but had gaps underneath.',
          "Does it teach, or just quiz? A lot of apps hand your kid a problem, say \"try again\" when they get it wrong, and call that learning. That's not teaching. I wanted something that explains the why.",
          "Will my kids use it without a fight? The best curriculum in the world doesn't matter if it collects dust after day two.",
        ],
      },
      {
        type: 'app-header',
        name: 'Khan Academy Kids',
        price: 'Free',
        ages: 'Ages 2–8',
        platforms: 'iOS, Android, Web',
      },
      {
        type: 'paragraph',
        text: 'Khan Academy Kids is the app I recommend to every parent who asks "where do I start?" It costs nothing, has no ads, no in-app purchases, and no premium tier dangling behind a paywall. That alone puts it in rare company.',
      },
      {
        type: 'paragraph',
        text: 'My 6-year-old loved it. The characters are charming, the activities mix reading and math and social-emotional learning, and the adaptive engine adjusts difficulty in the background. For a free app, the production quality is remarkable.',
      },
      {
        type: 'paragraph',
        text: 'The limitation showed up with my 9-year-old. The content skews younger, covering through about second grade effectively. By third grade, the math feels thin. He blew through everything in his range within a week and asked for something harder.',
      },
      {
        type: 'verdict',
        shines: 'Early elementary (K–2). If your child is 5 or 6 and you want a zero-risk starting point, this is it.',
        fallsShort: 'Grades 3 and up. The math curriculum lacks depth for older elementary students, and the video-based instruction can feel repetitive.',
      },
      {
        type: 'app-header',
        name: 'Prodigy Math',
        price: 'Free (paid from $9.95/mo)',
        ages: 'Grades 1–8',
        platforms: 'iOS, Android, Web',
      },
      {
        type: 'paragraph',
        text: 'Prodigy is the one my kids asked to play. It wraps math problems inside a fantasy RPG where your character battles monsters, collects pets, and completes quests. My son was instantly hooked.',
      },
      {
        type: 'paragraph',
        text: "Here's the problem: in one 20-minute session, I counted 4 math problems and 16 prompts to upgrade to the premium membership. Treasure chests they couldn't open. Pets they couldn't unlock. Armor their friends had that they didn't. The free version is designed to make your child feel like they are missing out until you pay.",
      },
      {
        type: 'paragraph',
        text: "The math itself is fine. Standard practice problems that adapt to your child's level. But Prodigy doesn't teach concepts. If your kid gets stuck, they get a hint, not an explanation. It's a practice tool dressed up as a game, and the game part is engineered to sell subscriptions.",
      },
      {
        type: 'paragraph',
        text: "Fairplay, the children's advocacy nonprofit, published a detailed report on Prodigy's design patterns. Their finding: the app prioritizes engagement metrics and conversion over learning outcomes.",
      },
      {
        type: 'verdict',
        shines: 'Getting a math-resistant kid to do any practice at all. The game mechanics genuinely motivate reluctant learners.',
        fallsShort: 'Teaching. And the aggressive upselling creates a frustrating experience for kids on the free tier.',
      },
      {
        type: 'app-header',
        name: 'IXL Math',
        price: 'From $6.58/mo',
        ages: 'Pre-K – Grade 12',
        platforms: 'Web, iOS, Android',
      },
      {
        type: 'paragraph',
        text: 'IXL is the most comprehensive option on this list. Nearly 5,000 math skills, organized by grade, with detailed progress tracking that shows exactly which standards your child has mastered. The parent dashboard is excellent.',
      },
      {
        type: 'paragraph',
        text: 'My son used it for a week, and I noticed something troubling on day three. He was working on a set of fraction problems and had answered 14 out of 15 correctly. His score was 94. He got the next one wrong, and his score dropped to 81.',
      },
      {
        type: 'paragraph',
        text: "He closed the app and said he was done with math for the day.",
      },
      {
        type: 'paragraph',
        text: "IXL's scoring system penalizes mistakes more heavily as you approach mastery. The intent is to ensure true proficiency. The effect, for a lot of kids, is anxiety. Parent reviews mention children crying over scores and developing negative feelings about math. For a confident kid who handles pressure well, IXL is a powerful tool. For a child who already struggles with math confidence, it can make things worse.",
      },
      {
        type: 'verdict',
        shines: "Comprehensive skill coverage and detailed progress data. If your child is self-motivated and doesn't get discouraged easily, the breadth is unmatched.",
        fallsShort: 'The scoring system is punitive. Multiple parents in reviews describe it as emotionally damaging for sensitive or anxious learners.',
      },
      {
        type: 'app-header',
        name: 'DoodleMath',
        price: '$10.99/mo or $94.99/yr',
        ages: 'Ages 4–14',
        platforms: 'iOS, Android, Web',
      },
      {
        type: 'paragraph',
        text: 'DoodleMath takes a different approach. Instead of long sessions, it asks your child to complete about 8 questions per day, which takes roughly 5 to 10 minutes. The app builds a personalized curriculum based on a diagnostic assessment and adjusts over time.',
      },
      {
        type: 'paragraph',
        text: "I liked the philosophy. Short daily sessions build consistency without screen time guilt, and the personalization caught real gaps. My daughter's plan pulled in first-grade place value concepts alongside her second-grade work because the diagnostic spotted a weak foundation.",
      },
      {
        type: 'paragraph',
        text: "The execution is uneven. The interface feels clunky compared to more polished apps. Explanations for wrong answers are brief. On several occasions my daughter encountered a concept she hadn't learned yet, and the app didn't scaffold it well enough for her to figure it out independently. I had to step in and teach it myself.",
      },
      {
        type: 'verdict',
        shines: 'Short, daily habit building. The diagnostic assessment and personalized path are a genuinely good idea. Offline mode is a nice bonus for car rides.',
        fallsShort: 'The app needs more polish. Explanations are too thin, and the scaffolding for new concepts requires parent involvement.',
      },
      {
        type: 'app-header',
        name: 'SplashLearn',
        price: 'Free tier available',
        ages: 'Pre-K – Grade 5',
        platforms: 'iOS, Android, Web',
      },
      {
        type: 'paragraph',
        text: 'SplashLearn has bright, colorful games that my 6-year-old was drawn to immediately. The activities are well-designed for younger kids, and the variety keeps things fresh. Close to 2,000 math and reading activities is a lot of content.',
      },
      {
        type: 'paragraph',
        text: "I'm including it here because it's popular, but I have to be direct: the billing practices are a serious problem. SplashLearn has a 1.8 out of 5 rating on consumer review sites, and the complaints are almost entirely about money. Parents report unexpected charges after free trials, difficulty canceling subscriptions, denied refund requests, and auto-renewals without notification.",
      },
      {
        type: 'paragraph',
        text: "The app itself is decent for K-2 practice. It doesn't teach concepts deeply, and the educational value drops off after second grade. But the billing issues are significant enough that I would suggest proceeding with caution and reading the terms carefully before entering any payment information.",
      },
      {
        type: 'verdict',
        shines: 'Engaging activities for young learners (Pre-K through 2). The games are genuinely fun and colorful.',
        fallsShort: 'Consumer trust. The volume of billing complaints is hard to ignore. Educational depth is also limited beyond second grade.',
      },
      {
        type: 'app-header',
        name: 'Photomath',
        price: 'Free (Plus $9.99/mo)',
        ages: 'All ages',
        platforms: 'iOS, Android',
      },
      {
        type: 'paragraph',
        text: "Photomath is different from everything else on this list. It's not a curriculum or a practice app. You point your phone camera at a math problem, and it solves it instantly with step-by-step explanations.",
      },
      {
        type: 'paragraph',
        text: "For parents, it's incredibly useful. When my son brought home a worksheet with a type of problem I hadn't seen in 20 years, Photomath helped me understand the method his teacher was using so I could explain it in the right way.",
      },
      {
        type: 'paragraph',
        text: "For kids using it unsupervised, it's a homework shortcut machine. The step-by-step explanations are there, but nothing stops a child from photographing every problem and copying the answers. Without an adult sitting alongside, the learning value drops close to zero.",
      },
      {
        type: 'verdict',
        shines: "Helping parents understand unfamiliar methods so they can support their kids. The step-by-step breakdowns are clear and well-produced.",
        fallsShort: 'Independent use by children. It solves problems for them rather than teaching them to solve problems themselves.',
      },
      {
        type: 'app-header',
        name: 'MathKix',
        price: '$9.99/mo · $79.99/yr · $149.99 lifetime',
        ages: 'Grades 1–5',
        platforms: 'Web',
      },
      {
        type: 'paragraph',
        text: "MathKix starts with a 3-minute placement quiz powered by AI (built on Anthropic's Claude) that maps your child's actual proficiency across every Common Core math standard, not just their grade level. This is the feature that caught my attention, because it directly addressed the problem that started this whole search: my daughter was \"at grade level\" but had hidden gaps.",
      },
      {
        type: 'paragraph',
        text: 'The quiz placed her about half a grade behind in place value and measurement, right at level in arithmetic, and slightly ahead in geometry. That matched what I\'d observed at home. The app then built a path that filled those specific gaps while keeping her engaged in areas where she was strong.',
      },
      {
        type: 'paragraph',
        text: 'The AI tutor, a character called Ms. Owl, provides explanations when a child gets something wrong rather than just marking it incorrect and moving on. My daughter responded well to this. She told me Ms. Owl "explains it like you do," which felt like high praise from a 7-year-old.',
      },
      {
        type: 'paragraph',
        text: "It's not perfect. The app is newer than the others on this list, so the content library is still growing. There's no game-based wrapper like Prodigy, so if your child needs heavy gamification to engage, this may feel plain by comparison. And it's web-only for now, which means no dedicated tablet app.",
      },
      {
        type: 'verdict',
        shines: 'Diagnostic accuracy. The placement quiz and adaptive learning path are the best I tested at finding and filling real skill gaps. The AI explanations actually teach instead of just grading.',
        fallsShort: "Newer product with a smaller content library. No native mobile app yet. Less \"fun\" than game-based alternatives.",
      },
      {
        type: 'heading',
        text: 'So Which One Should You Pick?',
      },
      {
        type: 'paragraph',
        text: "There's no single best math app. There's the best one for your kid right now.",
      },
      {
        type: 'pick',
        scenario: 'If your child is in K–2 and you want free',
        choice: 'Khan Academy Kids',
        note: "It's an exceptional free resource for the youngest learners, and you lose nothing by trying it first.",
      },
      {
        type: 'pick',
        scenario: 'If your child refuses to do math at all',
        choice: 'Prodigy',
        note: 'It will get them doing problems. Just go in knowing the free tier is intentionally frustrating, and the app practises math rather than teaching it.',
      },
      {
        type: 'pick',
        scenario: 'If your child is confident and you want comprehensive drill',
        choice: 'IXL',
        note: 'It has the deepest skill library. Monitor how they react to the scoring system, and stop if it\'s causing stress.',
      },
      {
        type: 'pick',
        scenario: 'If you want a short daily habit',
        choice: 'DoodleMath',
        note: "The 5-to-10-minute sessions are easy to maintain. Be prepared to supplement with your own explanations when the app's fall short.",
      },
      {
        type: 'pick',
        scenario: 'If your child seems fine on paper but you suspect hidden gaps',
        choice: 'MathKix',
        note: 'This is specifically what MathKix was built for. The diagnostic assessment is the most thorough I tested, and the AI tutor fills a real gap that most apps ignore: actually explaining concepts when a child is stuck.',
      },
      {
        type: 'pick',
        scenario: 'If you want to better support homework yourself',
        choice: 'Photomath (on your phone)',
        note: "Just don't hand it to your child unsupervised.",
      },
      {
        type: 'heading',
        text: 'One Thing I Learned From All of This',
      },
      {
        type: 'paragraph',
        text: "The biggest takeaway wasn't about any specific app. It was that most math apps are practice tools pretending to be teaching tools. They serve problems, check answers, and adjust difficulty. A few of them do that inside a game. But very few actually explain anything.",
      },
      {
        type: 'highlight',
        text: 'The kids who struggle with math usually don\'t need more practice. They need someone to explain the concept they missed three months ago that everything else is now built on.',
      },
      {
        type: 'paragraph',
        text: 'Any app that can find that gap and fill it with a real explanation — not just another problem set — is solving the right problem. That\'s what I was looking for when I started this search, and it\'s the lens I\'d encourage any parent to use when choosing.',
      },
      {
        type: 'cta',
        heading: "Want to see where your child's actual math level is?",
        body: "MathKix's placement quiz takes 3 minutes and covers every Common Core standard for grades 1 through 5. No credit card needed to start.",
        label: 'Take the free placement quiz',
        href: '/signup',
      },
    ],
  },
  {
    slug: 'spaced-repetition-math',
    title: 'Why Spaced Repetition is the Secret to Math Mastery',
    description:
      'Most practice apps repeat questions randomly. Spaced repetition schedules reviews at the exact moment a memory is about to fade — and the research on this is decades old.',
    category: 'Learning Science',
    date: '2026-03-10',
    readTime: 6,
  },
  {
    slug: 'math-habit-kids',
    title: 'How to Build a Math Habit Your Child Will Actually Keep',
    description:
      'Motivation fades. Habits stick. The research on habit formation in children points to a few specific conditions that make the difference between a streak that lasts and one that collapses after a week.',
    category: 'Parenting',
    date: '2026-03-17',
    readTime: 5,
  },
  {
    slug: 'adaptive-learning-explained',
    title: 'Adaptive Learning: Why One-Size-Fits-All Math Practice Fails',
    description:
      "Lev Vygotsky identified the zone of proximal development in the 1930s. Ninety years later, most math apps still ignore it. Here's what adaptive learning actually means — and why it matters.",
    category: 'Learning Science',
    date: '2026-03-20',
    readTime: 7,
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
