'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { QuestionVisual } from '@/components/adaptive/interactive/QuestionVisual'
import type { ReviewableQuestion, ReviewRecord } from '@/app/api/admin/questions/queue/route'

// ── CCSS standard descriptions ─────────────────────────────────────────────
const CCSS: Record<string, string> = {
  '1.OA.A.1': 'Use addition/subtraction within 20 to solve word problems',
  '1.OA.A.2': 'Solve word problems with three whole numbers, sum ≤ 20',
  '1.OA.B.3': 'Apply properties of operations (commutative, associative)',
  '1.OA.B.4': 'Understand subtraction as an unknown-addend problem',
  '1.OA.C.5': 'Relate counting to addition and subtraction',
  '1.OA.C.6': 'Add and subtract within 20',
  '1.OA.D.7': 'Understand the meaning of the equal sign',
  '1.OA.D.8': 'Determine the unknown whole number in an addition/subtraction equation',
  '1.NBT.A.1': 'Count to 120, starting at any number',
  '1.NBT.B.2': 'Understand that the two digits of a two-digit number represent tens and ones',
  '1.NBT.B.3': 'Compare two-digit numbers using >, =, <',
  '1.NBT.C.4': 'Add within 100, including a two-digit number and a one-digit number',
  '1.NBT.C.5': 'Mentally find 10 more or 10 less than a number',
  '1.NBT.C.6': 'Subtract multiples of 10 in the range 10-90',
  '1.MD.A.1': 'Order three objects by length',
  '1.MD.A.2': 'Express the length of an object by laying length units end to end',
  '1.MD.B.3': 'Tell and write time in hours and half-hours',
  '1.MD.C.4': 'Organize, represent, and interpret data with up to three categories',
  '2.OA.A.1': 'Use addition/subtraction within 100 to solve one/two-step word problems',
  '2.OA.B.2': 'Fluently add and subtract within 20',
  '2.OA.C.3': 'Determine whether a group of objects has an odd or even number',
  '2.OA.C.4': 'Use addition to find the total number of objects arranged in arrays',
  '2.NBT.A.1': 'Understand that the three digits represent hundreds, tens, and ones',
  '2.NBT.A.2': 'Count within 1000; skip-count by 5s, 10s, and 100s',
  '2.NBT.A.3': 'Read and write numbers to 1000 using base-ten numerals',
  '2.NBT.A.4': 'Compare three-digit numbers using >, =, <',
  '2.NBT.B.5': 'Fluently add and subtract within 100',
  '2.NBT.B.6': 'Add up to four two-digit numbers',
  '2.NBT.B.7': 'Add and subtract within 1000',
  '2.NBT.B.8': 'Mentally add or subtract 10 or 100 to/from a given number',
  '2.MD.A.1': 'Measure the length of an object using appropriate tools',
  '2.MD.A.3': 'Estimate lengths using inches, feet, centimeters, and meters',
  '2.MD.B.5': 'Use addition and subtraction within 100 to solve word problems involving length',
  '2.MD.C.7': 'Tell and write time from analog and digital clocks to the nearest 5 minutes',
  '2.MD.C.8': 'Solve word problems involving dollar bills, quarters, dimes, nickels, and pennies',
  '2.MD.D.9': 'Generate measurement data by measuring lengths; show data on a line plot',
  '2.MD.D.10': 'Draw a picture graph and a bar graph to represent a data set',
  '2.G.A.1': 'Recognize and draw shapes having specified attributes',
  '2.G.A.2': 'Partition a rectangle into rows and columns of same-size squares',
  '2.G.A.3': 'Partition circles and rectangles into two, three, or four equal shares',
  '3.OA.A.1': 'Interpret products of whole numbers',
  '3.OA.A.2': 'Interpret whole-number quotients of whole numbers',
  '3.OA.A.3': 'Use multiplication/division within 100 to solve word problems',
  '3.OA.A.4': 'Determine the unknown whole number in a multiplication/division equation',
  '3.OA.B.5': 'Apply properties of multiplication operations',
  '3.OA.C.7': 'Fluently multiply and divide within 100',
  '3.OA.D.8': 'Solve two-step word problems using four operations',
  '3.NBT.A.1': 'Round whole numbers to the nearest 10 or 100',
  '3.NBT.A.2': 'Fluently add and subtract within 1000',
  '3.NBT.A.3': 'Multiply one-digit numbers by multiples of 10',
  '3.NF.A.1': 'Understand a fraction 1/b as one part of a whole partitioned into b equal parts',
  '3.NF.A.2': 'Understand a fraction as a number on the number line',
  '3.NF.A.3': 'Explain equivalence of fractions; compare fractions',
  '3.MD.A.1': 'Tell and write time to the nearest minute; solve elapsed time problems',
  '3.MD.A.2': 'Measure and estimate liquid volumes and masses',
  '3.MD.B.3': 'Draw a scaled picture graph and bar graph',
  '3.MD.C.5': 'Recognize area as an attribute of plane figures',
  '3.MD.C.6': 'Measure areas by counting unit squares',
  '3.MD.C.7': 'Relate area to multiplication and addition',
  '3.MD.D.8': 'Solve real-world problems involving perimeters of polygons',
  '3.G.A.1': 'Understand that shapes share attributes (e.g., quadrilaterals)',
  '4.OA.A.1': 'Interpret a multiplication equation as a comparison',
  '4.OA.A.2': 'Multiply or divide to solve multiplicative comparison word problems',
  '4.OA.A.3': 'Solve multi-step word problems with whole numbers',
  '4.OA.B.4': 'Find factor pairs; identify prime and composite numbers',
  '4.OA.C.5': 'Generate a number or shape pattern following a given rule',
  '4.NBT.A.1': 'Recognize that a digit in one place is 10× the digit to its right',
  '4.NBT.A.2': 'Read and write multi-digit whole numbers',
  '4.NBT.A.3': 'Round multi-digit whole numbers to any place',
  '4.NBT.B.4': 'Fluently add and subtract multi-digit whole numbers',
  '4.NBT.B.5': 'Multiply a whole number of up to four digits by a one-digit number',
  '4.NBT.B.6': 'Find whole-number quotients and remainders with up to four-digit dividends',
  '4.NF.A.1': 'Explain why a fraction a/b is equivalent to a fraction (n×a)/(n×b)',
  '4.NF.A.2': 'Compare two fractions with different numerators and denominators',
  '4.NF.B.3': 'Understand addition/subtraction of fractions as joining/separating parts',
  '4.NF.B.4': 'Apply understanding of multiplication as scaling to multiply fractions',
  '4.NF.C.5': 'Express fractions with denominator 10 as equivalent fractions with denominator 100',
  '4.NF.C.6': 'Use decimal notation for fractions with denominators 10 or 100',
  '4.NF.C.7': 'Compare two decimals to hundredths',
  '4.MD.A.1': 'Know relative sizes of measurement units; convert within a single system',
  '4.MD.A.3': 'Apply area and perimeter formulas for rectangles',
  '4.MD.B.4': 'Make a line plot to display a data set with fractions',
  '4.MD.C.5': 'Recognize angles as geometric shapes formed when two rays share a common endpoint',
  '4.MD.C.6': 'Measure angles in whole-number degrees using a protractor',
  '4.MD.C.7': 'Recognize angle measure as additive',
  '4.G.A.1': 'Draw points, lines, line segments, rays, angles, and perpendicular/parallel lines',
  '4.G.A.2': 'Classify two-dimensional figures based on the presence of parallel/perpendicular lines',
  '4.G.A.3': 'Recognize a line of symmetry for a two-dimensional figure',
  '5.OA.A.1': 'Use parentheses, brackets, or braces in numerical expressions',
  '5.OA.A.2': 'Write simple expressions that record calculations',
  '5.OA.B.3': 'Generate two numerical patterns using two given rules',
  '5.NBT.A.1': 'Recognize that in a multi-digit number, a digit in one place is 10× the place to its right',
  '5.NBT.A.2': 'Explain patterns when multiplying/dividing by powers of 10',
  '5.NBT.A.3': 'Read, write, and compare decimals to thousandths',
  '5.NBT.A.4': 'Round decimals to any place',
  '5.NBT.B.5': 'Fluently multiply multi-digit whole numbers',
  '5.NBT.B.6': 'Find whole-number quotients of whole numbers with up to four-digit dividends',
  '5.NBT.B.7': 'Add, subtract, multiply, and divide decimals to hundredths',
  '5.NF.A.1': 'Add and subtract fractions with unlike denominators',
  '5.NF.A.2': 'Solve word problems involving addition/subtraction of fractions',
  '5.NF.B.3': 'Interpret a fraction as division of the numerator by the denominator',
  '5.NF.B.4': 'Apply and extend previous understandings of multiplication to multiply fractions',
  '5.NF.B.5': 'Interpret multiplication as scaling (resizing)',
  '5.NF.B.6': 'Solve real-world problems involving multiplication of fractions',
  '5.NF.B.7': 'Apply and extend previous understandings of division to divide unit fractions',
  '5.MD.A.1': 'Convert among different-sized standard measurement units',
  '5.MD.B.2': 'Make a line plot to display a data set of measurements in fractions',
  '5.MD.C.3': 'Recognize volume as an attribute of solid figures',
  '5.MD.C.4': 'Measure volumes by counting unit cubes',
  '5.MD.C.5': 'Relate volume to the operations of multiplication and addition',
  '5.G.A.1': 'Use a pair of perpendicular number lines (coordinate plane)',
  '5.G.A.2': 'Represent real-world problems by graphing points in the first quadrant',
  '5.G.B.3': 'Understand that attributes of a category apply to all subcategories',
  '5.G.B.4': 'Classify two-dimensional figures in a hierarchy based on properties',
}

const DOMAIN_LABELS: Record<string, string> = {
  OA: 'Operations & Algebra',
  NBT: 'Number & Base Ten',
  NF: 'Fractions',
  MD: 'Measurement & Data',
  G: 'Geometry',
}

const GRADE_LABELS = ['', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']

const SOURCE_COLORS: Record<string, string> = {
  diagnostic: 'bg-blue-900/60 text-blue-300 border-blue-700',
  lesson:     'bg-emerald-900/60 text-emerald-300 border-emerald-700',
}

const SOURCE_LABELS: Record<string, string> = {
  diagnostic: '🔬 Diagnostic',
  lesson:     '📘 Lesson',
}

function DifficultyStars({ n }: { n: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(n)}{'☆'.repeat(3 - n)}
    </span>
  )
}

export function QuestionReviewDeck() {
  const [queue,         setQueue]         = useState<ReviewableQuestion[]>([])
  const [reviews,       setReviews]       = useState<Record<string, ReviewRecord>>({})
  const [currentIndex,  setCurrentIndex]  = useState(0)
  const [isLoading,     setIsLoading]     = useState(true)
  const [isFlagMode,    setIsFlagMode]    = useState(false)
  const [flagComment,   setFlagComment]   = useState('')
  const [isSubmitting,  setIsSubmitting]  = useState(false)
  const [filter,        setFilter]        = useState<'all' | 'pending' | 'approved' | 'flagged'>('pending')
  const commentRef = useRef<HTMLTextAreaElement>(null)

  // Load queue on mount
  useEffect(() => {
    fetch('/api/admin/questions/queue')
      .then(r => r.json())
      .then(({ queue: q, reviews: r }) => {
        setQueue(q)
        setReviews(r)
        // Start at first pending question
        const firstPending = q.findIndex((item: ReviewableQuestion) => !r[item.ref])
        setCurrentIndex(firstPending >= 0 ? firstPending : 0)
      })
      .finally(() => setIsLoading(false))
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isFlagMode) {
        if (e.key === 'Escape') { setIsFlagMode(false); setFlagComment('') }
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'l') handleApprove()
      if (e.key === 'ArrowLeft'  || e.key === 'h') { setIsFlagMode(true); setTimeout(() => commentRef.current?.focus(), 50) }
      if (e.key === 'ArrowDown'  || e.key === 'j') navigate(1)
      if (e.key === 'ArrowUp'    || e.key === 'k') navigate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const filteredQueue = queue.filter(q => {
    const r = reviews[q.ref]
    if (filter === 'pending')  return !r
    if (filter === 'approved') return r?.status === 'approved'
    if (filter === 'flagged')  return r?.status === 'flagged'
    return true
  })

  const current = filteredQueue[currentIndex]

  function navigate(delta: number) {
    setCurrentIndex(i => Math.max(0, Math.min(filteredQueue.length - 1, i + delta)))
    setIsFlagMode(false)
    setFlagComment('')
  }

  const submitReview = useCallback(async (status: 'approved' | 'flagged', comment?: string) => {
    if (!current) return
    setIsSubmitting(true)
    await fetch('/api/admin/questions/review', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        ref:      current.ref,
        source:   current.source,
        status,
        comment,
        snapshot: current,
      }),
    })
    setReviews(prev => ({
      ...prev,
      [current.ref]: { status, comment: comment ?? null, reviewed_at: new Date().toISOString() },
    }))
    setIsFlagMode(false)
    setFlagComment('')
    setIsSubmitting(false)
    // Advance to next if in pending filter
    if (filter === 'pending') {
      setCurrentIndex(i => Math.min(i, filteredQueue.length - 2))
    } else {
      navigate(1)
    }
  }, [current, filter, filteredQueue.length])

  function handleApprove() { submitReview('approved') }
  function handleFlagSubmit() {
    if (!flagComment.trim()) { commentRef.current?.focus(); return }
    submitReview('flagged', flagComment.trim())
  }

  // Stats
  const approvedCount = Object.values(reviews).filter(r => r.status === 'approved').length
  const flaggedCount  = Object.values(reviews).filter(r => r.status === 'flagged').length
  const pendingCount  = queue.length - approvedCount - flaggedCount

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🔍</div>
          <p className="text-gray-400">Loading question queue…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <span className="text-xl font-bold text-white">Admin</span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-300">Question Review</span>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-gray-800 text-gray-300 border border-gray-700 px-2.5 py-1 rounded-full">
            {queue.length} total
          </span>
          <span className="bg-green-900/60 text-green-400 border border-green-800 px-2.5 py-1 rounded-full">
            ✓ {approvedCount}
          </span>
          <span className="bg-red-900/60 text-red-400 border border-red-800 px-2.5 py-1 rounded-full">
            ✗ {flaggedCount}
          </span>
          <span className="bg-yellow-900/40 text-yellow-400 border border-yellow-800 px-2.5 py-1 rounded-full">
            ○ {pendingCount} pending
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          {(['pending', 'all', 'approved', 'flagged'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCurrentIndex(0) }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); window.location.href = '/admin/login' }}
          className="text-xs text-gray-500 hover:text-gray-300 ml-2"
        >
          Sign out
        </button>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question card + controls */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {/* Progress bar */}
          <div className="h-1 bg-gray-800">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${queue.length > 0 ? ((approvedCount + flaggedCount) / queue.length) * 100 : 0}%` }}
            />
          </div>

          {filteredQueue.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <p className="text-gray-300 text-lg font-semibold">All done!</p>
                <p className="text-gray-500 text-sm mt-1">
                  {filter === 'pending' ? 'No more pending questions.' : 'No questions in this filter.'}
                </p>
              </div>
            </div>
          ) : !current ? null : (
            <div className="max-w-3xl mx-auto w-full px-4 py-6">

              {/* Navigation + position */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigate(-1)}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} / {filteredQueue.length}
                  {filter === 'pending' && <span className="text-yellow-500 ml-2">({pendingCount} pending)</span>}
                </span>
                <button
                  onClick={() => navigate(1)}
                  disabled={currentIndex >= filteredQueue.length - 1}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  Next →
                </button>
              </div>

              {/* Question card */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">

                {/* Card header */}
                <div className="px-6 py-4 border-b border-gray-800 flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${SOURCE_COLORS[current.source]}`}>
                    {SOURCE_LABELS[current.source]}
                  </span>
                  <span className="text-sm font-semibold text-white bg-gray-800 px-2.5 py-1 rounded-full">
                    {GRADE_LABELS[current.grade_level]}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">
                    {DOMAIN_LABELS[current.domain] ?? current.domain}
                  </span>
                  <DifficultyStars n={current.difficulty} />
                  {current.lesson_title && (
                    <span className="text-xs text-gray-500 ml-auto truncate max-w-[200px]">
                      {current.lesson_title} · Q{(current.question_index ?? 0) + 1}
                    </span>
                  )}
                  {reviews[current.ref] && (
                    <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full border ${
                      reviews[current.ref].status === 'approved'
                        ? 'bg-green-900/60 text-green-400 border-green-700'
                        : 'bg-red-900/60 text-red-400 border-red-700'
                    }`}>
                      {reviews[current.ref].status === 'approved' ? '✓ Approved' : '✗ Flagged'}
                    </span>
                  )}
                </div>

                {/* Standard code */}
                {current.standard_code && (
                  <div className="px-6 pt-4 pb-0">
                    <div className="bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5">
                      <span className="text-indigo-400 font-mono font-semibold text-sm">
                        {current.standard_code}
                      </span>
                      {CCSS[current.standard_code] && (
                        <span className="text-gray-400 text-sm ml-2">- {CCSS[current.standard_code]}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Question text */}
                <div className="px-6 pt-5 pb-4">
                  <div className="bg-gray-800 rounded-xl p-5 text-center">
                    <p className="text-white text-xl font-medium leading-relaxed">
                      {current.question_text}
                    </p>
                  </div>
                </div>

                {/* Visual asset */}
                {current.visual_asset && (
                  <div className="px-6 pb-4">
                    <div className="border border-gray-700 rounded-xl p-4 bg-white/5">
                      <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">
                        Visual Asset · {JSON.parse(current.visual_asset).type}
                      </p>
                      <div className="bg-white rounded-lg p-4">
                        <QuestionVisual
                          visualAsset={current.visual_asset}
                          questionText={current.question_text}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Meta row: audio + question type */}
                <div className="px-6 pb-4 flex flex-wrap gap-3">
                  <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
                    current.has_audio
                      ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700'
                      : 'bg-gray-800 text-gray-500 border-gray-700'
                  }`}>
                    🔊 {current.has_audio ? 'Read-aloud active (G1-2)' : 'No audio (Grade 3+)'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border bg-gray-800 text-gray-400 border-gray-700">
                    Type: {current.question_type.replace('_', ' ')}
                  </div>
                </div>

                {/* Answer + options */}
                <div className="px-6 pb-6 space-y-3">
                  {/* Correct answer */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 shrink-0">
                      Correct Answer
                    </span>
                    <span className="bg-green-900/60 text-green-300 border border-green-700 px-3 py-1.5 rounded-lg font-bold text-sm">
                      {current.correct_answer}
                    </span>
                  </div>

                  {/* Multiple choice options */}
                  {current.options && current.options.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Options
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {current.options.map((opt) => {
                          const isCorrect = opt.value === current.correct_answer
                          return (
                            <div
                              key={opt.label}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                                isCorrect
                                  ? 'bg-green-900/40 border-green-700 text-green-300 font-semibold'
                                  : 'bg-gray-800 border-gray-700 text-gray-300'
                              }`}
                            >
                              <span className="font-bold text-xs text-gray-500 w-4">{opt.label}</span>
                              <span>{opt.value}</span>
                              {isCorrect && <span className="ml-auto text-green-400">✓</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Previous flag comment */}
                {reviews[current.ref]?.status === 'flagged' && reviews[current.ref].comment && (
                  <div className="mx-6 mb-6 bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
                    <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1">Flag Comment</p>
                    <p className="text-sm text-red-200">{reviews[current.ref].comment}</p>
                  </div>
                )}
              </div>

              {/* ── Flag comment input ──────────────────────────────────────────── */}
              {isFlagMode && (
                <div className="mt-4 bg-red-950/40 border border-red-800 rounded-2xl p-5">
                  <label className="block text-sm font-semibold text-red-300 mb-2">
                    What&apos;s wrong with this question?
                  </label>
                  <textarea
                    ref={commentRef}
                    value={flagComment}
                    onChange={(e) => setFlagComment(e.target.value)}
                    rows={3}
                    placeholder="Describe the issue - wrong answer, incorrect grade level, bad wording, misleading options…"
                    className="w-full bg-gray-900 border border-red-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                  />
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => { setIsFlagMode(false); setFlagComment('') }}
                      className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFlagSubmit}
                      disabled={isSubmitting || !flagComment.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 disabled:bg-red-900 text-white text-sm font-bold transition-colors"
                    >
                      {isSubmitting ? 'Submitting…' : 'Submit Flag'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Action buttons ──────────────────────────────────────────────── */}
              {!isFlagMode && (
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setIsFlagMode(true)
                      setTimeout(() => commentRef.current?.focus(), 50)
                    }}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-900/60 hover:bg-red-800/80 border border-red-700 text-red-300 font-bold text-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="text-2xl">✗</span> Flag
                    <span className="text-xs font-normal text-red-500 ml-1">(← or H)</span>
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-900/60 hover:bg-green-800/80 border border-green-700 text-green-300 font-bold text-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="text-2xl">✓</span> Approve
                    <span className="text-xs font-normal text-green-600 ml-1">(→ or L)</span>
                  </button>
                </div>
              )}

              {/* Keyboard hint */}
              <p className="text-center text-xs text-gray-600 mt-3">
                ← / H to flag &nbsp;·&nbsp; → / L to approve &nbsp;·&nbsp; ↑ / K &amp; ↓ / J to navigate
              </p>
            </div>
          )}
        </div>

        {/* ── Sidebar: queue list ───────────────────────────────────────────── */}
        <aside className="w-64 border-l border-gray-800 bg-gray-900/50 overflow-y-auto hidden lg:block">
          <div className="p-3 border-b border-gray-800">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Queue</p>
          </div>
          <div className="divide-y divide-gray-800/60">
            {filteredQueue.map((q, idx) => {
              const review = reviews[q.ref]
              return (
                <button
                  key={q.ref}
                  onClick={() => { setCurrentIndex(idx); setIsFlagMode(false); setFlagComment('') }}
                  className={`w-full text-left px-3 py-2.5 transition-colors ${
                    idx === currentIndex ? 'bg-indigo-900/30' : 'hover:bg-gray-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs w-3 ${
                      review?.status === 'approved' ? 'text-green-400' :
                      review?.status === 'flagged'  ? 'text-red-400' : 'text-gray-600'
                    }`}>
                      {review?.status === 'approved' ? '✓' : review?.status === 'flagged' ? '✗' : '○'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 truncate">{q.question_text.slice(0, 45)}…</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        G{q.grade_level} · {q.domain} · D{q.difficulty}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
