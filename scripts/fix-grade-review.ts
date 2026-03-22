/**
 * fix-grade-review.ts
 * Fixes all issues found by review-grade.ts for a given grade.
 * - wrong_difficulty on diag: updates difficulty field only
 * - grade_mismatch / ui_mismatch / weak_distractors / ambiguous_wording: rewrites with Claude
 * - wrong_difficulty on lessons: rewrites question to match lesson's stated difficulty
 *
 * Run: npx tsx scripts/fix-grade-review.ts 1
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local', override: true })

const grade = parseInt(process.argv[2] ?? '1', 10)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ── Load CCSS definitions ─────────────────────────────────────────────────────
const gradeJson = JSON.parse(fs.readFileSync(`src/data/questions/grade${grade}.json`, 'utf-8'))
const codeDefs: Record<string, { title: string; explanation: string }> = {}
for (const s of gradeJson.standards) codeDefs[s.code] = { title: s.title, explanation: s.explanation }

const DIFF_LABEL: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

// ── Items that are actually fine — skip them ──────────────────────────────────
const SKIP_REFS = new Set([
  'diag:04f25f19-1006-43a7-b1b0-20fea963033e',     // reviewer self-corrected: 3,450 is correct
  'diag:0018ce98-990c-426a-898a-73cff11160a2',      // reviewer self-corrected: 8.4 is correct
  'diag:0bb1cd33-2620-470c-b480-aa9aa157512b',      // reviewer self-corrected: 107.16 is correct
  'diag:f03a2270-4500-4b87-b6b2-e6cafa89ec3e',      // reviewer: 4.751 is mathematically correct
  'diag:6afd304c-e1bc-4201-8046-8c68a5a6cdb1',      // formatting only: 69104 is numerically correct
  'diag:1984d65e-255d-4aa0-a843-e3f622511027',      // formatting only: 406463 is numerically correct
  'diag:4ffe86e7-11ea-4a8b-a117-68b0a37f6aaf',      // reviewer: "Could be Hard" — borderline, keep
  'lesson:c56b57b5-0d9b-4cc4-a7a2-417479522c18:3', // reviewer: Hard label is acceptable
  'lesson:cace74b2-08b8-49f5-b161-7576e6fa5469:2', // reviewer: Hard difficulty is appropriate, content valid
])

// ── Diag questions where only difficulty label is wrong (content is fine) ─────
const DIAG_DIFF_UPDATES: Record<string, number> = {
  'diag:5a8cff26-c89a-40b8-ac24-71c52b5c8c8a': 2, // 5.MD.3: Hard → Medium
  'diag:0896d3a5-36e1-4e48-a052-0ac9658eda1a': 2, // 5.NBT.3: Hard → Medium
}

// ── Claude rewrite ────────────────────────────────────────────────────────────
async function rewrite(
  code: string,
  difficulty: number,
  currentQuestion: string,
  currentAnswer: string,
  currentType: string,
  currentOptions: { label: string; value: string }[] | null,
  reason: string,
  flags: string[]
): Promise<{ question_text: string; question_type: string; correct_answer: string; options: { label: string; value: string }[] | null } | null> {
  const def = codeDefs[code]
  if (!def) return null

  const diffLabel = DIFF_LABEL[difficulty] ?? 'Medium'

  const system = `You are a US K-5 math curriculum expert rewriting Grade ${grade} questions.
Return ONLY raw JSON, no markdown.

Standard: ${code}
Title: ${def.title}
CCSS Definition: ${def.explanation}

Target difficulty: ${diffLabel} (${difficulty}/3)
Difficulty rules:
- Easy (1): direct single-step, clean numbers, no extra context
- Medium (2): word problem or 2-step, all within code scope
- Hard (3): most demanding valid application of THIS code only — never exceeds it

US context: use dollars, feet/inches, pounds, Fahrenheit, American names and settings. No metric unless CCSS requires it.

Return JSON:
{
  "question_text": "...",
  "question_type": "numeric" | "multiple_choice",
  "correct_answer": "...",
  "options": [{"label":"A","value":"..."},{"label":"B","value":"..."},{"label":"C","value":"..."},{"label":"D","value":"..."}] or null
}

For numeric: correct_answer must be a plain number. options must be null.
For multiple_choice: exactly 4 options, exactly one matching correct_answer, distractors plausible but clearly wrong.`

  const user = `The current question has this problem: ${flags.join(', ')}
Reason: ${reason}

CURRENT QUESTION: ${currentQuestion}
CURRENT ANSWER: ${currentAnswer}
CURRENT TYPE: ${currentType}
CURRENT OPTIONS: ${JSON.stringify(currentOptions)}

Rewrite it as a valid ${diffLabel} question for standard ${code}.
The new question must ONLY test what the CCSS definition above describes.`

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

// ── Apply fix to diagnostic_questions ─────────────────────────────────────────
async function fixDiag(id: string, fields: Record<string, unknown>) {
  const { error } = await supabase.from('diagnostic_questions').update(fields).eq('id', id)
  if (error) throw error
}

// ── Apply fix to lesson question ──────────────────────────────────────────────
async function fixLesson(lessonId: string, idx: number, fix: {
  question_text: string; question_type: string; correct_answer: string
  options: { label: string; value: string }[] | null
}) {
  const { data: lesson, error: fetchErr } = await supabase.from('lessons').select('questions').eq('id', lessonId).single()
  if (fetchErr) throw fetchErr
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions: any[] = lesson.questions as any[]
  questions[idx].text = fix.question_text
  questions[idx].type = fix.question_type
  questions[idx].correct_answer = fix.correct_answer
  questions[idx].options = fix.options ?? undefined
  const { error } = await supabase.from('lessons').update({ questions }).eq('id', lessonId)
  if (error) throw error
}

// ── Fetch current question data ───────────────────────────────────────────────
async function getCurrentDiag(id: string) {
  const { data } = await supabase.from('diagnostic_questions')
    .select('question_text, question_type, correct_answer, options, difficulty').eq('id', id).single()
  return data
}

async function getCurrentLesson(lessonId: string, idx: number) {
  const { data } = await supabase.from('lessons').select('difficulty, questions').eq('id', lessonId).single()
  if (!data) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (data.questions as any[])[idx]
  return { ...q, lessonDifficulty: data.difficulty }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const items = JSON.parse(fs.readFileSync(`grade${grade}-review.json`, 'utf-8')) as {
    ref: string; flags: string[]; notes: string; code: string
  }[]

  console.log(`\nFixing ${items.length} flagged Grade ${grade} questions...\n`)

  const results = { difficulty_updated: 0, rewritten: 0, skipped: 0, errors: 0 }
  const log: { ref: string; status: string; detail?: string }[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const { ref, flags, notes, code } = item
    process.stdout.write(`[${i + 1}/${items.length}] ${ref} [${flags.join(',')}] ... `)

    // Skip items that are actually fine
    if (SKIP_REFS.has(ref)) {
      console.log('SKIP (false positive)')
      results.skipped++
      log.push({ ref, status: 'skipped', detail: 'false positive' })
      continue
    }

    const isDiag = ref.startsWith('diag:')
    const diagId = isDiag ? ref.replace('diag:', '') : ''
    const lessonParts = !isDiag ? ref.split(':') : []
    const lessonId = lessonParts[1] ?? ''
    const lessonIdx = lessonParts[2] !== undefined ? parseInt(lessonParts[2]) : -1

    try {
      // ── Case 1: diag difficulty-only fix ───────────────────────────────────
      if (isDiag && DIAG_DIFF_UPDATES[ref] !== undefined) {
        const newDiff = DIAG_DIFF_UPDATES[ref]
        await fixDiag(diagId, { difficulty: newDiff })
        console.log(`DIFFICULTY → ${newDiff}`)
        results.difficulty_updated++
        log.push({ ref, status: 'difficulty_updated', detail: `→ ${newDiff}` })
        await new Promise(r => setTimeout(r, 80))
        continue
      }

      // ── Case 2: Rewrite needed ─────────────────────────────────────────────
      let currentQuestion: string, currentAnswer: string, currentType: string
      let currentOptions: { label: string; value: string }[] | null
      let difficulty: number

      if (isDiag) {
        const d = await getCurrentDiag(diagId)
        if (!d) throw new Error('not found')
        currentQuestion = d.question_text
        currentAnswer = d.correct_answer
        currentType = d.question_type
        currentOptions = d.options as { label: string; value: string }[] | null
        difficulty = d.difficulty
      } else {
        const d = await getCurrentLesson(lessonId, lessonIdx)
        if (!d) throw new Error('not found')
        currentQuestion = d.text
        currentAnswer = d.correct_answer
        currentType = d.type
        currentOptions = d.options ?? null
        difficulty = d.lessonDifficulty // rewrite to match lesson's stated difficulty
      }

      const fix = await rewrite(code, difficulty, currentQuestion, currentAnswer, currentType, currentOptions, notes, flags)
      if (!fix) {
        console.log('SKIP (no fix generated)')
        results.skipped++
        log.push({ ref, status: 'skipped', detail: 'Claude returned null' })
        continue
      }

      if (isDiag) {
        await fixDiag(diagId, {
          question_text: fix.question_text,
          question_type: fix.question_type,
          correct_answer: fix.correct_answer,
          options: fix.options,
        })
      } else {
        await fixLesson(lessonId, lessonIdx, fix)
      }

      console.log('REWRITTEN')
      console.log(`  OLD: ${currentQuestion}`)
      console.log(`  NEW: ${fix.question_text}`)
      results.rewritten++
      log.push({ ref, status: 'rewritten', detail: fix.question_text })

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`ERROR: ${msg}`)
      results.errors++
      log.push({ ref, status: 'error', detail: msg })
    }

    await new Promise(r => setTimeout(r, 150))
  }

  console.log('\n========== RESULTS ==========')
  console.log('Difficulty updated:', results.difficulty_updated)
  console.log('Rewritten:         ', results.rewritten)
  console.log('Skipped:           ', results.skipped)
  console.log('Errors:            ', results.errors)

  fs.writeFileSync(`grade${grade}-fix-log.json`, JSON.stringify(log, null, 2))
  console.log(`\nFull log saved to grade${grade}-fix-log.json`)
}

main().catch(console.error)
