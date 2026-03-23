import Link from 'next/link'
import { FileText, Clock, Tag, Calendar, ExternalLink, Eye, Plus, Pencil } from 'lucide-react'
import { getAllDbPostsAdmin } from '@/lib/blog-db'
import { BLOG_POSTS, formatDate } from '@/lib/blog'

/* -- Helpers -------------------------------------------------- */

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Reviews':          { bg: 'rgba(124,58,237,0.15)', text: '#a78bfa' },
  'Learning Science': { bg: 'rgba(54,120,255,0.15)', text: '#3678FF' },
  'Parenting':        { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24' },
}

/* -- Page ----------------------------------------------------- */

export default async function AdminBlogPage() {
  const dbPosts = await getAllDbPostsAdmin()

  // Static posts that haven't been superseded by a DB post
  const dbSlugs = new Set(dbPosts.map((p) => p.slug))
  const staticPosts = BLOG_POSTS.filter((p) => !dbSlugs.has(p.slug))

  // Stats across everything
  const totalPosts    = dbPosts.length + staticPosts.length
  const publishedCount = dbPosts.filter((p) => p.published).length + staticPosts.filter((p) => p.body && p.body.length > 0).length
  const totalReadTime = dbPosts.reduce((a, p) => a + p.read_time, 0)
                      + staticPosts.reduce((a, p) => a + p.readTime, 0)
  const categories = [
    ...new Set([
      ...dbPosts.map((p) => p.category),
      ...staticPosts.map((p) => p.category),
    ]),
  ]

  const allSorted = [
    ...dbPosts.map((p) => ({ type: 'db' as const, p })),
    ...staticPosts.map((p) => ({ type: 'static' as const, p })),
  ].sort((a, b) => {
    const da = a.type === 'db' ? a.p.date : (a.p as typeof staticPosts[0]).date
    const db2 = b.type === 'db' ? b.p.date : (b.p as typeof staticPosts[0]).date
    return new Date(db2).getTime() - new Date(da).getTime()
  })

  const latestDate = allSorted[0]
    ? (allSorted[0].type === 'db'
        ? allSorted[0].p.date
        : (allSorted[0].p as typeof staticPosts[0]).date)
    : null

  const statCards = [
    {
      icon: FileText,
      label: 'Total Posts',
      value: totalPosts,
      sub: `${publishedCount} published`,
      color: '#3678FF',
      glow: 'rgba(54,120,255,0.3)',
    },
    {
      icon: Clock,
      label: 'Total Read Time',
      value: `${totalReadTime}m`,
      sub: `across all posts`,
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
      value: latestDate
        ? new Date(latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '—',
      sub: allSorted[0]
        ? (allSorted[0].type === 'db'
            ? allSorted[0].p.title.slice(0, 32) + '…'
            : (allSorted[0].p as typeof staticPosts[0]).title.slice(0, 32) + '…')
        : '—',
      color: '#22c55e',
      glow: 'rgba(34,197,94,0.3)',
    },
  ]

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Blog</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View blog
          </Link>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-80"
            style={{ background: '#3678FF' }}
          >
            <Plus className="w-3.5 h-3.5" />
            New post
          </Link>
        </div>
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

        {allSorted.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-slate-600 text-sm mb-4">No posts yet.</p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: '#3678FF' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {allSorted.map(({ type, p }) => {
              const isDb = type === 'db'
              const slug = p.slug
              const title = isDb ? (p as typeof dbPosts[0]).title : (p as typeof staticPosts[0]).title
              const category = isDb ? (p as typeof dbPosts[0]).category : (p as typeof staticPosts[0]).category
              const date = isDb ? (p as typeof dbPosts[0]).date : (p as typeof staticPosts[0]).date
              const readTime = isDb ? (p as typeof dbPosts[0]).read_time : (p as typeof staticPosts[0]).readTime
              const isPublished = isDb
                ? (p as typeof dbPosts[0]).published
                : !!(p as typeof staticPosts[0]).body?.length

              const catStyle = CATEGORY_COLORS[category] ?? { bg: 'rgba(255,255,255,0.08)', text: '#94A3B8' }

              return (
                <div
                  key={slug}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors"
                >
                  {/* Status dot */}
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: isPublished ? '#22c55e' : '#64748b' }}
                    title={isPublished ? 'Published' : 'Draft'}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: catStyle.bg, color: catStyle.text }}
                      >
                        {category}
                      </span>
                      <span className="text-[11px] text-slate-600">{formatDate(date)}</span>
                      <span className="text-[11px] text-slate-600">{readTime} min read</span>
                      {!isDb && (
                        <span className="text-[10px] text-slate-700 font-medium">static</span>
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
                      href={`/blog/${slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                      title="View live"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    {isDb ? (
                      <Link
                        href={`/admin/blog/${slug}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </Link>
                    ) : (
                      <span className="px-3 py-1.5 text-xs text-slate-700">Static</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
