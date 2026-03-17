/**
 * gen-mcq-options.mjs
 *
 * Reads 004_seed_curriculum.sql, finds every lesson question whose type is
 * "numeric" but whose correct_answer is non-numeric, then calls Claude to
 * generate 3 wrong-but-plausible distractors so the question becomes proper
 * multiple_choice.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/gen-mcq-options.mjs
 *
 * The script writes the patched SQL back to the same file and also writes a
 * JSON report to scripts/gen-mcq-report.json so you can audit every change.
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SQL_PATH  = path.join(__dirname, '../supabase/migrations/004_seed_curriculum.sql')
const REPORT_PATH = path.join(__dirname, 'gen-mcq-report.json')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Helpers ──────────────────────────────────────────────────────────────────

function isNumericAnswer(answer) {
  const a = answer.trim()
  if (/^-?\d+(\.\d+)?$/.test(a)) return true            // plain number
  if (/^-?\d+\/\d+$/.test(a)) return true               // plain fraction like 3/4
  if (/^\d+\s*(cm|mm|m|kg|g|lb|oz|in|ft|hr|min|sec|°|degrees?|cents?|\$)?\s*$/i.test(a)) return true
  return false
}

function sanitiseJson(raw) {
  // Claude sometimes wraps JSON in ```json ... ``` blocks
  return raw.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '').trim()
}

// ── Parse SQL → extract (matchText, parsedQuestions, rawJsonStr) ──────────

const BLOCK_RE = /('(\[(?:\{.*?\}(?:,\{.*?\})*)\])')::jsonb/gs

function extractBlocks(sql) {
  const blocks = []
  let m
  BLOCK_RE.lastIndex = 0
  while ((m = BLOCK_RE.exec(sql)) !== null) {
    const fullMatch = m[0]     // '[ ... ]'::jsonb
    const quoted    = m[1]     // '[...]'  (with surrounding single quotes)
    const inner     = m[2]     // [...] raw JSON
    try {
      const qs = JSON.parse(inner)
      blocks.push({ fullMatch, inner, qs, offset: m.index })
    } catch { /* skip unparseable */ }
  }
  return blocks
}

// ── Build Claude prompt ───────────────────────────────────────────────────

function buildPrompt(questions) {
  const items = questions.map((q, i) =>
    `${i + 1}. Question: "${q.text}"\n   Correct answer: "${q.correct_answer}"`
  ).join('\n\n')

  return `You are helping build a K-5 math learning app. For each question below, generate exactly 3 WRONG but plausible distractor answers. The correct answer is already given. Each distractor must:
- Be clearly wrong (not the correct answer or a restatement of it)
- Be age-appropriate and plausible (not absurd)
- Be roughly the same length/style as the correct answer
- Use the same format (shape names, numbers, comparisons, etc.)

Respond with ONLY a JSON array. Each element is an object with key "distractors" containing an array of exactly 3 strings. Do NOT include any explanation or markdown.

Questions:
${items}

Example response format:
[{"distractors":["wrong1","wrong2","wrong3"]},{"distractors":["wrong1","wrong2","wrong3"]}]`
}

// ── Call Claude in batches ────────────────────────────────────────────────

const BATCH_SIZE = 20
const DELAY_MS   = 500

async function generateDistractors(questions) {
  const results = []

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE)
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questions.length / BATCH_SIZE)} (${batch.length} questions)…`)

    let raw = ''
    try {
      const resp = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: buildPrompt(batch) }],
      })
      raw = resp.content[0].type === 'text' ? resp.content[0].text : ''
      const parsed = JSON.parse(sanitiseJson(raw))
      for (let j = 0; j < batch.length; j++) {
        results.push({
          question: batch[j],
          distractors: parsed[j]?.distractors ?? [],
        })
      }
    } catch (err) {
      console.error('    ⚠ Batch failed:', err.message, '\n    Raw:', raw.slice(0, 200))
      // Push empties so indices don't drift
      for (const q of batch) results.push({ question: q, distractors: [] })
    }

    if (i + BATCH_SIZE < questions.length) {
      await new Promise(r => setTimeout(r, DELAY_MS))
    }
  }

  return results
}

// ── Shuffle helper (Fisher-Yates) ─────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('Reading SQL…')
  let sql = fs.readFileSync(SQL_PATH, 'utf8')

  const blocks = extractBlocks(sql)
  console.log(`Found ${blocks.length} question-array blocks.`)

  // Collect all questions that need fixing, with block+index references
  const toFix = []   // { blockIdx, qIdx, question }
  for (let b = 0; b < blocks.length; b++) {
    for (let q = 0; q < blocks[b].qs.length; q++) {
      const question = blocks[b].qs[q]
      if (question.type === 'numeric' && !isNumericAnswer(question.correct_answer ?? '')) {
        toFix.push({ blockIdx: b, qIdx: q, question })
      }
    }
  }

  console.log(`${toFix.length} questions need MCQ options. Calling Claude…`)

  const distResults = await generateDistractors(toFix.map(f => f.question))

  // Apply results back into blocks
  const report = []
  let fixed = 0, skipped = 0

  for (let i = 0; i < toFix.length; i++) {
    const { blockIdx, qIdx }  = toFix[i]
    const { question, distractors } = distResults[i]

    if (!distractors || distractors.length < 3) {
      console.warn(`  ⚠ Skipping "${question.text.slice(0, 50)}" - no distractors returned`)
      skipped++
      continue
    }

    const correct = question.correct_answer
    // Build shuffled option list: correct + 3 distractors, shuffle positions
    const allOptions = shuffle([correct, ...distractors.slice(0, 3)])
    const options = allOptions.map(v => ({ label: v, value: v }))

    blocks[blockIdx].qs[qIdx].type    = 'multiple_choice'
    blocks[blockIdx].qs[qIdx].options = options

    report.push({ standard_code: question.standard_code, text: question.text, correct, distractors, options })
    fixed++
  }

  console.log(`\nFixed: ${fixed}  Skipped: ${skipped}`)

  // Rebuild SQL by replacing each block's JSON
  // Work from last to first so offsets stay valid
  for (let b = blocks.length - 1; b >= 0; b--) {
    const block   = blocks[b]
    const newJson = JSON.stringify(block.qs, null, 0)  // compact
    const newFull = `'${newJson}'::jsonb`
    sql = sql.slice(0, block.offset) + newFull + sql.slice(block.offset + block.fullMatch.length)
  }

  fs.writeFileSync(SQL_PATH, sql, 'utf8')
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8')
  console.log(`\nSQL written to: ${SQL_PATH}`)
  console.log(`Report written to: ${REPORT_PATH}`)
}

main().catch(err => { console.error(err); process.exit(1) })
