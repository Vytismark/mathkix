import Link from 'next/link'
import { FileText, Clock, Tag, Calendar, ArrowRight, ExternalLink, Eye } from 'lucide-react'
import { BLOG_POSTS, formatDate } from '@/lib/blog'

/* -- Helpers ------------------------------------------------- */

function wordCount(post: (typeof BLOG_POSTS)[number]): number {
  if (!post.body) return 0
  return post.body.reduce((acc, block) => {
    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'subheading' || block.type === 'highlight') {
      return acc + block.text.split(/\s+/).length
    }
    if (block.type === 'list') {
      return acc + block.items.join(' ').split(/\s+/).length
    }
    if (block.type === 'verdict') {
      return acc + (block.shines + ' ' + block.fallsShort).split(/\s+/).length
    }
    if (block.type === 'pick') {
      return acc + (block.scenario + ' ' + block.choice + ' ' + block.note).split(/\s+/).length
    }
    return acc
  }, 0)
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Reviews':        { bg: 'rgba(124,58,237,0.15)', text: '#a78bfa' },
  'Learning Science': { bg: 'rgba(54,120,255,0.15)', text: '#3678FF' },
  'Parenting':      { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
}

/* -- Page ---------------------------------------------------- */

export default function AdminBlogPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalWords = posts.reduce((acc, p) => acc + wordCount(p), 0)
  const totalReadTime = posts.reduce((acc, p) => acc + p.readTime, 0)
  const categories = [...new Set(posts.map((p) => p.category))]
  const published = posts.filter((p) => p.body && p.body.length > 0)

  const statCards = [
    {
      icon: FileText,
      label: 'Total Posts',
      value: posts.length,
      sub: `${published.length} published`,
      color: '#3678FF',
      glow: 'rgba(54,120,255,0.3)',
    },
    {
      icon: Clock,
      label: 'Total Read Time',
      value: `${totalReadTime}m`,
      sub: `${totalWords.toLocaleString()} words`,
      color: '#a855f7',
      glow: 'rgba(168,85,247,0.3)',
    },
    {
      icon: Tag,
      label: 'Categories',
      value: categories.length,
      sub: categories.join(', '),
      color: '#f59e0b',
      glow: 'rgba(245,158,11,0.3)',
    },
    {
      icon: Calendar,
      label: 'Latest Post',
      value: posts[0] ? new Date(posts[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
      sub: posts[0]?.title.slice(0, 32) + '…' ?? '—',
      color: '#22c55e',
      glow: 'rgba(34,197,94,0.3)',
    },
  ]

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Blog</h1>
        <Link
          href="/blog"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View blog
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {statCards.map(({ icon: Icon, label, value, sub, color, glow }) => (
          <div
            key={label}
            className="flex items-start gap-3 p-4 rounded-2xl border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${color}22`, boxShadow: `0 0 14px ${glow}` }}
            >
              <Icon className="w-[18px] h-[18px]" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-white leading-tight">{value}</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{label}</p>
              <p className="text-[10px] text-slate-600 leading-tight mt-1 truncate">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SEO note */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6 text-sm"
        style={{ background: 'rgba(54,120,255,0.08)', border: '1px solid rgba(54,120,255,0.2)' }}
      >
        <Eye className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#3678FF' }} />
        <p style={{ color: '#94A3B8' }}>
          All published posts are in the sitemap and discoverable by search engines.
          Connect Google Search Console to track keyword rankings and impressions.
        </p>
      </div>

      {/* Post list */}
      <div
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <div className="px-5 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">All Posts</h2>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {posts.map((post) => {
            const isPublished = !!(post.body && post.body.length > 0)
            const catStyle = CATEGORY_COLORS[post.category] ?? { bg: 'rgba(255,255,255,0.08)', text: '#94A3B8' }
            const words = wordCount(post)

            return (
              <div
                key={post.slug}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors"
              >
                {/* Status dot */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: isPublished ? '#22c55e' : '#64748b' }}
                  title={isPublished ? 'Published' : 'Draft'}
                />

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{post.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: catStyle.bg, color: catStyle.text }}
                    >
                      {post.category}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {formatDate(post.date)}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {post.readTime} min read
                    </span>
                    {words > 0 && (
                      <span className="text-[11px] text-slate-600">
                        {words.toLocaleString()} words
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className="text-[10px] font-medium rounded-full px-2.5 py-1 shrink-0"
                  style={
                    isPublished
                      ? { background: 'rgba(34,197,94,0.12)', color: '#22c55e' }
                      : { background: 'rgba(100,116,139,0.15)', color: '#64748b' }
                  }
                >
                  {isPublished ? 'Published' : 'Draft'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                    title="View live"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/admin/blog/${post.slug}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    Open
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
