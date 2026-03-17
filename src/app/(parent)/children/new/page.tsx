import Link from 'next/link'
import type { Metadata } from 'next'
import { ChildForm } from '@/components/parent/ChildForm'

export const metadata: Metadata = { title: 'Add child' }

export default function NewChildPage() {
  return (
    <div className="max-w-lg">
      <Link
        href="/children"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-5"
      >
        ← Children
      </Link>
      <h1 className="text-3xl font-bold text-white mb-1.5">Add a child</h1>
      <p className="text-slate-500 text-sm mb-8">Create a profile for your child to get started.</p>
      <ChildForm mode="create" />
    </div>
  )
}
