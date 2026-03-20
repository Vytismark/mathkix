import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyReviewer } from '@/lib/review/auth'
import type { LessonQuestion } from '@/types/curriculum'
import type { ReviewableQuestion, ReviewRecord } from '@/app/api/admin/questions/queue/route'

export async function GET() {
  const user = await verifyReviewer()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()

  const { data: reviewRows } = await db
    .from('question_reviews')
    .select('question_ref, status, comment, suggested_fix, reviewed_at, ai_flags, ai_notes, is_ai_review')

  const reviews: Record<string, ReviewRecord> = {}
  for (const r of reviewRows ?? []) {
    reviews[r.question_ref] = {
      status:        r.status as 'approved' | 'flagged',
      comment:       r.comment,
      suggested_fix: r.suggested_fix ?? null,
      reviewed_at:   r.reviewed_at,
      ai_flags:      (r.ai_flags as string[]) ?? [],
      ai_notes:      r.ai_notes ?? null,
      is_ai_review:  r.is_ai_review ?? false,
    }
  }

  const queue: ReviewableQuestion[] = []

  const { data: diagRows } = await db
    .from('diagnostic_questions')
    .select('*')
    .order('grade_level', { ascending: true })
    .order('domain',      { ascending: true })
    .order('difficulty',  { ascending: true })

  for (const q of diagRows ?? []) {
    queue.push({
      ref:           `diag:${q.id}`,
      source:        'diagnostic',
      grade_level:   q.grade_level,
      domain:        q.domain,
      difficulty:    q.difficulty,
      standard_code: q.standard_code,
      question_text: q.question_text,
      question_type: q.question_type,
      options:       q.options as { label: string; value: string }[] | null,
      correct_answer: q.correct_answer,
      visual_asset:  q.visual_asset,
      has_audio:     q.grade_level <= 2,
    })
  }

  const { data: lessons } = await db
    .from('lessons')
    .select('id, grade_level, domain, standard_code, title, difficulty, questions')
    .eq('is_active', true)
    .order('grade_level', { ascending: true })
    .order('domain',      { ascending: true })
    .order('sort_order',  { ascending: true })

  for (const lesson of lessons ?? []) {
    const questions = (lesson.questions as unknown as LessonQuestion[]) ?? []
    questions.forEach((q, idx) => {
      queue.push({
        ref:            `lesson:${lesson.id}:${idx}`,
        source:         'lesson',
        grade_level:    lesson.grade_level,
        domain:         lesson.domain,
        difficulty:     lesson.difficulty,
        standard_code:  lesson.standard_code,
        question_text:  q.text,
        question_type:  q.type,
        options:        q.options ?? null,
        correct_answer: q.correct_answer,
        visual_asset:   q.visual_asset ?? null,
        has_audio:      lesson.grade_level <= 2,
        lesson_title:   lesson.title,
        lesson_id:      lesson.id,
        question_index: idx,
      })
    })
  }

  return NextResponse.json({ queue, reviews })
}
