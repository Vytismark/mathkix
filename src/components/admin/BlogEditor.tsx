'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DbBlogPost } from '@/lib/blog-db'

const CATEGORIES = ['Reviews', 'Learning Science', 'Parenting', 'General']

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="relative inline-flex w-10 h-6 rounded-full transition-colors focus:outline-none shrink-0"
      style={{ background: on ? '#22c55e' : 'rgba(255,255,255,0.12)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: on ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  )
}

export function BlogEditor({ post }: { post?: DbBlogPost }) {
  const router = useRouter()
  const isEdit = !!post

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [description, setDescription] = useState(post?.description ?? '')
  const [category, setCategory] = useState(post?.category ?? 'General')
  const [date, setDate] = useState(post?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  const [readTime, setReadTime] = useState(post?.read_time ?? 5)
  const [author, setAuthor] = useState(post?.author ?? 'The MathKix Team')
  const [content, setContent] = useState(post?.content ?? '')
  const [published, setPublished] = useState(post?.published ?? false)
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(v: string) {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return }
    if (!slug.trim()) { setError('Slug is required'); return }
    setSaving(true)
    setError('')
    try {
      const payload = { title, slug, description, category, date, read_time: readTime, author, content, published }
      const res = isEdit
        ? await fetch(`/api/admin/blog/${post!.slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/admin/blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Save failed'); setSaving(false); return }
      router.push('/admin/blog')
      router.refresh()
    } catch {
      setError('Network error')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await fetch(`/api/admin/blog/${post!.slug}`, { method: 'DELETE' })
    router.push('/admin/blog')
    router.refresh()
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/[0.06] border border-white/10 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600'
  const labelClass = 'text-xs text-slate-400 mb-1.5 block'

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Post' : 'New Post'}</h1>
        <button
          onClick={() => router.back()}
          className="text-xs text-slate-500 hover:text-white transition-colors"
        >
          ← Back
        </button>
      </div>

      {error && (
        <div
          className="mb-5 px-4 py-3 rounded-xl text-sm text-red-400"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-4 mb-6">
        <div>
          <label className={labelClass}>Title</label>
          <input
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Post title…"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Slug <span className="text-slate-600">(URL path)</span></label>
          <input
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugTouched(true) }}
            placeholder="post-slug"
            className={`${inputClass} font-mono`}
          />
        </div>

        <div>
          <label className={labelClass}>Description <span className="text-slate-600">(SEO + card preview)</span></label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Brief description of the post…"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Read time (min)</label>
            <input
              type="number"
              value={readTime}
              onChange={e => setReadTime(Number(e.target.value))}
              min={1}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Author</label>
            <input
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-6">
        <label className={labelClass}>
          Content
          <span className="text-slate-600 ml-1">— Markdown supported: **bold**, *italic*, ## headings, - lists, {'>'} blockquotes</span>
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={`## Introduction\n\nWrite your post here using Markdown.\n\n**Bold**, *italic*, [links](https://example.com).\n\n## Section\n\nMore content…`}
          className="w-full px-4 py-3 rounded-xl text-sm text-slate-200 font-mono leading-relaxed bg-white/[0.04] border border-white/10 focus:outline-none focus:border-indigo-500 resize-y"
          style={{ minHeight: '520px' }}
        />
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-white/10"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <label className="flex items-center gap-3 cursor-pointer">
          <Toggle on={published} onChange={setPublished} />
          <span className="text-sm text-slate-300">{published ? 'Published' : 'Draft'}</span>
        </label>

        <div className="flex items-center gap-3">
          {isEdit && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Delete post
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ background: '#3678FF' }}
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create post'}
          </button>
        </div>
      </div>
    </div>
  )
}
