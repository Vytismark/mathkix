/**
 * verify-rewrites.ts
 * Third-pass quality verification of all rewritten questions using claude-opus-4-6.
 * Reads fix logs to find rewritten refs, fetches current DB state, and reviews
 * with an enhanced prompt that independently computes answers and flags missing visuals.
 *
 * Run: npx tsx scripts/verify-rewrites.ts
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

// ── Load CCSS definitions for all grades ─────────────────────────────────────

const codeDefs: Record<string, { title: string; explanation: string; grade: number }> = {}
for (const grade of [1, 2, 3, 4, 5]) {
  const gradeJson = JSON.parse(fs.readFileSync(`src/data/questions/grade${grade}.json`, 'utf-8'))
  for (const s of gradeJson.standards) {
    codeDefs[s.code] = { title: s.title, explanation: s.explanation, grade }
  }
}

// ── Collect rewritten refs from fix logs ──────────────────────────────────────

interface RewrittenItem { ref: string; grade: number }

function collectRewrites(): RewrittenItem[] {
  const items: RewrittenItem[] = []
  for (const grade of [1, 2, 3, 4, 5]) {
    const logPath = `grade${grade}-fix-log.json`
    if (!fs.existsSync(logPath)) continue
    const log = JSON.parse(fs.readFileSync(logPath, 'utf-8')) as { ref: string; status: string }[]
    for (const entry of log) {
      if (entry.status === 'rewritten') items.push({ ref: entry.ref, grade })
    }
  }
  return items
}

// ── Fetch current DB state ────────────────────────────────────────────────────

interface QRow {
  ref: string
  grade: number
  standard_code: string
  difficulty: number
  question_text: string
  question_type: string
  options: { label: string; value: string }[] | null
  correct_answer: string
}

async function fetchDiag(id: string, grade: number): Promise<QRow | null> {
  const { data } = await supabase.from('diagnostic_questions')
    .select('standard_code, difficulty, question_text, question_type, options, correct_answer')
    .eq('id', id).single()
  if (!data) return null
  return {
    ref: `diag:${id}`, grade,
    standard_code: data.standard_code,
    difficulty: data.difficulty,
    question_text: data.question_text,
    question_type: data.question_type,
    options: data.options as { label: string; value: string }[] | null,
    correct_answer: data.correct_answer,
  }
}

async function fetchLesson(lessonId: string, idx: number, grade: number): Promise<QRow | null> {
  const { data } = await supabase.from('lessons')
    .select('standard_code, difficulty, questions')
    .eq('id', lessonId).single()
  if (!data) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (data.questions as any[])[idx]
  if (!q) return null
  return {
    ref: `lesson:${lessonId}:${idx}`, grade,
    standard_code: data.standard_code,
    difficulty: data.difficulty,
    question_text: q.text,
    question_type: q.type,
    options: q.options ?? null,
    correct_answer: q.correct_answer,
  }
}

async function fetchQuestion(ref: string, grade: number): Promise<QRow | null> {
  if (ref.startsWith('diag:')) {
    return fetchDiag(ref.replace('diag:', ''), grade)
  }
  const parts = ref.split(':')
  return fetchLesson(parts[1], parseInt(parts[2]), grade)
}

// ── Visual reference detection ────────────────────────────────────────────────

const VISUAL_PATTERNS = [
  'look at the', 'the graph shows', 'the diagram', 'the picture', 'the figure',
  'the chart', 'the table above', 'the table below', 'the line plot', 'shown below',
  'shown above', 'the shape below', 'the number line below', 'the map', 'the image',
  'in the figure', 'in the diagram', 'in the picture', 'use the graph',
  'refer to', 'as shown', 'plotted below',
]

function hasVisualReference(text: string): boolean {
  const lower = text.toLowerCase()
  return VISUAL_PATTERNS.some(p => lower.includes(p))
}

// ── Review batch with Opus ────────────────────────────────────────────────────

const DIFF_LABEL: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

async function reviewBatch(
  questions: QRow[], code: string, grade: number
): Promise<{ ref: string; flags: string[]; notes: string }[]> {
  const def = codeDefs[code]
  if (!def) return []

  const system = `You are an expert K-5 math curriculum auditor verifying Grade ${grade} questions for standard ${code}.

CCSS Standard: ${code}
Title: ${def.title}
Definition: ${def.explanation}

Difficulty scale:
- Easy (1): direct single-step application, clean numbers, no extra context
- Medium (2): word problem or 2-step, all within code scope
- Hard (3): most demanding valid application of THIS code only

CRITICAL INSTRUCTIONS — follow in order for EVERY question:
1. READ the question carefully.
2. SOLVE IT YOURSELF independently — compute the answer step by step.
3. COMPARE your answer to the given correct_answer.
4. CHECK whether the question references any visual that isn't in the text.
5. EVALUATE all flag conditions.

Flag codes (only flag genuine problems):
- wrong_answer: your independent calculation differs from correct_answer
- grade_mismatch: content goes outside what the CCSS definition permits
- weak_distractors: MC options duplicated, nonsensical, or too obviously wrong
- ambiguous_wording: question has multiple valid interpretations
- ui_mismatch: question_type wrong (numeric but answer is text, or MC but answer not in options)
- wrong_difficulty: difficulty label clearly doesn't match complexity
- missing_visual: question text references a diagram, graph, shape, line plot, table, number line, or image that is NOT embedded in the question text — student cannot answer without it

For wrong_answer flags: show your step-by-step computation in notes.
For missing_visual flags: quote the phrase that implies a visual.

Return ONLY a JSON array — no markdown, no prose:
[{"ref":"<ref>","flags":[],"notes":""}]
Include every question even if clean (empty flags, empty notes).`

  const userLines = questions.map(q => {
    let line = `ref: ${q.ref} | type: ${q.question_type} | difficulty: ${DIFF_LABEL[q.difficulty] ?? q.difficulty}\nQ: ${q.question_text}\nAnswer: ${q.correct_answer}`
    if (q.options) line += `\nOptions: ${q.options.map(o => `${o.label}) ${o.value}`).join(' | ')}`
    if (hasVisualReference(q.question_text)) line += `\n[HINT: Check for missing_visual]`
    return line
  }).join('\n\n---\n\n')

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 4000,
        system,
        messages: [{
          role: 'user',
          content: `Verify these ${questions.length} questions for Grade ${grade} standard ${code}. Solve each independently first:\n\n${userLines}`,
        }],
      })

      const text = (response.content[0] as { text: string }).text
      const start = text.indexOf('[')
      const end = text.lastIndexOf(']')
      if (start === -1 || end === -1) {
        if (attempt < 3) { await new Promise(r => setTimeout(r, 1000)); continue }
        return []
      }
      return JSON.parse(text.slice(start, end + 1))
    } catch (err) {
      if (attempt < 3) {
        process.stdout.write(` [retry ${attempt}]`)
        await new Promise(r => setTimeout(r, 1000))
      } else {
        console.error(`\n  Error reviewing batch for ${code} after 3 attempts:`, err)
        return []
      }
    }
  }
  return []
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nVerify rewrites: Third-pass with claude-opus-4-6\n')

  const rewrites = collectRewrites()
  console.log(`Found ${rewrites.length} rewritten questions across all grades\n`)

  // Fetch current DB state for all rewritten questions
  process.stdout.write('Fetching current DB state')
  const questions: QRow[] = []
  for (const item of rewrites) {
    const q = await fetchQuestion(item.ref, item.grade)
    if (q) questions.push(q)
    else console.warn(`\n  NOT FOUND in DB: ${item.ref}`)
    process.stdout.write('.')
    await new Promise(r => setTimeout(r, 60))
  }
  console.log(`\nFetched ${questions.length} / ${rewrites.length} questions\n`)

  // Group by (grade, standard_code) for batching
  const byGradeCode: Record<string, QRow[]> = {}
  for (const q of questions) {
    const key = `${q.grade}:${q.standard_code}`
    if (!byGradeCode[key]) byGradeCode[key] = []
    byGradeCode[key].push(q)
  }

  const flagged: { ref: string; grade: number; code: string; flags: string[]; notes: string }[] = []
  const keys = Object.keys(byGradeCode).sort()

  for (const key of keys) {
    const [gradeStr, ...codeParts] = key.split(':')
    const grade = parseInt(gradeStr)
    const code = codeParts.join(':')
    const batch = byGradeCode[key]
    process.stdout.write(`Grade ${grade} ${code} (${batch.length}) ... `)

    const results = await reviewBatch(batch, code, grade)
    const problems = results.filter(r => r.flags && r.flags.length > 0)

    if (problems.length === 0) {
      console.log('all clean')
    } else {
      console.log(`${problems.length} flagged`)
      for (const p of problems) {
        console.log(`  [${p.flags.join(',')}] ${p.ref}`)
        console.log(`    ${p.notes.substring(0, 120)}`)
        flagged.push({ ...p, grade, code })
      }
    }

    await new Promise(r => setTimeout(r, 300))
  }

  // Summary
  console.log('\n========== SUMMARY ==========')
  console.log(`Total verified: ${questions.length}`)
  console.log(`Flagged: ${flagged.length} (${((flagged.length / questions.length) * 100).toFixed(1)}%)`)

  if (flagged.length > 0) {
    const flagCounts: Record<string, number> = {}
    for (const f of flagged) {
      for (const flag of f.flags) flagCounts[flag] = (flagCounts[flag] ?? 0) + 1
    }
    console.log('\nBy flag type:')
    for (const [flag, count] of Object.entries(flagCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${flag.padEnd(22)} ${count}`)
    }
    fs.writeFileSync('verify-rewrites.json', JSON.stringify(flagged, null, 2))
    console.log('\nFull details saved to verify-rewrites.json')
  } else {
    console.log('\nAll rewritten questions passed verification.')
  }
}

main().catch(console.error)
