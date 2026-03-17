import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChildForm } from '@/components/parent/ChildForm'

export default async function ChildSettingsPage({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { childId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .eq('profile_id', user!.id)
    .single()

  if (!child) notFound()

  return (
    <div className="max-w-lg">
      <Link
        href={`/children/${childId}`}
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-5"
      >
        ← {child.name}
      </Link>
      <h1 className="text-3xl font-bold text-white mb-1.5">Edit {child.name}</h1>
      <p className="text-slate-500 text-sm mb-8">Update your child&apos;s profile.</p>
      <ChildForm
        mode="edit"
        childId={childId}
        defaultValues={{
          name:                 child.name,
          avatar_id:            child.avatar_id,
          school_grade:         child.school_grade         ?? null,
          learning_pace:        child.learning_pace        ?? 'average',
          challenge_preference: child.challenge_preference ?? 'balanced',
          attention_span:       child.attention_span       ?? 'medium',
          parent_goal:          child.parent_goal          ?? 'reinforce',
          motivation_style:     child.motivation_style     ?? 'encouragement',
          learning_notes:       child.learning_notes       ?? null,
        }}
      />
    </div>
  )
}
