/**
 * scripts/review-questions.ts
 *
 * AI-powered batch quality review for all math questions.
 * Fetches questions from Supabase, runs deterministic checks, then sends
 * remaining questions to Claude Haiku in batches. Results are upserted into
 * the question_reviews table so the /admin/questions UI can surface them.
 *
 * Usage:
 *   npx tsx scripts/review-questions.ts
 *
 * Required env vars (read from .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY
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


// ── Types ─────────────────────────────────────────────────────────────────────

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

interface AiResult {
  flags: string[]
  notes: string
}

// ── Deterministic checks ──────────────────────────────────────────────────────

function deterministicFlags(q: QuestionRow): AiResult | null {
  const flags: string[] = []
  const reasons: string[] = []

  if (q.question_type === 'multiple_choice') {
    if (!q.options || q.options.length < 2) {
      flags.push('format_error')
      reasons.push('multiple_choice question has fewer than 2 options')
    } else if (!q.options.some(o => o.value === q.correct_answer)) {
      flags.push('ui_mismatch')
      reasons.push(`correct_answer "${q.correct_answer}" does not match any option value`)
    }
  }

  if (q.question_type === 'numeric') {
    if (isNaN(parseFloat(q.correct_answer))) {
      flags.push('ui_mismatch')
      reasons.push(`correct_answer "${q.correct_answer}" is not a valid number for numeric input`)
    }
  }

  if (q.question_type === 'fraction') {
    if (!/^\d+\/[1-9]\d*$/.test(q.correct_answer)) {
      flags.push('ui_mismatch')
      reasons.push(`correct_answer "${q.correct_answer}" is not in X/Y fraction format`)
    }
    if (q.grade_level <= 2) {
      flags.push('grade_mismatch')
      reasons.push('fraction type is used for Grade 1-2 but fractions are a Grade 3+ topic')
    }
  }

  const visualKeywords = /\b(picture|diagram|figure|image|graph|chart|shown below|shown above|look at|the following)\b/i
  if (visualKeywords.test(q.question_text) && !q.visual_asset) {
    flags.push('missing_visual_ref')
    reasons.push('question text references a visual but visual_asset is not set')
  }

  if (flags.length === 0) return null
  return { flags, notes: reasons.join('; ') }
}

// ── Claude batch review ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a K-5 math curriculum quality reviewer. Review each question and flag genuine problems only — do NOT flag questions that are fine.

Flag codes (use ONLY these exact strings):
- wrong_answer: the stated correct answer is mathematically incorrect
- weak_distractors: for multiple choice, distractors are trivially wrong, repeated, or nonsensical
- ambiguous_wording: the question has multiple valid mathematical interpretations
- grade_mismatch: clearly inappropriate difficulty for the stated grade level
- unanswerable: the question is missing information required to solve it

Grade context:
- Grade 1-2: ages 6-8 (single-digit addition/subtraction, basic shapes, simple measurement)
- Grade 3-5: ages 8-11 (multiplication/division, fractions, multi-step problems)

Respond ONLY with a valid JSON array — no markdown, no prose, no explanation outside the JSON:
[{"id":"<question_ref>","flags":["flag_code",...],"notes":"one sentence or empty string"}]

Include every question in your response, even those with no issues (use empty flags array).`

async function reviewBatch(
  anthropic: Anthropic,
  batch: QuestionRow[]
): Promise<Map<string, AiResult>> {
  const results = new Map<string, AiResult>()

  const formatted = batch.map(q => {
    let text = `ID: ${q.ref}\nGrade: ${q.grade_level} | Domain: ${q.domain} | Standard: ${q.standard_code ?? 'N/A'} | Type: ${q.question_type} | Difficulty: ${q.difficulty}/3\nQuestion: ${q.question_text}\nCorrect answer: ${q.correct_answer}`
    if (q.options && q.options.length > 0) {
      text += `\nOptions: ${q.options.map(o => `${o.label}) ${o.value}`).join(' | ')}`
    }
    return text
  }).join('\n\n---\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Review these ${batch.length} questions:\n\n${formatted}` }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'

  // Extract just the JSON array — Claude sometimes adds prose before/after
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start === -1 || end === -1) return results
  const parsed = JSON.parse(text.slice(start, end + 1)) as { id: string; flags: string[]; notes: string }[]

  for (const item of parsed) {
    if (item.flags && item.flags.length > 0) {
      results.set(item.id, { flags: item.flags, notes: item.notes ?? '' })
    }
  }

  return results
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!supabaseUrl || !serviceKey || !anthropicKey) {
    console.error('❌  Missing required env vars:')
    if (!supabaseUrl) console.error('   NEXT_PUBLIC_SUPABASE_URL')
    if (!serviceKey) console.error('   SUPABASE_SERVICE_ROLE_KEY')
    if (!anthropicKey) console.error('   ANTHROPIC_API_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  const anthropic = new Anthropic({ apiKey: anthropicKey })

  // ── 1. Fetch all questions ────────────────────────────────────────────────

  console.log('📥  Fetching questions from Supabase...')

  const { data: diagRows, error: diagError } = await supabase
    .from('diagnostic_questions')
    .select('*')
    .order('grade_level', { ascending: true })

  if (diagError) { console.error('Failed to fetch diagnostic questions:', diagError); process.exit(1) }

  const { data: lessons, error: lessonError } = await supabase
    .from('lessons')
    .select('id, grade_level, domain, standard_code, title, difficulty, questions')
    .eq('is_active', true)
    .order('grade_level', { ascending: true })

  if (lessonError) { console.error('Failed to fetch lessons:', lessonError); process.exit(1) }

  const questions: QuestionRow[] = []

  for (const q of diagRows ?? []) {
    questions.push({
      ref: `diag:${q.id}`,
      source: 'diagnostic',
      grade_level: q.grade_level,
      domain: q.domain,
      difficulty: q.difficulty,
      standard_code: q.standard_code,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options as { label: string; value: string }[] | null,
      correct_answer: q.correct_answer,
      visual_asset: q.visual_asset,
      snapshot: { ...q },
    })
  }

  for (const lesson of lessons ?? []) {
    type RawQ = { text: string; type: string; options?: { label: string; value: string }[]; correct_answer: string; visual_asset?: string }
    const qs = (lesson.questions as unknown as RawQ[]) ?? []
    qs.forEach((q, idx) => {
      questions.push({
        ref: `lesson:${lesson.id}:${idx}`,
        source: 'lesson',
        grade_level: lesson.grade_level,
        domain: lesson.domain,
        difficulty: lesson.difficulty,
        standard_code: lesson.standard_code,
        question_text: q.text,
        question_type: q.type,
        options: q.options ?? null,
        correct_answer: q.correct_answer,
        visual_asset: q.visual_asset ?? null,
        snapshot: { ...q, lesson_id: lesson.id, lesson_idx: idx },
      })
    })
  }

  console.log(`✅  Loaded ${questions.length} questions (${diagRows?.length ?? 0} diagnostic, ${questions.length - (diagRows?.length ?? 0)} lesson)`)

  // ── Load already-processed refs from DB to skip on re-run ────────────────
  // Both flagged (ai_flags set) and ai_clean (no issues) rows are written after
  // each batch, so a re-run only touches the batches that actually failed.
  const { data: existingRows } = await supabase
    .from('question_reviews')
    .select('question_ref')
  const skip = new Set((existingRows ?? []).map(r => r.question_ref))
  if (skip.size > 0) {
    console.log(`⏭️   Skipping ${skip.size} already-processed questions`)
  }

  // ── 2. Deterministic checks ───────────────────────────────────────────────

  console.log('\n🔍  Running deterministic checks...')
  const results = new Map<string, AiResult>()
  let deterministicCount = 0

  for (const q of questions) {
    if (skip.has(q.ref)) continue
    const result = deterministicFlags(q)
    if (result) {
      results.set(q.ref, result)
      deterministicCount++
    }
  }

  console.log(`   ${deterministicCount} flagged by deterministic checks`)

  // ── 3. Claude Haiku batch review ─────────────────────────────────────────

  const toReview = questions.filter(q => !results.has(q.ref) && !skip.has(q.ref))
  console.log(`\n🤖  Sending ${toReview.length} questions to Claude Haiku...`)

  const BATCH_SIZE = 10
  let processed = 0
  let aiFlagged = 0
  const errors: number[] = []

  for (let i = 0; i < toReview.length; i += BATCH_SIZE) {
    const batch = toReview.slice(i, i + BATCH_SIZE)

    try {
      const batchResults = await reviewBatch(anthropic, batch)
      for (const [ref, result] of batchResults) {
        results.set(ref, result)
        aiFlagged++
      }

      // Write ALL questions in this batch to DB immediately (flagged + clean).
      // This means re-runs only retry batches that actually errored.
      const now = new Date().toISOString()
      const batchRows = batch.map(q => {
        const flagResult = batchResults.get(q.ref)
        return flagResult
          ? {
              question_ref:      q.ref,
              question_source:   q.source,
              question_snapshot: q.snapshot,
              status:            'flagged',
              comment:           flagResult.notes,
              ai_flags:          flagResult.flags,
              ai_notes:          flagResult.notes,
              is_ai_review:      true,
              reviewed_at:       now,
            }
          : {
              question_ref:      q.ref,
              question_source:   q.source,
              question_snapshot: q.snapshot,
              status:            'ai_clean',
              comment:           null,
              ai_flags:          [],
              ai_notes:          null,
              is_ai_review:      true,
              reviewed_at:       now,
            }
      })
      await supabase
        .from('question_reviews')
        .upsert(batchRows, { onConflict: 'question_ref' })
    } catch (e) {
      errors.push(i)
      console.error(`   ⚠️  Batch ${i}–${i + BATCH_SIZE} failed:`, (e as Error).message)
    }

    processed += batch.length

    if (processed % 200 === 0 || processed === toReview.length) {
      process.stdout.write(`\r   [${processed}/${toReview.length}] ${results.size} flagged so far...    `)
    }

    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n   ${aiFlagged} additional flags from AI`)
  if (errors.length > 0) console.log(`   ⚠️  ${errors.length} batches had errors — re-run to retry`)

  // ── 4. Summary ────────────────────────────────────────────────────────────
  // (All DB writes happen per-batch above — nothing to flush here.)

  const flagCounts: Record<string, number> = {}
  for (const { flags } of results.values()) {
    for (const f of flags) flagCounts[f] = (flagCounts[f] ?? 0) + 1
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅  Done! ${questions.length} questions reviewed, ${results.size} flagged (${((results.size / questions.length) * 100).toFixed(1)}%)`)
  console.log('\nFlag breakdown:')
  for (const [flag, count] of Object.entries(flagCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${flag.padEnd(22)} ${count}`)
  }
  console.log('\nOpen /admin/questions to review flagged questions.')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
