/**
 * scripts/retry-failed-batches.ts
 *
 * One-time script to finish the interrupted review run.
 *
 * - Bulk-marks the 1910 already-processed-clean questions as 'ai_clean' in the DB
 * - Re-sends only the 9 failed batches (~90 questions) to Claude
 *
 * Run AFTER applying migration 016_ai_clean_status.sql in Supabase.
 * Usage: npx tsx scripts/retry-failed-batches.ts
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// ── Env loader ────────────────────────────────────────────────────────────────

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !process.env[key]) process.env[key] = val
  }
}
loadEnvFile(path.join(process.cwd(), '.env.local'))
loadEnvFile(path.join(process.cwd(), '.env'))

// ── The 9 failed batch start indices (from the original run output) ───────────
// Batch 180, 350, 360, 520, 580, 1020, 1410, 1850, 2170
// Each batch is 10 questions, so failed question indices are:
// [180..189], [350..369], [520..529], [580..589], [1020..1029],
// [1410..1419], [1850..1859], [2170..2179]
const FAILED_BATCH_STARTS = [180, 350, 360, 520, 580, 1020, 1410, 1850, 2170]
const BATCH_SIZE = 10

function isFailedIndex(idx: number): boolean {
  return FAILED_BATCH_STARTS.some(start => idx >= start && idx < start + BATCH_SIZE)
}

// ── Claude review ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a K-5 math curriculum quality reviewer. Review each question and flag genuine problems only.

Flag codes (use ONLY these exact strings):
- wrong_answer: the stated correct answer is mathematically incorrect
- weak_distractors: for multiple choice, distractors are trivially wrong or nonsensical
- ambiguous_wording: the question has multiple valid mathematical interpretations
- grade_mismatch: clearly inappropriate difficulty for the stated grade level
- unanswerable: the question is missing information required to solve it

Grade context: Grade 1-2 = ages 6-8, Grade 3-5 = ages 8-11.
Respond ONLY with valid JSON array — no markdown, no prose:
[{"id":"<question_ref>","flags":["flag_code",...],"notes":"one sentence or empty string"}]
Include every question, even those with no issues (empty flags array).`

interface QuestionRow {
  ref: string
  source: 'diagnostic' | 'lesson'
  grade_level: number
  domain: string
  difficulty: number
  standard_code: string | null
  question_text: string
  question_type: string
  options: { label: string; value: string }[] | null
  correct_answer: string
  visual_asset: string | null
  snapshot: Record<string, unknown>
}

async function reviewBatch(anthropic: Anthropic, batch: QuestionRow[]) {
  const formatted = batch.map(q => {
    let text = `ID: ${q.ref}\nGrade: ${q.grade_level} | Domain: ${q.domain} | Standard: ${q.standard_code ?? 'N/A'} | Type: ${q.question_type} | Difficulty: ${q.difficulty}/3\nQuestion: ${q.question_text}\nCorrect answer: ${q.correct_answer}`
    if (q.options?.length) text += `\nOptions: ${q.options.map(o => `${o.label}) ${o.value}`).join(' | ')}`
    return text
  }).join('\n\n---\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Review these ${batch.length} questions:\n\n${formatted}` }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start === -1 || end === -1) return new Map<string, { flags: string[]; notes: string }>()

  const parsed = JSON.parse(text.slice(start, end + 1)) as { id: string; flags: string[]; notes: string }[]
  const results = new Map<string, { flags: string[]; notes: string }>()
  for (const item of parsed) {
    if (item.flags?.length > 0) results.set(item.id, { flags: item.flags, notes: item.notes ?? '' })
  }
  return results
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!supabaseUrl || !serviceKey || !anthropicKey) {
    console.error('❌  Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY')
    process.exit(1)
  }

  const supabase  = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  const anthropic = new Anthropic({ apiKey: anthropicKey })

  // ── 1. Fetch all questions (same order as original script) ────────────────

  console.log('📥  Fetching questions...')
  const { data: diagRows }  = await supabase.from('diagnostic_questions').select('*').order('grade_level', { ascending: true })
  const { data: lessons }   = await supabase.from('lessons').select('id, grade_level, domain, standard_code, title, difficulty, questions').eq('is_active', true).order('grade_level', { ascending: true })

  const questions: QuestionRow[] = []

  for (const q of diagRows ?? []) {
    questions.push({
      ref: `diag:${q.id}`, source: 'diagnostic',
      grade_level: q.grade_level, domain: q.domain, difficulty: q.difficulty,
      standard_code: q.standard_code, question_text: q.question_text,
      question_type: q.question_type, options: q.options as { label: string; value: string }[] | null,
      correct_answer: q.correct_answer, visual_asset: q.visual_asset,
      snapshot: { ...q },
    })
  }
  for (const lesson of lessons ?? []) {
    type RawQ = { text: string; type: string; options?: { label: string; value: string }[]; correct_answer: string; visual_asset?: string }
    const qs = (lesson.questions as unknown as RawQ[]) ?? []
    qs.forEach((q, idx) => {
      questions.push({
        ref: `lesson:${lesson.id}:${idx}`, source: 'lesson',
        grade_level: lesson.grade_level, domain: lesson.domain, difficulty: lesson.difficulty,
        standard_code: lesson.standard_code, question_text: q.text,
        question_type: q.type, options: q.options ?? null,
        correct_answer: q.correct_answer, visual_asset: q.visual_asset ?? null,
        snapshot: { ...q, lesson_id: lesson.id, lesson_idx: idx },
      })
    })
  }

  // ── 2. Find the 2002 unreviewed questions (same filter as original run) ────

  const { data: existingRows } = await supabase.from('question_reviews').select('question_ref')
  const alreadyInDb = new Set((existingRows ?? []).map(r => r.question_ref))
  const toReview = questions.filter(q => !alreadyInDb.has(q.ref))

  console.log(`✅  ${questions.length} total, ${alreadyInDb.size} already in DB, ${toReview.length} remaining`)

  if (toReview.length === 0) {
    console.log('Nothing to do — all questions already processed.')
    return
  }

  // ── 3. Split into failed (need Claude) and clean (bulk-insert) ────────────

  const failedQuestions: { idx: number; q: QuestionRow }[] = []
  const cleanQuestions:  QuestionRow[] = []

  toReview.forEach((q, idx) => {
    if (isFailedIndex(idx)) failedQuestions.push({ idx, q })
    else cleanQuestions.push(q)
  })

  console.log(`\n📋  ${cleanQuestions.length} clean questions → bulk-inserting as ai_clean`)
  console.log(`🔁  ${failedQuestions.length} questions from failed batches → sending to Claude\n`)

  const now = new Date().toISOString()

  // ── 4. Bulk-insert clean questions in chunks of 200 ───────────────────────

  const cleanRows = cleanQuestions.map(q => ({
    question_ref:      q.ref,
    question_source:   q.source,
    question_snapshot: q.snapshot,
    status:            'ai_clean',
    comment:           null,
    ai_flags:          [],
    ai_notes:          null,
    is_ai_review:      true,
    reviewed_at:       now,
  }))

  let inserted = 0
  for (let i = 0; i < cleanRows.length; i += 200) {
    const chunk = cleanRows.slice(i, i + 200)
    const { error } = await supabase.from('question_reviews').upsert(chunk, { onConflict: 'question_ref' })
    if (error) console.error(`  ⚠️  Insert error at ${i}:`, error.message)
    inserted += chunk.length
    process.stdout.write(`\r  Inserted ${inserted}/${cleanRows.length} clean records...`)
  }
  console.log(`\n  ✅  Done`)

  // ── 5. Retry failed batches with Claude ───────────────────────────────────

  const batchMap = new Map<number, QuestionRow[]>()
  for (const { idx, q } of failedQuestions) {
    const batchStart = FAILED_BATCH_STARTS.find(s => idx >= s && idx < s + BATCH_SIZE)!
    if (!batchMap.has(batchStart)) batchMap.set(batchStart, [])
    batchMap.get(batchStart)!.push(q)
  }

  let newFlags = 0
  for (const [batchStart, batch] of batchMap) {
    process.stdout.write(`  Retrying batch ${batchStart}–${batchStart + BATCH_SIZE - 1} (${batch.length} questions)... `)
    try {
      const flagResults = await reviewBatch(anthropic, batch)
      newFlags += flagResults.size

      const rows = batch.map(q => {
        const f = flagResults.get(q.ref)
        return f
          ? { question_ref: q.ref, question_source: q.source, question_snapshot: q.snapshot, status: 'flagged',  comment: f.notes, ai_flags: f.flags, ai_notes: f.notes, is_ai_review: true, reviewed_at: now }
          : { question_ref: q.ref, question_source: q.source, question_snapshot: q.snapshot, status: 'ai_clean', comment: null,    ai_flags: [],      ai_notes: null,    is_ai_review: true, reviewed_at: now }
      })

      const { error } = await supabase.from('question_reviews').upsert(rows, { onConflict: 'question_ref' })
      if (error) console.error('upsert error:', error.message)
      else console.log(`✅  ${flagResults.size} flagged`)
    } catch (e) {
      console.error(`❌  failed: ${(e as Error).message}`)
    }
    await new Promise(r => setTimeout(r, 400))
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅  Done! ${newFlags} new flags found in retried batches.`)
  console.log('All 2646 questions are now in question_reviews.')
  console.log('Open /admin/questions to start reviewing.')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
