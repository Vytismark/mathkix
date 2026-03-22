/**
 * fix-true-mismatches.ts
 * Rewrites the 20 true grade-mismatch questions so they fit within their
 * standard code's CCSS scope. Maintains exact question count per code/difficulty.
 *
 * Run: npx tsx scripts/fix-true-mismatches.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local', override: true })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ─── CCSS code definitions (from grade JSONs) ─────────────────────────────────
const grades = [1, 2, 3, 4, 5].map(g =>
  JSON.parse(fs.readFileSync(`src/data/questions/grade${g}.json`, 'utf-8'))
)
const codeDefs: Record<string, { title: string; explanation: string }> = {}
grades.forEach(g => g.standards.forEach((s: { code: string; title: string; explanation: string }) => {
  codeDefs[s.code] = { title: s.title, explanation: s.explanation }
}))

// ─── Mismatch details ─────────────────────────────────────────────────────────
const details = JSON.parse(fs.readFileSync('mismatch_details.json', 'utf-8'))

// ─── Difficulty labels ────────────────────────────────────────────────────────
const DIFF_LABEL: Record<number, string> = { 1: 'Easy (1 star)', 2: 'Medium (2 stars)', 3: 'Hard (3 stars)' }

// ─── Claude rewrite ───────────────────────────────────────────────────────────
async function rewriteQuestion(
  standardCode: string,
  gradeLevel: number,
  difficulty: number,
  currentQuestion: string,
  currentAnswer: string,
  currentOptions: { label: string; value: string }[] | null,
  currentType: string,
  violationReason: string
): Promise<{
  question_text: string
  question_type: string
  correct_answer: string
  options: { label: string; value: string }[] | null
} | null> {
  const def = codeDefs[standardCode]
  if (!def) return null

  const diffLabel = DIFF_LABEL[difficulty] || 'Medium'

  const system = `You are a US math curriculum expert rewriting questions for a K-5 math app.
The question must strictly conform to its CCSS standard. Return ONLY raw JSON, no markdown.

Standard: ${standardCode}
Title: ${def.title}
CCSS Definition: ${def.explanation}

Difficulty: ${diffLabel}
Grade: ${gradeLevel}

Difficulty rules:
- Easy: direct, single-step, clean numbers, no extra context
- Medium: word problem or 2-step, all within code scope
- Hard: most complex valid application of THIS code — never goes outside it

US context rules:
- Use US units (dollars, feet, inches, pounds, Fahrenheit) unless the standard explicitly requires metric
- Use American names, settings, sports, and everyday objects
- Currency in USD ($) only

Return JSON with these fields:
{
  "question_text": "...",
  "question_type": "numeric" | "multiple_choice",
  "correct_answer": "...",
  "options": [{"label":"...","value":"..."},{"label":"...","value":"..."},{"label":"...","value":"..."},{"label":"...","value":"..."}] or null
}

For numeric: correct_answer must be a number or simple fraction. options must be null.
For multiple_choice: exactly 4 options, exactly one matches correct_answer, distractors are plausible but clearly wrong.`

  const user = `The current question violates its standard scope:

CURRENT QUESTION: ${currentQuestion}
CURRENT ANSWER: ${currentAnswer}
CURRENT TYPE: ${currentType}
CURRENT OPTIONS: ${JSON.stringify(currentOptions)}

WHY IT VIOLATES: ${violationReason}

Rewrite it so it is a valid ${diffLabel} question for standard ${standardCode}.
The new question must test what the CCSS definition above actually requires — nothing more.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system,
      messages: [{ role: 'user', content: user }],
    })
    const text = (response.content[0] as { text: string }).text.trim()
      .replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(text)
  } catch (err) {
    console.error('  Claude error:', err)
    return null
  }
}

// ─── Apply fix to diagnostic_questions ───────────────────────────────────────
async function fixDiagnostic(id: string, fix: {
  question_text: string; question_type: string;
  correct_answer: string; options: { label: string; value: string }[] | null
}) {
  const { error } = await supabase
    .from('diagnostic_questions')
    .update({
      question_text: fix.question_text,
      question_type: fix.question_type,
      correct_answer: fix.correct_answer,
      options: fix.options,
    })
    .eq('id', id)
  if (error) throw error
}

// ─── Apply fix to lessons ─────────────────────────────────────────────────────
async function fixLesson(lessonId: string, idx: number, fix: {
  question_text: string; question_type: string;
  correct_answer: string; options: { label: string; value: string }[] | null
}) {
  const { data: lesson, error: fetchErr } = await supabase
    .from('lessons').select('questions').eq('id', lessonId).single()
  if (fetchErr) throw fetchErr

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions: any[] = lesson.questions as any[]
  questions[idx].text         = fix.question_text
  questions[idx].type         = fix.question_type
  questions[idx].correct_answer = fix.correct_answer
  questions[idx].options      = fix.options ?? undefined

  const { error: updateErr } = await supabase
    .from('lessons').update({ questions }).eq('id', lessonId)
  if (updateErr) throw updateErr
}

// ─── Mark question_reviews as fixed ──────────────────────────────────────────
async function markFixed(ref: string) {
  await supabase
    .from('question_reviews')
    .update({ status: 'approved', comment: '[auto-fixed: rewrote to fit standard scope]' })
    .eq('question_ref', ref)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Fixing ${details.length} true grade-mismatch questions...\n`)

  const results = { fixed: 0, skipped: 0, errors: 0 }
  const log: { ref: string; status: string; newQuestion?: string; error?: string }[] = []

  for (let i = 0; i < details.length; i++) {
    const d = details[i]
    const ref: string = d.ref
    const snap = d.snap
    const cd = d.currentData

    const standardCode: string = snap.standard_code
    const gradeLevel: number   = snap.grade_level
    const difficulty: number   = cd?.difficulty ?? snap.difficulty ?? 2
    const currentQuestion: string = snap.question_text
    const currentAnswer: string   = snap.correct_answer
    const currentOptions          = snap.options ?? null
    const currentType: string     = snap.question_type
    const violationReason: string = d.verdict

    process.stdout.write(`[${i + 1}/${details.length}] ${ref} (${standardCode}) ... `)

    const fix = await rewriteQuestion(
      standardCode, gradeLevel, difficulty,
      currentQuestion, currentAnswer, currentOptions, currentType,
      violationReason
    )

    if (!fix) {
      console.log('SKIP (no fix generated)')
      results.skipped++
      log.push({ ref, status: 'skipped' })
      continue
    }

    try {
      if (ref.startsWith('diag:')) {
        const id = ref.replace('diag:', '')
        await fixDiagnostic(id, fix)
      } else {
        const parts = ref.split(':')
        await fixLesson(parts[1], parseInt(parts[2]), fix)
      }
      await markFixed(ref)
      console.log('FIXED')
      console.log(`  OLD: ${currentQuestion}`)
      console.log(`  NEW: ${fix.question_text}`)
      results.fixed++
      log.push({ ref, status: 'fixed', newQuestion: fix.question_text })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`ERROR: ${msg}`)
      results.errors++
      log.push({ ref, status: 'error', error: msg })
    }

    await new Promise(r => setTimeout(r, 150))
  }

  console.log('\n========== RESULTS ==========')
  console.log('Fixed:  ', results.fixed)
  console.log('Skipped:', results.skipped)
  console.log('Errors: ', results.errors)

  fs.writeFileSync('mismatch-fix-log.json', JSON.stringify(log, null, 2))
  console.log('\nFull log saved to mismatch-fix-log.json')
}

main().catch(console.error)
