import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LevelFinderQuiz } from '@/components/quiz/LevelFinderQuiz'

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>
}) {
  const { child: childId } = await searchParams
  if (!childId) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: child } = await supabase
    .from('children')
    .select('id, name, school_grade')
    .eq('id', childId)
    .eq('profile_id', user!.id)
    .single()

  if (!child) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Back link */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-2.5">
        <Link
          href="/select"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-sm transition-colors"
        >
          ← Back to profiles
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <LevelFinderQuiz childId={child.id} childName={child.name} schoolGrade={child.school_grade ?? 0} />
      </div>
    </div>
  )
}
