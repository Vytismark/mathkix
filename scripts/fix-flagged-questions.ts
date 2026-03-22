/**
 * fix-flagged-questions.ts
 * Reads all human-flagged questions from question_reviews, uses Claude to apply
 * fixes, then updates the source records in diagnostic_questions / lessons.
 *
 * Run: npx tsx scripts/fix-flagged-questions.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local', override: true })

// Clients initialized after dotenv so env vars are available
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Pass key explicitly; also honour ANTHROPIC_API_KEY env fallback in SDK
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1) }
const anthropic = new Anthropic({ apiKey })

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionSnapshot {
  ref: string
  source: 'diagnostic' | 'lesson'
  question_text: string
  question_type: string
  options: { label: string; value: string }[] | null
  correct_answer: string
  grade_level: number
  domain: string
  standard_code: string | null
  difficulty: number
  lesson_id?: string
  question_index?: number
  lesson_title?: string
  visual_asset?: string | null
}

interface FlaggedReview {
  id: string
  question_ref: string
  question_source: string
  question_snapshot: QuestionSnapshot
  status: string
  comment: string | null
  suggested_fix: string | null
  ai_flags: string[]
}

interface QuestionFix {
  question_text?: string
  question_type?: string
  options?: { label: string; value: string }[] | null
  correct_answer?: string
}

// ─── Claude fix helper ────────────────────────────────────────────────────────

async function fixWithClaude(review: FlaggedReview): Promise<QuestionFix | null> {
  const snap = review.question_snapshot
  const flagCategory = (review.ai_flags ?? [])[0] ?? 'unknown'

  const systemPrompt = `You are a math curriculum editor fixing questions for a K-5 math app.
Return ONLY a valid JSON object with the fixed fields. No explanation, no markdown, just raw JSON.
Fields you may return (only include fields that change):
- question_text (string)
- question_type ("numeric" | "multiple_choice")
- correct_answer (string)
- options (array of {label, value} objects, or null for numeric)

Rules:
- numeric questions must have a numeric correct_answer (a number or simple fraction like "1/2")
- multiple_choice questions must have exactly 4 options, exactly one matching correct_answer
- Distractors must be plausible but clearly wrong; never duplicate the correct answer
- Language appropriate for grade ${snap.grade_level}
- Standard: ${snap.standard_code ?? snap.domain}`

  const userPrompt = `Fix this question based on the flag below.

QUESTION:
type: ${snap.question_type}
text: ${snap.question_text}
correct_answer: ${snap.correct_answer}
options: ${JSON.stringify(snap.options)}

FLAG CATEGORY: ${flagCategory}
REVIEWER COMMENT: ${review.comment}
SUGGESTED FIX: ${review.suggested_fix ?? 'none'}

Return only the changed fields as JSON.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = (response.content[0] as { type: string; text: string }).text.trim()
    // Strip any accidental markdown fences
    const cleaned = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(cleaned) as QuestionFix
  } catch (err) {
    console.error(`  Claude error for ${review.question_ref}:`, err)
    return null
  }
}

// ─── Apply fix to diagnostic_questions ────────────────────────────────────────

async function fixDiagnostic(diagId: string, fix: QuestionFix) {
  const update: Record<string, unknown> = {}
  if (fix.question_text !== undefined) update.question_text = fix.question_text
  if (fix.question_type !== undefined) update.question_type = fix.question_type
  if (fix.correct_answer !== undefined) update.correct_answer = fix.correct_answer
  if (fix.options !== undefined) update.options = fix.options

  const { error } = await supabase
    .from('diagnostic_questions')
    .update(update)
    .eq('id', diagId)
  if (error) throw error
}

// ─── Apply fix to lessons (update question at index) ─────────────────────────

async function fixLesson(lessonId: string, idx: number, fix: QuestionFix) {
  const { data: lesson, error: fetchErr } = await supabase
    .from('lessons')
    .select('questions')
    .eq('id', lessonId)
    .single()
  if (fetchErr) throw fetchErr

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions: any[] = lesson.questions as any[]
  if (!questions[idx]) throw new Error(`Question index ${idx} not found in lesson ${lessonId}`)

  if (fix.question_text !== undefined) questions[idx].text = fix.question_text
  if (fix.question_type !== undefined) questions[idx].type = fix.question_type
  if (fix.correct_answer !== undefined) questions[idx].correct_answer = fix.correct_answer
  if (fix.options !== undefined) questions[idx].options = fix.options

  const { error: updateErr } = await supabase
    .from('lessons')
    .update({ questions })
    .eq('id', lessonId)
  if (updateErr) throw updateErr
}

// ─── Mark review as fixed ─────────────────────────────────────────────────────

async function markFixed(questionRef: string) {
  await supabase
    .from('question_reviews')
    .update({ status: 'approved', comment: '[auto-fixed by script]' })
    .eq('question_ref', questionRef)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching all human-flagged questions...')
  const { data: reviews, error } = await supabase
    .from('question_reviews')
    .select('*')
    .eq('status', 'flagged')
    .eq('is_ai_review', false)
    .order('reviewed_at', { ascending: true })

  if (error) { console.error(error); process.exit(1) }

  const flagged = reviews as FlaggedReview[]
  console.log(`Found ${flagged.length} flagged questions.\n`)

  // Skip grade_mismatch — these require curriculum decisions (log separately)
  const fixable = flagged.filter(r => !(r.ai_flags ?? []).includes('grade_mismatch'))
  const gradeMismatch = flagged.filter(r => (r.ai_flags ?? []).includes('grade_mismatch'))

  const results = { fixed: 0, skipped: 0, errors: 0 }
  const errorLog: { ref: string; reason: string }[] = []

  for (let i = 0; i < fixable.length; i++) {
    const review = fixable[i]
    const snap = review.question_snapshot
    process.stdout.write(`[${i + 1}/${fixable.length}] ${review.question_ref} (${(review.ai_flags ?? []).join(',')}) ... `)

    const fix = await fixWithClaude(review)
    if (!fix || Object.keys(fix).length === 0) {
      console.log('SKIP (no fix generated)')
      results.skipped++
      continue
    }

    try {
      if (review.question_source === 'diagnostic') {
        const diagId = review.question_ref.replace('diag:', '')
        await fixDiagnostic(diagId, fix)
      } else {
        // lesson:{lessonId}:{idx}
        const parts = review.question_ref.split(':')
        const lessonId = parts[1]
        const idx = parseInt(parts[2], 10)
        await fixLesson(lessonId, idx, fix)
      }
      await markFixed(review.question_ref)
      console.log('FIXED')
      results.fixed++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`ERROR: ${msg}`)
      errorLog.push({ ref: review.question_ref, reason: msg })
      results.errors++
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 120))
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n========== RESULTS ==========')
  console.log(`Fixed:         ${results.fixed}`)
  console.log(`Skipped:       ${results.skipped}`)
  console.log(`Errors:        ${results.errors}`)
  console.log(`Grade mismatch (manual review needed): ${gradeMismatch.length}`)

  if (gradeMismatch.length > 0) {
    console.log('\nGrade mismatch questions (need manual curriculum decision):')
    gradeMismatch.forEach(r => {
      console.log(`  ${r.question_ref} — ${r.comment}`)
    })
  }

  if (errorLog.length > 0) {
    fs.writeFileSync('fix-errors.json', JSON.stringify(errorLog, null, 2))
    console.log('\nError details saved to fix-errors.json')
  }

  // ─── Flag trend analysis: count unfixed similar questions ─────────────────
  console.log('\n========== TREND ANALYSIS: SIMILAR UNFIXED QUESTIONS ==========')
  await analyzeTrends(flagged)
}

// ─── Trend analysis ────────────────────────────────────────────────────────────

async function analyzeTrends(flagged: FlaggedReview[]) {
  // Collect all approved/ai_clean questions to scan for the same patterns
  const { data: allReviews } = await supabase
    .from('question_reviews')
    .select('question_ref, status, ai_flags, question_snapshot')

  const reviewedRefs = new Set((allReviews ?? []).map(r => r.question_ref))

  // Pattern 1: ui_mismatch — numeric questions with non-numeric answers in DB
  const { data: diagAll } = await supabase
    .from('diagnostic_questions')
    .select('id, question_type, correct_answer')

  let uiMismatchUnreviewed = 0
  for (const q of diagAll ?? []) {
    const ref = `diag:${q.id}`
    if (reviewedRefs.has(ref)) continue
    if (q.question_type === 'numeric' && isNaN(parseFloat(q.correct_answer))) {
      uiMismatchUnreviewed++
    }
  }

  // Pattern 2: Scan lesson questions for ui_mismatch
  const { data: lessonsAll } = await supabase
    .from('lessons')
    .select('id, questions')
    .eq('is_active', true)

  let lessonUiMismatch = 0
  let lessonDuplicateOptions = 0
  for (const lesson of lessonsAll ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qs: any[] = (lesson.questions as any[]) ?? []
    qs.forEach((q, idx) => {
      const ref = `lesson:${lesson.id}:${idx}`
      if (reviewedRefs.has(ref)) return
      // ui_mismatch: numeric type but text answer
      if (q.type === 'numeric' && q.correct_answer && isNaN(parseFloat(q.correct_answer))) {
        lessonUiMismatch++
      }
      // weak_distractors: duplicate options
      if (q.options && Array.isArray(q.options)) {
        const labels = q.options.map((o: { label: string }) => o.label)
        const unique = new Set(labels)
        if (unique.size < labels.length) lessonDuplicateOptions++
        // correct answer appears more than once in options
        const matchCount = labels.filter((l: string) => l === q.correct_answer).length
        if (matchCount > 1) lessonDuplicateOptions++
      }
    })
  }

  console.log(`Unreviewed diagnostic questions with ui_mismatch pattern: ${uiMismatchUnreviewed}`)
  console.log(`Unreviewed lesson questions with ui_mismatch pattern:      ${lessonUiMismatch}`)
  console.log(`Unreviewed lesson questions with duplicate options:         ${lessonDuplicateOptions}`)

  const trendTotal = uiMismatchUnreviewed + lessonUiMismatch + lessonDuplicateOptions
  fs.writeFileSync('trend-analysis.json', JSON.stringify({
    unreviewed_ui_mismatch_diagnostic: uiMismatchUnreviewed,
    unreviewed_ui_mismatch_lesson: lessonUiMismatch,
    unreviewed_duplicate_options_lesson: lessonDuplicateOptions,
    total_likely_similar_issues: trendTotal,
  }, null, 2))

  console.log(`\nTotal estimated similar unreviewed questions: ${trendTotal}`)
  console.log('Trend data saved to trend-analysis.json')
}

main().catch(console.error)
