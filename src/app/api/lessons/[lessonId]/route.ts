import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ lessonId: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const childId = req.nextUrl.searchParams.get('child')

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (error || !lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check if child has completed all lessons for this domain/grade (pool exhaustion)
  let freshPractice = false
  if (childId) {
    const { data: domainLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('domain', lesson.domain)
      .eq('grade_level', lesson.grade_level)
      .eq('is_active', true)

    const lessonIds = domainLessons?.map(l => l.id) ?? []

    if (lessonIds.length > 0) {
      const { data: attempts } = await supabase
        .from('lesson_attempts')
        .select('lesson_id')
        .eq('child_id', childId)
        .eq('status', 'completed')
        .in('lesson_id', lessonIds)

      const uniqueCompleted = new Set(attempts?.map(a => a.lesson_id) ?? [])
      if (uniqueCompleted.size >= lessonIds.length) {
        freshPractice = true
      }
    }
  }

  return NextResponse.json({
    lesson,
    freshPractice,
  })
}
