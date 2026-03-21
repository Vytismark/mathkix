import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ChildCard } from '@/components/parent/ChildCard'

export default async function ChildrenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('profile_id', user!.id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-5xl">
      <div className="animate-fade-in-up flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Children</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Manage your children&apos;s profiles</p>
        </div>
        <Link href="/children/new">
          <button
            className="cta-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #2557CC, #3678FF)',
              boxShadow: '0 4px 18px rgba(54,120,255,0.35)',
            }}
          >
            <Plus className="w-4 h-4" />
            Add child
          </button>
        </Link>
      </div>

      {!children || children.length === 0 ? (
        <div
          className="text-center py-24 rounded-3xl border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="text-5xl mb-4">👶</div>
          <h2 className="text-xl font-semibold text-white mb-2">No children yet</h2>
          <p className="text-slate-500 mb-8 text-sm">Add a child profile to get started.</p>
          <Link href="/children/new">
            <button
              className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #2557CC, #3678FF)' }}
            >
              <Plus className="w-4 h-4" />
              Add child
            </button>
          </Link>
        </div>
      ) : (
        <div className="child-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}
    </div>
  )
}
