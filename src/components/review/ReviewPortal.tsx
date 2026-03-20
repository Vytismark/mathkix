'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ReviewableQuestion, ReviewRecord } from '@/app/api/admin/questions/queue/route'

// ── Curriculum data ────────────────────────────────────────────────────────────

const DOMAIN_LABELS: Record<string, string> = {
  OA: 'Operations & Algebra',
  NBT: 'Number & Base Ten',
  NF: 'Fractions',
  MD: 'Measurement & Data',
  G: 'Geometry',
}

// Full CCSS K-5 standards: code → [description, example]
const STANDARDS: Record<string, [string, string]> = {
  '1.OA.A.1': ['Add/subtract within 20 to solve word problems', 'There are 8 apples. 3 are eaten. How many left?'],
  '1.OA.A.2': ['Solve word problems adding three whole numbers (sum ≤ 20)', 'Sam has 3 red, 4 blue, 5 green marbles. Total?'],
  '1.OA.B.3': ['Apply commutative & associative properties of addition', 'If 4 + 6 = 10, what does 6 + 4 equal?'],
  '1.OA.B.4': ['Understand subtraction as an unknown-addend problem', 'What plus 3 equals 8?'],
  '1.OA.C.5': ['Relate counting to addition and subtraction', 'Count on from 7 to add 3. What do you get?'],
  '1.OA.C.6': ['Add and subtract within 20 fluently', 'What is 7 + 8?'],
  '1.OA.D.7': ['Understand the equal sign means both sides are equal', 'Is 5 + 3 = 4 + 4 true or false?'],
  '1.OA.D.8': ['Find the unknown whole number in an equation', 'What number makes ___ + 4 = 9?'],
  '1.NBT.A.1': ['Count to 120 starting at any number', 'What number comes after 109?'],
  '1.NBT.B.2': ['Understand two-digit numbers as tens and ones', 'What does the 3 mean in 35?'],
  '1.NBT.B.3': ['Compare two-digit numbers using >, =, <', 'Which is greater: 47 or 74?'],
  '1.NBT.C.4': ['Add within 100 (two-digit + one-digit or multiple of 10)', 'What is 34 + 20?'],
  '1.NBT.C.5': ['Mentally find 10 more or 10 less', 'What is 10 more than 56?'],
  '1.NBT.C.6': ['Subtract multiples of 10 in range 10–90', 'What is 70 − 30?'],
  '1.MD.A.1': ['Order three objects by length', 'Which pencil is shortest?'],
  '1.MD.A.2': ['Measure length by laying units end to end', 'The ribbon is ___ paper clips long.'],
  '1.MD.B.3': ['Tell and write time in hours and half-hours', 'The clock shows 3:30. What time is it?'],
  '1.MD.C.4': ['Organize and interpret data with up to three categories', 'How many more dogs than cats?'],
  '1.G.A.1': ['Distinguish defining attributes of 2D/3D shapes', 'Which shape has 3 sides?'],
  '1.G.A.2': ['Compose 2D and 3D shapes to create a new shape', 'Two triangles make a ___?'],
  '1.G.A.3': ['Partition circles and rectangles into halves and fourths', 'A circle is cut into 2 equal pieces. What is each called?'],
  '2.OA.A.1': ['Add/subtract within 100 to solve one- and two-step word problems', 'Lena has 45 stickers. Gives away 18. How many left?'],
  '2.OA.B.2': ['Fluently add and subtract within 20 from memory', 'What is 13 − 7?'],
  '2.OA.C.3': ['Determine if a group of objects is odd or even', 'Is 14 odd or even?'],
  '2.OA.C.4': ['Use addition to find total objects in arrays', 'A 3-row array, 4 per row. Total?'],
  '2.NBT.A.1': ['Understand 3-digit numbers as hundreds, tens, ones', 'What does the 4 represent in 347?'],
  '2.NBT.A.2': ['Count within 1000; skip-count by 5s, 10s, 100s', 'Count by 10s from 120. What is the next number?'],
  '2.NBT.A.3': ['Read and write numbers to 1,000 in multiple forms', 'Write "five hundred sixty-two" in standard form.'],
  '2.NBT.A.4': ['Compare three-digit numbers using >, =, <', 'Which is less: 472 or 427?'],
  '2.NBT.B.5': ['Fluently add and subtract within 100', 'What is 67 − 29?'],
  '2.NBT.B.6': ['Add up to four two-digit numbers', 'What is 12 + 23 + 34 + 15?'],
  '2.NBT.B.7': ['Add and subtract within 1,000 using strategies', 'A school has 345 boys and 478 girls. Total students?'],
  '2.NBT.B.8': ['Mentally add or subtract 10 or 100 to/from any number', 'What is 100 more than 637?'],
  '2.NBT.B.9': ['Explain why addition/subtraction strategies work', 'Why does adding tens first make 354 + 200 easier?'],
  '2.MD.A.1': ['Measure length using appropriate tools', 'Measure this pencil to the nearest centimetre.'],
  '2.MD.A.3': ['Estimate lengths using inches, feet, centimetres, metres', 'About how tall is a door? Metres or centimetres?'],
  '2.MD.B.5': ['Solve word problems involving length', 'A rope is 85 cm. Cut off 37 cm. How much left?'],
  '2.MD.C.7': ['Tell and write time to the nearest 5 minutes', 'The clock shows 2:45. What time is it?'],
  '2.MD.C.8': ['Solve word problems with coins and bills', 'If you have 3 quarters and 2 dimes, how many cents?'],
  '2.MD.D.9': ['Generate measurement data; show on a line plot', 'Which length appears most often on the line plot?'],
  '2.MD.D.10': ['Draw and interpret picture/bar graphs', 'How many more students prefer pizza than tacos?'],
  '2.G.A.1': ['Recognize and draw shapes with specified attributes', 'Which shape has 4 equal sides?'],
  '2.G.A.2': ['Partition a rectangle into rows and columns of same-size squares', 'A 3×4 rectangle — how many unit squares?'],
  '2.G.A.3': ['Partition circles/rectangles into halves, thirds, fourths', 'A pizza cut into 4 equal slices. One slice is what fraction?'],
  '3.OA.A.1': ['Interpret products as equal groups', '4 bags with 6 apples each. How many total?'],
  '3.OA.A.2': ['Interpret quotients as sharing or grouping', '24 cookies shared among 6 children. How many each?'],
  '3.OA.A.3': ['Multiply/divide within 100 to solve word problems', 'Each box holds 8 crayons. 7 boxes = how many crayons?'],
  '3.OA.A.4': ['Find the unknown in a multiplication/division equation', 'What number makes 6 × ___ = 42?'],
  '3.OA.B.5': ['Apply properties of multiplication', 'If 4 × 7 = 28, what is 7 × 4?'],
  '3.OA.B.6': ['Understand division as an unknown-factor problem', '42 ÷ 6 = ___. What times 6 equals 42?'],
  '3.OA.C.7': ['Fluently multiply and divide within 100', 'What is 7 × 8?'],
  '3.OA.D.8': ['Solve two-step word problems using four operations', 'Baker made 48 muffins, sold 15, packs rest in 3s. Boxes?'],
  '3.OA.D.9': ['Identify arithmetic patterns and explain them', 'What pattern do you see in the multiples of 4?'],
  '3.NBT.A.1': ['Round whole numbers to nearest 10 or 100', 'Round 374 to the nearest 10.'],
  '3.NBT.A.2': ['Fluently add and subtract within 1,000', 'What is 856 − 478?'],
  '3.NBT.A.3': ['Multiply one-digit numbers by multiples of 10', 'What is 7 × 60?'],
  '3.NF.A.1': ['Understand a fraction as one part of a whole', 'A pie cut into 8 equal slices. What fraction is 3 slices?'],
  '3.NF.A.2': ['Represent fractions on a number line', 'What fraction is halfway between 0 and 1?'],
  '3.NF.A.3': ['Explain equivalence; compare fractions', 'Which is greater: 3/4 or 3/8?'],
  '3.MD.A.1': ['Tell time to nearest minute; solve elapsed time problems', 'Movie starts 2:15, ends 3:50. How long is it?'],
  '3.MD.A.2': ['Measure and estimate liquid volumes and masses', 'A bottle holds about 1 ___ of water. Litre or millilitre?'],
  '3.MD.B.3': ['Draw and interpret scaled picture/bar graphs', 'How many more students chose blue than red?'],
  '3.MD.C.5': ['Recognize area as an attribute of plane figures', 'What is the area of a shape covering 12 unit squares?'],
  '3.MD.C.6': ['Measure area by counting unit squares', 'Count the unit squares. What is the area?'],
  '3.MD.C.7': ['Relate area to multiplication and addition', 'A 4×6 rectangle — what is its area?'],
  '3.MD.D.8': ['Solve problems involving perimeters of polygons', 'A 6cm × 4cm rectangle. Perimeter?'],
  '3.G.A.1': ['Understand shapes share attributes (e.g., all quadrilaterals)', 'What do all quadrilaterals have in common?'],
  '3.G.A.2': ['Partition shapes into parts with equal areas', 'Divide a rectangle into 6 equal parts. Each part is what fraction?'],
  '4.OA.A.1': ['Interpret a multiplication equation as a comparison', '35 is 5 times as many as what number?'],
  '4.OA.A.2': ['Multiply or divide to solve comparison word problems', 'Ahmed is 3 times as old as his sister who is 7. How old is Ahmed?'],
  '4.OA.A.3': ['Solve multi-step word problems; interpret remainders', '250 pencils for 38 students. How many extras?'],
  '4.OA.B.4': ['Find factor pairs; identify prime and composite numbers', 'Is 37 prime or composite?'],
  '4.OA.C.5': ['Generate a number or shape pattern following a rule', 'Rule: multiply by 3. Start at 2. List next 4 terms.'],
  '4.NBT.A.1': ['Recognize 10× relationships between adjacent place values', 'The digit 4 in 40,000 is how many times the value of 4 in 4,000?'],
  '4.NBT.A.2': ['Read and write multi-digit whole numbers in multiple forms', 'What is the value of the 6 in 364,891?'],
  '4.NBT.A.3': ['Round multi-digit whole numbers to any place', 'Round 47,382 to the nearest thousand.'],
  '4.NBT.B.4': ['Fluently add and subtract multi-digit whole numbers', 'What is 56,281 + 34,769?'],
  '4.NBT.B.5': ['Multiply up to 4-digit by 1-digit; two 2-digit numbers', 'What is 47 × 23?'],
  '4.NBT.B.6': ['Find whole-number quotients and remainders', 'What is 6,372 ÷ 4?'],
  '4.NF.A.1': ['Explain and generate equivalent fractions', 'What fraction equals 2/3 with denominator 12?'],
  '4.NF.A.2': ['Compare fractions with different numerators/denominators', 'Which is greater: 5/8 or 3/5?'],
  '4.NF.B.3': ['Add and subtract fractions and mixed numbers (like denominators)', 'What is 2/5 + 4/5?'],
  '4.NF.B.4': ['Multiply fractions by whole numbers', 'What is 3 × 2/5?'],
  '4.NF.C.5': ['Express fractions with denominator 10 as hundredths', 'Write 3/10 as hundredths.'],
  '4.NF.C.6': ['Use decimal notation for fractions with denominators 10 or 100', 'Write 7/10 as a decimal.'],
  '4.NF.C.7': ['Compare two decimals to hundredths', 'Which is greater: 0.45 or 0.405?'],
  '4.MD.A.1': ['Know relative sizes of measurement units; convert within a system', 'How many centimetres in 3 metres?'],
  '4.MD.A.3': ['Apply area and perimeter formulas for rectangles', 'A garden is 12 m × 8 m. What is its area?'],
  '4.MD.B.4': ['Make a line plot to display data in fractions of a unit', 'Which measurement appears most on the line plot?'],
  '4.MD.C.5': ['Recognize angles as geometric shapes; understand degrees', 'An angle that measures 90° is called a ___ angle.'],
  '4.MD.C.6': ['Measure angles in whole-number degrees using a protractor', 'What type of angle is 135°?'],
  '4.MD.C.7': ['Recognize angle measure as additive', 'A 120° angle is split into two. One is 45°. What is the other?'],
  '4.G.A.1': ['Draw points, lines, line segments, rays, angles', 'How many endpoints does a line segment have?'],
  '4.G.A.2': ['Classify 2D figures based on parallel/perpendicular lines and angles', 'Which shape always has two pairs of parallel sides?'],
  '4.G.A.3': ['Recognize a line of symmetry for a 2D figure', 'How many lines of symmetry does a square have?'],
  '5.OA.A.1': ['Evaluate expressions with parentheses, brackets, braces', 'What is (3 + 4) × 2 − 5?'],
  '5.OA.A.2': ['Write simple expressions that record calculations', 'Write an expression: subtract 4 from the product of 5 and 3.'],
  '5.OA.B.3': ['Generate two numerical patterns using two given rules', 'Rule A: add 2. Rule B: add 4. Start both at 0. List 5 terms each.'],
  '5.NBT.A.1': ['Understand 10× place value relationships', 'The digit 4 in 3,400 is how many times the value in 340?'],
  '5.NBT.A.2': ['Explain patterns when multiplying/dividing by powers of 10', 'What is 4.5 × 10²?'],
  '5.NBT.A.3': ['Read, write, and compare decimals to thousandths', 'Which is greater: 0.45 or 0.405?'],
  '5.NBT.A.4': ['Round decimals to any place', 'Round 3.7284 to the nearest hundredth.'],
  '5.NBT.B.5': ['Fluently multiply multi-digit whole numbers', 'What is 347 × 82?'],
  '5.NBT.B.6': ['Find whole-number quotients with up to four-digit dividends', 'What is 8,736 ÷ 24?'],
  '5.NBT.B.7': ['Add, subtract, multiply, divide decimals to hundredths', 'What is 12.4 + 7.85?'],
  '5.NF.A.1': ['Add and subtract fractions with unlike denominators', 'What is 2/3 + 3/4?'],
  '5.NF.A.2': ['Solve word problems with addition/subtraction of fractions', 'A recipe uses 1/2 cup of flour and 1/3 cup of sugar. Total cups?'],
  '5.NF.B.3': ['Interpret a fraction as division', 'What does 3/4 mean as a division problem?'],
  '5.NF.B.4': ['Multiply fractions and mixed numbers', 'What is 2/3 × 3/5?'],
  '5.NF.B.5': ['Interpret multiplication as scaling (resizing)', 'Is 3/4 × 8 greater or less than 8? Why?'],
  '5.NF.B.6': ['Solve real-world problems involving multiplication of fractions', 'A recipe needs 2/3 of a cup. Making 1.5 batches. Total cups?'],
  '5.NF.B.7': ['Divide unit fractions by whole numbers and vice versa', 'What is 1/3 ÷ 4?'],
  '5.MD.A.1': ['Convert measurement units within the same system', 'How many centimetres in 3.5 metres?'],
  '5.MD.B.2': ['Make a line plot; use it to solve problems', 'What is the difference between the longest and shortest lengths?'],
  '5.MD.C.3': ['Recognize volume as an attribute of solid figures', 'What unit do we use to measure volume?'],
  '5.MD.C.4': ['Measure volumes by counting unit cubes', 'Count the unit cubes. What is the volume?'],
  '5.MD.C.5': ['Relate volume to multiplication and addition', 'A box is 3 cm × 4 cm × 5 cm. What is its volume?'],
  '5.G.A.1': ['Use a coordinate plane; plot points in first quadrant', 'Plot (3, 5). Which axis is horizontal?'],
  '5.G.A.2': ['Represent real-world problems by graphing in first quadrant', 'Mark the point showing 4 hours and 200 km.'],
  '5.G.B.3': ['Understand attributes of a category apply to all subcategories', 'All squares are rectangles. True or false?'],
  '5.G.B.4': ['Classify 2D figures in a hierarchy based on properties', 'Is a rhombus always a parallelogram?'],
}

// ── Flag metadata ──────────────────────────────────────────────────────────────

const FLAGS = [
  {
    code:  'wrong_answer',
    label: 'Wrong Answer',
    trust: 'High' as const,
    color: 'bg-red-900/40 text-red-300 border-red-700',
    desc:  'The stated correct answer is mathematically incorrect.',
    action: 'Work it out yourself. If your answer differs, flag with the correct value in Suggested Fix.',
  },
  {
    code:  'ui_mismatch',
    label: 'UI Mismatch',
    trust: 'High' as const,
    color: 'bg-red-900/40 text-red-300 border-red-700',
    desc:  'The answer format cannot be entered using the assigned input type.',
    action: 'Check the Type Rules tab. Most common: fraction answer on a numeric input, or text answer on any input.',
  },
  {
    code:  'format_error',
    label: 'Format Error',
    trust: 'High' as const,
    color: 'bg-red-900/40 text-red-300 border-red-700',
    desc:  'Multiple choice has fewer than 2 options, or the options array is missing.',
    action: 'Look at the options grid. If empty or only 1 option is shown, flag it.',
  },
  {
    code:  'missing_visual_ref',
    label: 'Missing Visual',
    trust: 'High' as const,
    color: 'bg-amber-900/40 text-amber-300 border-amber-700',
    desc:  'Question text says "look at the diagram/picture/figure" but no visual is attached.',
    action: 'Check whether the question is self-contained without an image. If it references something invisible, flag it.',
  },
  {
    code:  'unanswerable',
    label: 'Unanswerable',
    trust: 'Medium' as const,
    color: 'bg-red-900/40 text-red-300 border-red-700',
    desc:  'The question is missing information needed to solve it.',
    action: 'Try to solve it yourself. If you can solve it without any extra information, approve.',
  },
  {
    code:  'grade_mismatch',
    label: 'Grade Mismatch',
    trust: 'Low' as const,
    color: 'bg-purple-900/40 text-purple-300 border-purple-700',
    desc:  'AI thinks the content is too hard or too easy for the stated grade.',
    action: '⚠️ Always check the difficulty stars first. 3-star (hard) questions are EXPECTED to be challenging. Check the Standards tab and override the AI here often.',
  },
  {
    code:  'weak_distractors',
    label: 'Weak Distractors',
    trust: 'Low' as const,
    color: 'bg-orange-900/40 text-orange-300 border-orange-700',
    desc:  'For multiple choice: wrong options are too obvious or nonsensical.',
    action: 'Check if wrong options reflect common student mistakes. If most are plausible, approve. Only flag if all wrong options are clearly absurd.',
  },
  {
    code:  'ambiguous_wording',
    label: 'Ambiguous Wording',
    trust: 'Medium' as const,
    color: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
    desc:  'The question could be interpreted in multiple valid ways.',
    action: 'Read it as a child of that grade. If you can only see one interpretation, approve.',
  },
]

const TRUST_COLORS = {
  High:   'bg-red-900/40 text-red-300 border border-red-700',
  Medium: 'bg-amber-900/40 text-amber-300 border border-amber-700',
  Low:    'bg-emerald-900/40 text-emerald-300 border border-emerald-700',
}

// ── Types ──────────────────────────────────────────────────────────────────────

type GuideTab = 'checklist' | 'standards' | 'flags'
type FilterTab = 'ai_flagged' | 'pending' | 'all' | 'approved' | 'flagged'

interface QueueData {
  queue:   ReviewableQuestion[]
  reviews: Record<string, ReviewRecord>
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getStatus(ref: string, reviews: Record<string, ReviewRecord>) {
  const r = reviews[ref]
  if (!r) return 'pending'
  if (r.status === 'approved') return 'approved'
  if (r.status === 'flagged' && r.is_ai_review) return 'ai_flagged'
  return 'flagged'
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-400 text-sm tracking-tight">
      {'★'.repeat(n)}{'☆'.repeat(3 - n)}
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ReviewPortal({ userEmail }: { userEmail: string }) {
  const [data,        setData]        = useState<QueueData | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState<FilterTab>('ai_flagged')
  const [idx,         setIdx]         = useState(0)
  const [guideTab,    setGuideTab]    = useState<GuideTab>('checklist')
  const [isFlagMode,  setIsFlagMode]  = useState(false)
  const [flagComment, setFlagComment] = useState('')
  const [fixText,     setFixText]     = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const commentRef = useRef<HTMLTextAreaElement>(null)

  // fetch
  useEffect(() => {
    fetch('/api/review/queue')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  // derived
  const filtered = data
    ? data.queue.filter(q => {
        const s = getStatus(q.ref, data.reviews)
        if (filter === 'all')        return true
        if (filter === 'pending')    return s === 'pending'
        if (filter === 'ai_flagged') return s === 'ai_flagged'
        if (filter === 'approved')   return s === 'approved'
        if (filter === 'flagged')    return s === 'flagged'
        return true
      })
    : []

  const current = filtered[idx] ?? null
  const currentReview = current ? data?.reviews[current.ref] : undefined

  const counts = data ? {
    total:      data.queue.length,
    ai_flagged: data.queue.filter(q => getStatus(q.ref, data.reviews) === 'ai_flagged').length,
    pending:    data.queue.filter(q => getStatus(q.ref, data.reviews) === 'pending').length,
    approved:   data.queue.filter(q => getStatus(q.ref, data.reviews) === 'approved').length,
    flagged:    data.queue.filter(q => getStatus(q.ref, data.reviews) === 'flagged').length,
  } : { total: 0, ai_flagged: 0, pending: 0, approved: 0, flagged: 0 }

  const progress = counts.total > 0
    ? Math.round(((counts.approved + counts.flagged) / counts.total) * 100)
    : 0

  // standards for current question's grade+domain
  const relevantStandards = current
    ? Object.entries(STANDARDS).filter(([code]) => {
        const parts = code.split('.')
        return parts[0] === String(current.grade_level) && parts[1] === current.domain
      })
    : []

  // navigation
  function navigate(dir: number) {
    setIdx(i => Math.max(0, Math.min(filtered.length - 1, i + dir)))
    setIsFlagMode(false); setFlagComment(''); setFixText('')
  }

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowRight' || e.key === 'l') handleApprove()
      if (e.key === 'ArrowLeft'  || e.key === 'h') openFlag()
      if (e.key === 'ArrowDown'  || e.key === 'j') navigate(1)
      if (e.key === 'ArrowUp'    || e.key === 'k') navigate(-1)
      if (e.key === 'Escape') { setIsFlagMode(false); setFlagComment(''); setFixText('') }
      if (e.key === '1') setGuideTab('checklist')
      if (e.key === '2') setGuideTab('standards')
      if (e.key === '3') setGuideTab('flags')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // auto-switch to standards tab when question changes
  useEffect(() => {
    if (current?.standard_code) setGuideTab('standards')
  }, [current?.ref])

  useEffect(() => { setIdx(0) }, [filter])

  function openFlag() {
    const aiNotes = currentReview?.ai_notes ?? ''
    if (!flagComment) setFlagComment(currentReview?.comment || aiNotes || '')
    if (!fixText) setFixText(currentReview?.suggested_fix ?? '')
    setIsFlagMode(true)
    setTimeout(() => commentRef.current?.focus(), 50)
  }

  const handleApprove = useCallback(async () => {
    if (!current || submitting) return
    setSubmitting(true)
    await fetch('/api/review/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: current.ref, source: current.source, status: 'approved', snapshot: current }),
    })
    setData(prev => prev ? {
      ...prev,
      reviews: { ...prev.reviews, [current.ref]: {
        status: 'approved', comment: null, suggested_fix: null,
        reviewed_at: new Date().toISOString(),
        ai_flags: prev.reviews[current.ref]?.ai_flags ?? [],
        ai_notes: prev.reviews[current.ref]?.ai_notes ?? null,
        is_ai_review: false,
      }},
    } : prev)
    setSubmitting(false)
    navigate(1)
  }, [current, submitting])

  async function handleFlag() {
    if (!current || !flagComment.trim()) { commentRef.current?.focus(); return }
    setSubmitting(true)
    await fetch('/api/review/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: current.ref, source: current.source, status: 'flagged',
        comment: flagComment.trim(), suggested_fix: fixText.trim() || undefined,
        snapshot: current,
      }),
    })
    setData(prev => prev ? {
      ...prev,
      reviews: { ...prev.reviews, [current.ref]: {
        status: 'flagged', comment: flagComment.trim(), suggested_fix: fixText.trim() || null,
        reviewed_at: new Date().toISOString(),
        ai_flags: prev.reviews[current.ref]?.ai_flags ?? [],
        ai_notes: prev.reviews[current.ref]?.ai_notes ?? null,
        is_ai_review: false,
      }},
    } : prev)
    setIsFlagMode(false); setFlagComment(''); setFixText('')
    setSubmitting(false)
    navigate(1)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/review/login'
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">📋</div>
          <p className="text-gray-400">Loading question queue…</p>
        </div>
      </div>
    )
  }

  // ── Layout ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-2.5 flex items-center gap-3 flex-wrap">

        {/* Brand */}
        <span className="text-base font-extrabold tracking-tight shrink-0">
          <span className="text-white">Math</span>
          <span style={{ color: '#E74C3C' }}>Kix</span>
          <span className="text-indigo-400 text-xs font-medium ml-1.5">Review</span>
        </span>

        {/* Progress bar */}
        <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-[200px]">
          <div className="h-1.5 flex-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-500 shrink-0">{progress}%</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            ['ai_flagged', `⚑ ${counts.ai_flagged}`, 'bg-amber-900/40 text-amber-300 border-amber-700'],
            ['pending',    `○ ${counts.pending}`,     'bg-gray-800 text-gray-400 border-gray-700'],
            ['approved',   `✓ ${counts.approved}`,    'bg-emerald-900/40 text-emerald-300 border-emerald-700'],
            ['flagged',    `✗ ${counts.flagged}`,     'bg-red-900/40 text-red-300 border-red-700'],
          ].map(([f, label, cls]) => (
            <button
              key={f}
              onClick={() => setFilter(f as FilterTab)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${cls} ${filter === f ? 'ring-1 ring-white/20 scale-105' : 'opacity-60 hover:opacity-100'}`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setFilter('all')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border bg-gray-800 text-gray-400 border-gray-700 transition-all ${filter === 'all' ? 'ring-1 ring-white/20 scale-105' : 'opacity-60 hover:opacity-100'}`}
          >
            All {counts.total}
          </button>
        </div>

        {/* User + sign out */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-600 hidden sm:block">{userEmail}</span>
          <button onClick={handleSignOut} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════════════════════════════════════════════════════════════════════
            LEFT — Question area
        ════════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {filtered.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <p className="text-gray-300 text-lg font-semibold">All done!</p>
                <p className="text-gray-500 text-sm mt-1">No questions in this filter.</p>
              </div>
            </div>
          ) : !current ? null : (
            <div className="max-w-2xl mx-auto w-full px-4 py-5">

              {/* Nav row */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigate(-1)} disabled={idx === 0}
                  className="text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">
                  {idx + 1} / {filtered.length}
                </span>
                <button onClick={() => navigate(1)} disabled={idx >= filtered.length - 1}
                  className="text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                  Next →
                </button>
              </div>

              {/* ── Question card ──────────────────────────────────────────── */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">

                {/* Card header */}
                <div className="px-5 py-3.5 border-b border-gray-800 flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    current.source === 'diagnostic'
                      ? 'bg-blue-900/60 text-blue-300 border-blue-700'
                      : 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                  }`}>
                    {current.source === 'diagnostic' ? '🔬 Diagnostic' : '📘 Lesson'}
                  </span>
                  <span className="text-sm font-semibold text-white bg-gray-800 px-2.5 py-1 rounded-full">
                    Grade {current.grade_level}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">
                    {DOMAIN_LABELS[current.domain] ?? current.domain}
                  </span>
                  <Stars n={current.difficulty} />
                  {current.lesson_title && (
                    <span className="text-xs text-gray-500 truncate max-w-[180px]">
                      {current.lesson_title} · Q{(current.question_index ?? 0) + 1}
                    </span>
                  )}
                  {currentReview && (
                    <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full border ${
                      currentReview.status === 'approved'
                        ? 'bg-emerald-900/60 text-emerald-400 border-emerald-700'
                        : 'bg-red-900/60 text-red-400 border-red-700'
                    }`}>
                      {currentReview.status === 'approved' ? '✓ Approved' : '✗ Flagged'}
                    </span>
                  )}
                </div>

                {/* Standard code */}
                {current.standard_code && (
                  <div className="px-5 pt-4">
                    <div className="bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 flex items-start gap-3">
                      <span className="text-indigo-400 font-mono font-semibold text-sm shrink-0">
                        {current.standard_code}
                      </span>
                      {STANDARDS[current.standard_code] && (
                        <span className="text-gray-400 text-sm">
                          — {STANDARDS[current.standard_code][0]}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Question text */}
                <div className="px-5 pt-4 pb-3">
                  <div className="bg-gray-800 rounded-xl p-5 text-center">
                    <p className="text-white text-xl font-medium leading-relaxed">
                      {current.question_text}
                    </p>
                  </div>
                </div>

                {/* Meta + answer */}
                <div className="px-5 pb-4 space-y-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
                      current.has_audio
                        ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700'
                        : 'bg-gray-800 text-gray-500 border-gray-700'
                    }`}>
                      🔊 {current.has_audio ? 'Read-aloud (G1-2)' : 'No audio (G3+)'}
                    </span>
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full border bg-gray-800 text-gray-400 border-gray-700">
                      Type: {current.question_type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-28 shrink-0">Correct Answer</span>
                    <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700 px-3 py-1.5 rounded-lg font-bold text-sm font-mono">
                      {current.correct_answer}
                    </span>
                  </div>

                  {current.options && current.options.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Options</p>
                      <div className="grid grid-cols-2 gap-2">
                        {current.options.map(opt => {
                          const correct = opt.value === current.correct_answer
                          return (
                            <div key={opt.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                              correct
                                ? 'bg-emerald-900/40 border-emerald-700 text-emerald-300 font-semibold'
                                : 'bg-gray-800 border-gray-700 text-gray-300'
                            }`}>
                              <span className="font-bold text-xs text-gray-500 w-4">{opt.label}</span>
                              <span>{opt.value}</span>
                              {correct && <span className="ml-auto text-emerald-400 text-xs">✓ correct</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI flags */}
                {currentReview && currentReview.ai_flags.length > 0 && (
                  <div className="mx-5 mb-4 bg-amber-950/30 border border-amber-800/60 rounded-xl px-4 py-3 space-y-2">
                    <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      ⚑ AI Flags
                      {currentReview.is_ai_review && (
                        <span className="font-normal text-amber-600 normal-case">(awaiting your review)</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentReview.ai_flags.map(flag => {
                        const meta = FLAGS.find(f => f.code === flag)
                        return (
                          <span key={flag}
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta?.color ?? 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                            {meta?.label ?? flag}
                          </span>
                        )
                      })}
                    </div>
                    {currentReview.ai_notes && (
                      <p className="text-xs text-amber-200/70 italic">{currentReview.ai_notes}</p>
                    )}
                  </div>
                )}

                {/* Previous human flag */}
                {currentReview?.status === 'flagged' && !currentReview.is_ai_review && (
                  <div className="mx-5 mb-5 space-y-2">
                    {currentReview.comment && (
                      <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
                        <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1">What&apos;s wrong</p>
                        <p className="text-sm text-red-200">{currentReview.comment}</p>
                      </div>
                    )}
                    {currentReview.suggested_fix && (
                      <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl px-4 py-3">
                        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Suggested fix</p>
                        <p className="text-sm text-emerald-200 whitespace-pre-wrap">{currentReview.suggested_fix}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Flag form ────────────────────────────────────────────────── */}
              {isFlagMode && (
                <div className="mt-4 bg-red-950/40 border border-red-800 rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-red-300 mb-2">
                      What&apos;s wrong? <span className="text-red-500">*</span>
                    </label>
                    <textarea ref={commentRef} value={flagComment}
                      onChange={e => setFlagComment(e.target.value)} rows={2}
                      placeholder="e.g. Correct answer is wrong — 7 × 8 = 56, not 54"
                      className="w-full bg-gray-900 border border-red-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-400 mb-2">
                      Suggested fix <span className="text-gray-500 font-normal">(optional — very helpful)</span>
                    </label>
                    <textarea value={fixText} onChange={e => setFixText(e.target.value)} rows={3}
                      placeholder={
                        current.question_type === 'multiple_choice'
                          ? 'e.g. Change correct_answer to "C"\nOr: Option B should say "4 × 3" not "4 + 3"'
                          : 'e.g. Change correct_answer to 56\nOr: Change type to "multiple_choice" and add word options'
                      }
                      className="w-full bg-gray-900 border border-emerald-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none placeholder-gray-600" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setIsFlagMode(false); setFlagComment(''); setFixText('') }}
                      className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-800 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleFlag} disabled={submitting || !flagComment.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 disabled:bg-red-900 text-white text-sm font-bold transition-colors">
                      {submitting ? 'Saving…' : 'Submit Flag'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Action buttons ───────────────────────────────────────────── */}
              {!isFlagMode && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <button onClick={openFlag} disabled={submitting}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-900/60 hover:bg-red-800/80 border border-red-700 text-red-300 font-bold text-lg transition-all active:scale-95 disabled:opacity-50">
                    <span className="text-xl">✗</span> Flag
                    <span className="text-xs font-normal text-red-500 ml-1">(← or H)</span>
                  </button>
                  <button onClick={handleApprove} disabled={submitting}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700 text-emerald-300 font-bold text-lg transition-all active:scale-95 disabled:opacity-50">
                    <span className="text-xl">✓</span> Approve
                    <span className="text-xs font-normal text-emerald-600 ml-1">(→ or L)</span>
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-gray-600 mt-3">
                ← / H&nbsp;flag &nbsp;·&nbsp; → / L&nbsp;approve &nbsp;·&nbsp; ↑↓ / J K&nbsp;navigate &nbsp;·&nbsp; 1 2 3&nbsp;guide tabs
              </p>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT — Guide panel
        ════════════════════════════════════════════════════════════════════ */}
        <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 border-l border-gray-800 bg-gray-900/50 overflow-hidden">

          {/* Guide tab bar */}
          <div className="flex border-b border-gray-800 shrink-0">
            {([
              ['checklist', '1', 'Checklist'],
              ['standards', '2', 'Standards'],
              ['flags',     '3', 'Flag Types'],
            ] as const).map(([tab, num, label]) => (
              <button key={tab} onClick={() => setGuideTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2 ${
                  guideTab === tab
                    ? 'text-white border-indigo-500'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}>
                <span className="text-gray-600 mr-1">{num}</span>{label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* ── CHECKLIST TAB ────────────────────────────────────────────── */}
            {guideTab === 'checklist' && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
                  Decision framework — check in order
                </p>

                {[
                  { n: '1', color: 'text-red-400', title: 'Is the correct answer right?',
                    body: 'Work it out yourself. If wrong → Flag with correct value in Suggested Fix.' },
                  { n: '2', color: 'text-red-400', title: 'Can the student enter this answer?',
                    body: 'Check the type rules below. Fraction answer on numeric = broken. Text on any input = broken.' },
                  { n: '3', color: 'text-amber-400', title: 'Is the question clear?',
                    body: 'Read as a child of that grade. Multiple valid interpretations → Flag Ambiguous Wording.' },
                  { n: '4', color: 'text-amber-400', title: 'Is there enough info to solve it?',
                    body: '"Look at the picture" but no picture visible → Flag Missing Visual. Missing numbers → Flag Unanswerable.' },
                  { n: '5', color: 'text-purple-400', title: 'Does difficulty match grade? (check Stars!)',
                    body: '★★★ hard questions at a grade SHOULD push the boundary. Always check stars before Grade Mismatch.' },
                  { n: '6', color: 'text-orange-400', title: 'Are the MC distractors reasonable?',
                    body: 'Wrong options should reflect common mistakes. Only flag if ALL wrong options are obviously absurd.' },
                  { n: '7', color: 'text-yellow-400', title: 'Is the language age-appropriate?',
                    body: 'G1-2: simple words, short sentences. G3-5: can be more complex.' },
                ].map(item => (
                  <div key={item.n} className="flex gap-3 bg-gray-800/40 border border-gray-700/60 rounded-xl p-3">
                    <span className={`text-base font-extrabold shrink-0 mt-0.5 ${item.color}`}>{item.n}</span>
                    <div>
                      <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}

                {/* Type rules quick ref */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Type rules</p>
                  {[
                    { type: 'multiple_choice', rule: 'correct_answer must exactly match one option value. Options ≥ 2.' },
                    { type: 'numeric',         rule: 'correct_answer must be a plain number: "7", "3.14". No fractions, no words.' },
                    { type: 'fraction',        rule: 'correct_answer must be X/Y format with Y ≠ 0. No decimals, no mixed numbers. Grade 3+ only.' },
                  ].map(row => (
                    <div key={row.type} className="mb-2 bg-gray-800/60 border border-gray-700/50 rounded-lg p-3">
                      <p className="text-xs font-mono font-bold text-indigo-400 mb-1">{row.type}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{row.rule}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 bg-indigo-900/20 border border-indigo-800/60 rounded-xl p-3">
                  <p className="text-xs text-indigo-300 font-semibold mb-1">When in doubt</p>
                  <p className="text-xs text-indigo-200/70">If unsure after 60 seconds, approve. Flag only clear errors, not debatable edge cases.</p>
                </div>
              </div>
            )}

            {/* ── STANDARDS TAB ────────────────────────────────────────────── */}
            {guideTab === 'standards' && (
              <div className="p-4">
                {!current ? (
                  <p className="text-xs text-gray-500 text-center mt-8">Select a question to see its standards.</p>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                        Showing Grade {current.grade_level} · {DOMAIN_LABELS[current.domain] ?? current.domain}
                      </p>
                      {current.domain === 'NF' && (
                        <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-2.5 mt-2">
                          <p className="text-xs text-purple-300">
                            ⚠️ NF (Fractions) is a Grade 3+ domain. A Grade 1-2 question with type "fraction" is almost certainly a data error.
                          </p>
                        </div>
                      )}
                    </div>

                    {relevantStandards.length === 0 ? (
                      <p className="text-xs text-gray-500">No standards found for Grade {current.grade_level} · {current.domain}.</p>
                    ) : (
                      <div className="space-y-2">
                        {relevantStandards.map(([code, [desc, example]]) => {
                          const isCurrent = code === current.standard_code
                          return (
                            <div key={code} className={`rounded-xl border p-3 transition-all ${
                              isCurrent
                                ? 'bg-indigo-900/30 border-indigo-600 ring-1 ring-indigo-500/40'
                                : 'bg-gray-800/40 border-gray-700/60'
                            }`}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className={`font-mono text-xs font-bold ${isCurrent ? 'text-indigo-300' : 'text-gray-400'}`}>
                                  {code}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-semibold">
                                    CURRENT
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs leading-relaxed ${isCurrent ? 'text-white' : 'text-gray-400'}`}>{desc}</p>
                              <p className="text-[11px] text-gray-500 mt-1.5 italic">e.g. {example}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-500 font-semibold mb-2">Difficulty at this grade</p>
                      {[
                        ['★☆☆', 'Easy',   'emerald', 'Straightforward. Single step. Small numbers.'],
                        ['★★☆', 'Medium', 'amber',   'Slightly less obvious. May need two steps.'],
                        ['★★★', 'Hard',   'red',     'Upper boundary of standard. Multi-step, larger numbers. Should feel hard.'],
                      ].map(([stars, label, c, body]) => (
                        <div key={label} className={`mb-2 bg-${c}-900/20 border border-${c}-800/40 rounded-lg px-3 py-2`}>
                          <p className="text-xs font-semibold text-white">{stars} {label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{body}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── FLAGS TAB ────────────────────────────────────────────────── */}
            {guideTab === 'flags' && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
                  Flag types — AI trust level &amp; what to do
                </p>

                {FLAGS.map(flag => (
                  <div key={flag.code} className={`rounded-xl border p-3 space-y-1.5 ${
                    currentReview?.ai_flags?.includes(flag.code)
                      ? 'ring-1 ring-amber-500/40 bg-amber-950/20 border-amber-800/60'
                      : 'bg-gray-800/40 border-gray-700/60'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${flag.color}`}>
                        {flag.label}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TRUST_COLORS[flag.trust]}`}>
                        {flag.trust} trust
                      </span>
                      {currentReview?.ai_flags?.includes(flag.code) && (
                        <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded-full font-semibold ml-auto">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{flag.desc}</p>
                    <p className="text-xs text-gray-300 leading-relaxed border-t border-gray-700/60 pt-1.5 mt-1">
                      → {flag.action}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </aside>
      </div>
    </div>
  )
}
