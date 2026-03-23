import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ExternalLink, Calendar, Clock, Tag,
  CheckCircle, XCircle, ArrowRight, Search, FileText,
} from 'lucide-react'
import { BLOG_POSTS, getPostBySlug, formatDate } from '@/lib/blog'
import type { ContentBlock } from '@/lib/blog'

/* -- Helpers ------------------------------------------------- */

function wordCount(post: ReturnType<typeof getPostBySlug>): number {
  if (!post?.body) return 0
  return post.body.reduce((acc, block) => {
    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'subheading' || block.type === 'highlight') {
      return acc + block.text.split(/\s+/).length
    }
    if (block.type === 'list') return acc + block.items.join(' ').split(/\s+/).length
    if (block.type === 'verdict') return acc + (block.shines + ' ' + block.fallsShort).split(/\s+/).length
    if (block.type === 'pick') return acc + (block.scenario + ' ' + block.choice + ' ' + block.note).split(/\s+/).length
    return acc
  }, 0)
}

/* -- Block preview renderer ---------------------------------- */

function PreviewBlock({ block, index }: { block: ContentBlock; index: number }) {
  switch (block.type) {
    case 'heading':
      return <h2 key={index} className="font-bold mt-8 mb-2 text-white" style={{ fontSize: '18px' }}>{block.text}</h2>

    case 'subheading':
      return <h3 key={index} className="font-semibold mt-5 mb-2 text-white" style={{ fontSize: '15px' }}>{block.text}</h3>

    case 'paragraph':
      return <p key={index} className="mb-3 text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{block.text}</p>

    case 'list':
      return (
        <ul key={index} className="mb-4 space-y-1.5 pl-0" style={{ listStyle: 'none' }}>
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94A3B8' }}>
              <span className="mt-2 shrink-0 rounded-full" style={{ width: '4px', height: '4px', background: '#3678FF' }} />
              {item}
            </li>
          ))}
        </ul>
      )

    case 'app-header':
      return (
        <div key={index} className="rounded-xl p-3 mt-5 mb-1 flex items-center gap-3 flex-wrap" style={{ background: 'rgba(54,120,255,0.06)', border: '1px solid rgba(54,120,255,0.15)' }}>
          <span className="text-sm font-bold text-white">{block.name}</span>
          {[block.price, block.ages, block.platforms].map((t) => (
            <span key={t} className="text-[10px] rounded-full px-2 py-0.5" style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}>{t}</span>
          ))}
        </div>
      )

    case 'verdict':
      return (
        <div key={index} className="grid grid-cols-2 gap-2 my-3">
          <div className="rounded-lg p-3" style={{ borderLeft: '2px solid #22C55E', background: 'rgba(34,197,94,0.05)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#22C55E' }}>Shines</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>{block.shines}</p>
          </div>
          <div className="rounded-lg p-3" style={{ borderLeft: '2px solid #F59E0B', background: 'rgba(245,158,11,0.05)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#F59E0B' }}>Falls short</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>{block.fallsShort}</p>
          </div>
        </div>
      )

    case 'pick':
      return (
        <div key={index} className="rounded-lg p-3 mb-2 flex gap-2" style={{ background: '#0E0F16', border: '1px solid rgba(255,255,255,0.06)' }}>
          <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#3678FF' }} />
          <div>
            <p className="text-[10px] text-slate-500 mb-0.5">{block.scenario}</p>
            <p className="text-xs font-semibold mb-0.5" style={{ color: '#3678FF' }}>{block.choice}</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>{block.note}</p>
          </div>
        </div>
      )

    case 'highlight':
      return (
        <blockquote key={index} className="my-4 px-4 py-3 rounded-lg italic text-sm" style={{ borderLeft: '2px solid #3678FF', background: 'rgba(54,120,255,0.05)', color: '#c7d7f9' }}>
          {block.text}
        </blockquote>
      )

    case 'cta':
      return (
        <div key={index} className="rounded-xl p-4 mt-5" style={{ background: 'rgba(54,120,255,0.08)', border: '1px solid rgba(54,120,255,0.2)' }}>
          <p className="text-sm font-semibold text-white mb-1">{block.heading}</p>
          <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>{block.body}</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 text-white" style={{ background: '#3678FF' }}>
            {block.label} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      )

    default:
      return null
  }
}

/* -- Static params ------------------------------------------- */

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

/* -- Page ---------------------------------------------------- */

export default async function AdminBlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const isPublished = !!(post.body && post.body.length > 0)
  const words = wordCount(post)
  const blockCounts = post.body
    ? Object.entries(
        post.body.reduce<Record<string, number>>((acc, b) => {
          acc[b.type] = (acc[b.type] ?? 0) + 1
          return acc
        }, {})
      )
    : []

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Link
            href="/admin/blog"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Blog
          </Link>
          <h1 className="text-xl font-bold text-white leading-snug max-w-2xl">
            {post.title}
          </h1>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          target="_blank"
          className="shrink-0 flex items-center gap-1.5 text-xs font-medium rounded-xl px-3 py-2 transition-colors text-slate-300 hover:text-white"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View live
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: preview */}
        <div className="lg:col-span-2 space-y-4">

          {/* Content preview */}
          <div
            className="rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
              <h2 className="text-sm font-semibold text-white">Content Preview</h2>
              <span
                className="text-[10px] font-medium rounded-full px-2.5 py-1"
                style={
                  isPublished
                    ? { background: 'rgba(34,197,94,0.12)', color: '#22c55e' }
                    : { background: 'rgba(100,116,139,0.15)', color: '#64748b' }
                }
              >
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="px-5 py-4 max-h-[600px] overflow-y-auto">
              {post.body && post.body.length > 0 ? (
                post.body.map((block, i) => <PreviewBlock key={i} block={block} index={i} />)
              ) : (
                <p className="text-sm text-slate-600 py-8 text-center">No content yet. Add body blocks to blog.ts.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: metadata + SEO */}
        <div className="space-y-4">

          {/* Post metadata */}
          <div
            className="rounded-2xl border border-white/10 p-5"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <h2 className="text-sm font-semibold text-white mb-4">Post Details</h2>
            <div className="space-y-3">
              {[
                { icon: Tag, label: 'Category', value: post.category },
                { icon: Calendar, label: 'Published', value: formatDate(post.date) },
                { icon: Clock, label: 'Read time', value: `${post.readTime} min` },
                { icon: FileText, label: 'Word count', value: words > 0 ? words.toLocaleString() : '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                  <span className="text-xs font-medium text-white">{value}</span>
                </div>
              ))}
              {post.author && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Author</span>
                  <span className="text-xs font-medium text-white">{post.author}</span>
                </div>
              )}
            </div>

            {blockCounts.length > 0 && (
              <>
                <div className="border-t border-white/[0.07] my-4" />
                <p className="text-[11px] text-slate-600 mb-2 uppercase tracking-wider">Content blocks</p>
                <div className="space-y-1.5">
                  {blockCounts.map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono">{type}</span>
                      <span className="text-xs text-slate-400">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* SEO panel */}
          <div
            className="rounded-2xl border border-white/10 p-5"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-3.5 h-3.5" style={{ color: '#3678FF' }} />
              <h2 className="text-sm font-semibold text-white">SEO</h2>
            </div>

            {/* Google SERP preview */}
            <div
              className="rounded-xl p-3 mb-4"
              style={{ background: '#0E0F16', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-[11px] text-slate-600 mb-2 uppercase tracking-wider">Search preview</p>
              <p className="text-sm font-medium mb-0.5" style={{ color: '#8ab4f8' }}>
                {post.title.length > 60 ? post.title.slice(0, 57) + '…' : post.title} — MathKix Blog
              </p>
              <p className="text-[11px] mb-0.5" style={{ color: '#4caf50' }}>
                mathkix.com › blog › {post.slug}
              </p>
              <p className="text-xs" style={{ color: '#94A3B8', lineHeight: '1.5' }}>
                {post.description.length > 155 ? post.description.slice(0, 152) + '…' : post.description}
              </p>
            </div>

            {/* SEO checks */}
            <div className="space-y-2">
              {[
                {
                  label: 'Title length',
                  pass: post.title.length <= 60,
                  detail: `${post.title.length} chars ${post.title.length > 60 ? '(over 60)' : '(good)'}`,
                },
                {
                  label: 'Description length',
                  pass: post.description.length >= 120 && post.description.length <= 155,
                  detail: `${post.description.length} chars ${post.description.length < 120 ? '(under 120)' : post.description.length > 155 ? '(over 155)' : '(good)'}`,
                },
                {
                  label: 'Has body content',
                  pass: isPublished,
                  detail: isPublished ? 'Content present' : 'No body blocks',
                },
                {
                  label: 'Canonical URL set',
                  pass: true,
                  detail: `/blog/${post.slug}`,
                },
                {
                  label: 'JSON-LD schema',
                  pass: true,
                  detail: 'Article schema',
                },
                {
                  label: 'In sitemap',
                  pass: true,
                  detail: 'Auto-included',
                },
              ].map(({ label, pass, detail }) => (
                <div key={label} className="flex items-center gap-2">
                  {pass
                    ? <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#22c55e' }} />
                    : <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f59e0b' }} />
                  }
                  <span className="text-xs text-slate-400 flex-1">{label}</span>
                  <span className="text-[10px] text-slate-600 font-mono">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source file note */}
          <div
            className="rounded-xl px-4 py-3 text-xs"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-slate-500 mb-1 font-medium">Source file</p>
            <p className="font-mono text-slate-600">src/lib/blog.ts</p>
          </div>
        </div>
      </div>
    </div>
  )
}
