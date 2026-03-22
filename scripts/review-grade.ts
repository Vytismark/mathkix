/**
 * review-grade.ts
 * Deep quality review for a specific grade's questions.
 * Includes actual CCSS definitions in the prompt so Claude can judge
 * scope violations precisely rather than by feel.
 *
 * Run: npx tsx scripts/review-grade.ts 1
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local', override: true })

const grade = parseInt(process.argv[2] ?? '1', 10)
if (![1, 2, 3, 4, 5].includes(grade)) {
  console.error('Usage: npx tsx scripts/review-grade.ts <1-5>')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ── Load CCSS definitions for this grade ─────────────────────────────────────

const gradeJson = JSON.parse(fs.readFileSync(`src/data/questions/grade${grade}.json`, 'utf-8'))
const codeDefs: Record<string, { title: string; explanation: string }> = {}
for (const s of gradeJson.standards) {
  codeDefs[s.code] = { title: s.title, explanation: s.explanation }
}

// ── Fetch all grade questions ─────────────────────────────────────────────────

interface QRow {
  ref: string
  source: 'diagnostic' | 'lesson'
  standard_code: string
  difficulty: number
  question_text: string
  question_type: string
  options: { label: string; value: string }[] | null
  correct_answer: string
}

async function fetchQuestions(): Promise<QRow[]> {
  const rows: QRow[] = []

  const { data: diag } = await supabase
    .from('diagnostic_questions')
    .select('id, standard_code, difficulty, question_text, question_type, options, correct_answer')
    .eq('grade_level', grade)

  for (const q of diag ?? []) {
    rows.push({
      ref: `diag:${q.id}`,
      source: 'diagnostic',
      standard_code: q.standard_code,
      difficulty: q.difficulty,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options as { label: string; value: string }[] | null,
      correct_answer: q.correct_answer,
    })
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, standard_code, difficulty, questions')
    .eq('grade_level', grade)
    .eq('is_active', true)

  for (const lesson of lessons ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qs: any[] = lesson.questions as any[]
    qs.forEach((q, idx) => {
      rows.push({
        ref: `lesson:${lesson.id}:${idx}`,
        source: 'lesson',
        standard_code: lesson.standard_code,
        difficulty: lesson.difficulty,
        question_text: q.text,
        question_type: q.type,
        options: q.options ?? null,
        correct_answer: q.correct_answer,
      })
    })
  }

  return rows
}

// ── Review a batch of questions for one standard ──────────────────────────────

const DIFF_LABEL: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

async function reviewBatch(questions: QRow[], code: string): Promise<
  { ref: string; flags: string[]; notes: string }[]
> {
  const def = codeDefs[code]
  if (!def) return []

  const system = `You are a strict K-5 math curriculum auditor reviewing Grade ${grade} questions for standard ${code}.

CCSS Standard: ${code}
Title: ${def.title}
Definition: ${def.explanation}

Difficulty scale:
- Easy (1): direct single-step application, no extra context
- Medium (2): word problem or 2-step, all within code scope
- Hard (3): most complex valid application of THIS code — never goes outside it

Flag codes (only flag genuine problems):
- wrong_answer: the correct_answer is mathematically wrong
- grade_mismatch: content goes outside what the CCSS definition above permits
- weak_distractors: MC options are duplicated, nonsensical, or too obviously wrong
- ambiguous_wording: question has multiple valid interpretations
- ui_mismatch: question_type is wrong (numeric type but answer is not a number, or MC but answer not in options)
- wrong_difficulty: difficulty label clearly doesn't match the question complexity

Key rule: the CCSS definition is the ONLY authority on scope. Do NOT use your intuition about what "feels" like Grade 1 vs Grade 2. If the definition permits it, it is valid.

Return ONLY a JSON array — no markdown, no prose:
[{"ref":"<ref>","flags":[],"notes":""}]
Include every question even if clean (empty flags).`

  const userLines = questions.map(q => {
    let line = `ref: ${q.ref} | type: ${q.question_type} | difficulty: ${DIFF_LABEL[q.difficulty] ?? q.difficulty}\nQ: ${q.question_text}\nAnswer: ${q.correct_answer}`
    if (q.options) line += `\nOptions: ${q.options.map(o => `${o.label}) ${o.value}`).join(' | ')}`
    return line
  }).join('\n\n---\n\n')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system,
      messages: [{ role: 'user', content: `Review these ${questions.length} questions for standard ${code}:\n\n${userLines}` }],
    })

    const text = (response.content[0] as { text: string }).text
    const start = text.indexOf('[')
    const end = text.lastIndexOf(']')
    if (start === -1 || end === -1) return []
    return JSON.parse(text.slice(start, end + 1))
  } catch (err) {
    console.error(`  Error reviewing batch for ${code}:`, err)
    return []
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nDeep review: Grade ${grade} questions\n`)

  const questions = await fetchQuestions()
  console.log(`Loaded ${questions.length} questions across ${Object.keys(codeDefs).length} standards\n`)

  // Group by standard code
  const byCode: Record<string, QRow[]> = {}
  for (const q of questions) {
    if (!byCode[q.standard_code]) byCode[q.standard_code] = []
    byCode[q.standard_code].push(q)
  }

  const flagged: { ref: string; code: string; flags: string[]; notes: string }[] = []
  const codes = Object.keys(byCode).sort()

  for (const code of codes) {
    const batch = byCode[code]
    process.stdout.write(`${code} (${batch.length} questions) ... `)

    const results = await reviewBatch(batch, code)
    const problems = results.filter(r => r.flags && r.flags.length > 0)

    if (problems.length === 0) {
      console.log('all clean')
    } else {
      console.log(`${problems.length} flagged`)
      for (const p of problems) {
        console.log(`  [${p.flags.join(',')}] ${p.ref}`)
        console.log(`    ${p.notes}`)
        flagged.push({ ...p, code })
      }
    }

    await new Promise(r => setTimeout(r, 200))
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n========== SUMMARY ==========')
  console.log(`Total questions: ${questions.length}`)
  console.log(`Flagged: ${flagged.length} (${((flagged.length / questions.length) * 100).toFixed(1)}%)`)

  if (flagged.length > 0) {
    const flagCounts: Record<string, number> = {}
    for (const f of flagged) {
      for (const flag of f.flags) flagCounts[flag] = (flagCounts[flag] ?? 0) + 1
    }
    console.log('\nBy flag type:')
    for (const [flag, count] of Object.entries(flagCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${flag.padEnd(20)} ${count}`)
    }

    fs.writeFileSync(`grade${grade}-review.json`, JSON.stringify(flagged, null, 2))
    console.log(`\nFull details saved to grade${grade}-review.json`)
  }
}

main().catch(console.error)
