/**
 * fix-remaining.mjs
 *
 * 1. Strips unit suffixes (°, m³, cups, minutes) from numeric-ish answers
 * 2. Calls Claude for the truly text-based questions that need MCQ
 */
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SQL_PATH  = path.join(__dirname, '../supabase/migrations/004_seed_curriculum.sql')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const BLOCK_RE = /('(\[(?:\{.*?\}(?:,\{.*?\})*)\])')::jsonb/gs

function extractBlocks(sql) {
  const blocks = []
  let m
  BLOCK_RE.lastIndex = 0
  while ((m = BLOCK_RE.exec(sql)) !== null) {
    try {
      const qs = JSON.parse(m[2])
      blocks.push({ fullMatch: m[0], inner: m[2], qs, offset: m.index })
    } catch {}
  }
  return blocks
}

function isNumericAnswer(a) {
  a = a.trim()
  if (/^-?\d+(\.\d+)?$/.test(a)) return true
  if (/^-?\d+\/\d+$/.test(a)) return true
  if (/^\d+\s*(cm|mm|m|kg|g|lb|oz|in|ft|hr|min|sec|degrees?|cents?|\$|minutes?)?\s*$/i.test(a)) return true
  return false
}

// Degree / unit answers that are really just numbers
function stripToNumeric(answer) {
  const a = answer.trim()
  // "90°" → "90"
  const degMatch = a.match(/^(\d+)\s*°$/)
  if (degMatch) return degMatch[1]
  // "342 m³" → "342"
  const unitMatch = a.match(/^(\d+(?:\.\d+)?)\s*(m³|m²|cm²|cm³|cups?|minutes?)$/i)
  if (unitMatch) return unitMatch[1]
  // "18/8 = 2 1/4 cups" - too complex, leave it
  return null
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildPrompt(questions) {
  const items = questions.map((q, i) =>
    `${i + 1}. Question: "${q.text}"\n   Correct answer: "${q.correct_answer}"`
  ).join('\n\n')

  return `You are helping build a K-5 math learning app. For each question below, generate exactly 3 WRONG but plausible distractor answers. The correct answer is already given. Each distractor must:
- Be clearly wrong
- Be age-appropriate and plausible
- Be roughly the same length/style as the correct answer

Respond with ONLY a JSON array. Each element: {"distractors":["wrong1","wrong2","wrong3"]}. No markdown, no explanation.

Questions:
${items}`
}

async function main() {
  let sql = fs.readFileSync(SQL_PATH, 'utf8')
  const blocks = extractBlocks(sql)

  const textQuestions = []  // need MCQ via Claude

  for (let b = 0; b < blocks.length; b++) {
    for (let q = 0; q < blocks[b].qs.length; q++) {
      const question = blocks[b].qs[q]
      if (question.type !== 'numeric') continue
      if (isNumericAnswer(question.correct_answer ?? '')) continue

      // Try to strip units → keep numeric
      const stripped = stripToNumeric(question.correct_answer ?? '')
      if (stripped) {
        blocks[b].qs[q].correct_answer = stripped
        console.log(`  Stripped: "${question.correct_answer}" → "${stripped}"`)
        continue
      }

      textQuestions.push({ blockIdx: b, qIdx: q, question })
    }
  }

  console.log(`\n${textQuestions.length} truly text-based questions. Calling Claude…\n`)

  if (textQuestions.length > 0) {
    const allQs = textQuestions.map(t => t.question)
    try {
      const resp = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8192,
        messages: [{ role: 'user', content: buildPrompt(allQs) }],
      })
      const raw = resp.content[0].type === 'text' ? resp.content[0].text : ''
      const clean = raw.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '').trim()
      const parsed = JSON.parse(clean)

      let fixed = 0
      for (let i = 0; i < textQuestions.length; i++) {
        const { blockIdx, qIdx } = textQuestions[i]
        const d = parsed[i]?.distractors
        if (!d || d.length < 3) {
          console.warn(`  ⚠ No distractors for: ${allQs[i].text.slice(0, 50)}`)
          continue
        }
        const correct = allQs[i].correct_answer
        const options = shuffle([correct, ...d.slice(0, 3)]).map(v => ({ label: v, value: v }))
        blocks[blockIdx].qs[qIdx].type = 'multiple_choice'
        blocks[blockIdx].qs[qIdx].options = options
        fixed++
      }
      console.log(`Fixed ${fixed}/${textQuestions.length} text questions`)
    } catch (err) {
      console.error('Claude call failed:', err.message)
    }
  }

  // Rebuild SQL
  for (let b = blocks.length - 1; b >= 0; b--) {
    const block = blocks[b]
    const newJson = JSON.stringify(block.qs, null, 0)
    const newFull = `'${newJson}'::jsonb`
    sql = sql.slice(0, block.offset) + newFull + sql.slice(block.offset + block.fullMatch.length)
  }

  fs.writeFileSync(SQL_PATH, sql, 'utf8')
  console.log('\nSQL updated.')
}

main().catch(err => { console.error(err); process.exit(1) })
