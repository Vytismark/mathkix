import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { marked } from 'marked'
import { ArrowRight, ArrowLeft, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { BLOG_POSTS, getPostBySlug, formatDate } from '@/lib/blog'
import { getPublishedDbPostBySlug, getPublishedDbPosts } from '@/lib/blog-db'
import type { ContentBlock } from '@/lib/blog'

export const revalidate = 60

/* -- Static params (for pre-rendering known static posts) ---- */

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

/* -- SEO Metadata -------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const dbPost = await getPublishedDbPostBySlug(slug)
  const post = dbPost ?? getPostBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.title} — MathKix Blog`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      siteName: 'MathKix',
      publishedTime: post.date,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description },
  }
}

/* -- Block renderer (for legacy static posts) ---------------- */

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 key={index} className="font-bold mt-12 mb-4 tracking-tight" style={{ fontSize: '24px', lineHeight: '1.2', color: '#f1f5f9' }}>
          {block.text}
        </h2>
      )
    case 'subheading':
      return (
        <h3 key={index} className="font-semibold mt-8 mb-3" style={{ fontSize: '18px', lineHeight: '1.3', color: '#e2e8f0' }}>
          {block.text}
        </h3>
      )
    case 'paragraph':
      return (
        <p key={index} className="mb-5" style={{ color: '#94A3B8', lineHeight: '1.75', fontSize: '16px' }}>
          {block.text}
        </p>
      )
    case 'list':
      return (
        <ul key={index} className="mb-6 space-y-3 pl-0" style={{ listStyle: 'none' }}>
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3" style={{ color: '#94A3B8', lineHeight: '1.65', fontSize: '16px' }}>
              <span className="mt-[9px] shrink-0 rounded-full" style={{ width: '5px', height: '5px', background: '#3678FF' }} />
              {item}
            </li>
          ))}
        </ul>
      )
    case 'app-header':
      return (
        <div key={index} className="rounded-2xl p-5 mt-10 mb-2" style={{ background: 'linear-gradient(135deg, rgba(54,120,255,0.06) 0%, rgba(14,15,22,1) 60%)', border: '1px solid rgba(54,120,255,0.2)' }}>
          <h2 className="font-bold mb-3" style={{ fontSize: '22px', color: '#f1f5f9' }}>{block.name}</h2>
          <div className="flex flex-wrap gap-2">
            {[block.price, block.ages, block.platforms].map((tag) => (
              <span key={tag} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>{tag}</span>
            ))}
          </div>
        </div>
      )
    case 'verdict':
      return (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
          <div className="rounded-xl p-4" style={{ borderLeft: '3px solid #22C55E', background: 'rgba(34,197,94,0.05)' }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#22C55E' }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#22C55E' }}>Where it shines</p>
            </div>
            <p className="text-sm" style={{ color: '#94A3B8', lineHeight: '1.6' }}>{block.shines}</p>
          </div>
          <div className="rounded-xl p-4" style={{ borderLeft: '3px solid #F59E0B', background: 'rgba(245,158,11,0.05)' }}>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#F59E0B' }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#F59E0B' }}>Where it falls short</p>
            </div>
            <p className="text-sm" style={{ color: '#94A3B8', lineHeight: '1.6' }}>{block.fallsShort}</p>
          </div>
        </div>
      )
    case 'pick':
      return (
        <div key={index} className="rounded-xl p-5 mb-3 flex flex-col sm:flex-row sm:items-start gap-3" style={{ background: '#0E0F16', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="shrink-0 mt-0.5"><ArrowRight className="w-4 h-4" style={{ color: '#3678FF' }} /></div>
          <div>
            <p className="text-xs mb-1 font-medium uppercase tracking-wide" style={{ color: '#64748B' }}>{block.scenario}</p>
            <p className="font-semibold mb-1" style={{ color: '#3678FF', fontSize: '15px' }}>{block.choice}</p>
            <p className="text-sm" style={{ color: '#94A3B8', lineHeight: '1.6' }}>{block.note}</p>
          </div>
        </div>
      )
    case 'highlight':
      return (
        <blockquote key={index} className="my-8 px-6 py-5 rounded-xl" style={{ borderLeft: '3px solid #3678FF', background: 'rgba(54,120,255,0.06)' }}>
          <p className="font-medium italic" style={{ color: '#c7d7f9', lineHeight: '1.7', fontSize: '17px' }}>{block.text}</p>
        </blockquote>
      )
    case 'divider':
      return <div key={index} className="my-10" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
    case 'cta':
      return (
        <div key={index} className="rounded-2xl p-8 mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ background: 'linear-gradient(135deg, rgba(54,120,255,0.12) 0%, rgba(14,15,22,1) 70%)', border: '1px solid rgba(54,120,255,0.25)' }}>
          <div>
            <p className="font-bold text-base mb-2" style={{ fontSize: '18px' }}>{block.heading}</p>
            <p className="text-sm" style={{ color: '#94A3B8', lineHeight: '1.6', maxWidth: '380px' }}>{block.body}</p>
          </div>
          <Link href={block.href} className="cta-btn shrink-0 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: '#3678FF' }}>
            {block.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )
  }
}

/* -- Page ---------------------------------------------------- */

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Try DB first, then fall back to static
  const dbPost = await getPublishedDbPostBySlug(slug)
  const staticPost = dbPost ? undefined : getPostBySlug(slug)
  if (!dbPost && !staticPost) notFound()

  const post = (dbPost ?? staticPost)!
  const isMarkdown = !!dbPost

  // Fetch related posts for sidebar
  const [dbRelated, staticRelated] = await Promise.all([
    getPublishedDbPosts(),
    Promise.resolve(BLOG_POSTS.filter((p) => p.slug !== slug)),
  ])
  const dbSlugs = new Set(dbRelated.map((p) => p.slug))
  const related = [
    ...dbRelated.filter((p) => p.slug !== slug).map((p) => ({ slug: p.slug, title: p.title, category: p.category, readTime: p.read_time })),
    ...staticRelated.filter((p) => !dbSlugs.has(p.slug)).map((p) => ({ slug: p.slug, title: p.title, category: p.category, readTime: p.readTime })),
  ].slice(0, 2)

  const htmlContent = isMarkdown ? await marked(dbPost!.content) : ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: post.author ? { '@type': 'Organization', name: post.author } : undefined,
    publisher: { '@type': 'Organization', name: 'MathKix', url: 'https://mathkix.com' },
    url: `https://mathkix.com/blog/${post.slug}`,
  }

  return (
    <div style={{ background: '#07080F', minHeight: '100vh', color: '#fff' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingNav />

      <div style={{ paddingTop: '96px' }} className="px-6 pb-24">
        <div className="mx-auto max-w-[740px]">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-10" style={{ color: '#64748B' }}>
            <Link href="/blog" className="flex items-center gap-1 transition-colors hover:text-white">
              <ArrowLeft className="w-3 h-3" />
              Blog
            </Link>
            <span>/</span>
            <span style={{ color: '#94A3B8' }} className="truncate max-w-xs">{post.title}</span>
          </nav>

          {/* Article header */}
          <header className="mb-10">
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider mb-5"
              style={{ background: 'rgba(54,120,255,0.12)', color: '#3678FF' }}
            >
              {post.category}
            </span>
            <h1 className="font-bold tracking-tight mb-5" style={{ fontSize: '36px', lineHeight: '1.1' }}>
              {post.title}
            </h1>
            <p className="text-lg mb-6" style={{ color: '#94A3B8', lineHeight: '1.6', maxWidth: '620px' }}>
              {post.description}
            </p>
            <div className="flex flex-wrap items-center gap-4" style={{ color: '#64748B' }}>
              {post.author && <span className="text-sm font-medium" style={{ color: '#94A3B8' }}>{post.author}</span>}
              {post.author && <span>·</span>}
              <span className="flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4" />
                {isMarkdown ? dbPost!.read_time : (staticPost as typeof BLOG_POSTS[0]).readTime} min read
              </span>
            </div>
          </header>

          <div className="mb-10" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

          {/* Body */}
          {isMarkdown ? (
            <article
              className="blog-prose"
              style={{ maxWidth: '680px' }}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <article style={{ maxWidth: '680px' }}>
              {staticPost!.body?.map((block, i) => renderBlock(block, i))}
            </article>
          )}

          {/* Default CTA */}
          {(!isMarkdown && staticPost!.body && !staticPost!.body.some((b) => b.type === 'cta')) && (
            <div className="rounded-2xl p-8 mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ background: '#0E0F16', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <p className="font-semibold text-base mb-1">Try MathKix free</p>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Adaptive math practice for Grades 1–5. No card required.</p>
              </div>
              <Link href="/signup" className="cta-btn shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: '#3678FF' }}>
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {isMarkdown && (
            <div className="rounded-2xl p-8 mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ background: '#0E0F16', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <p className="font-semibold text-base mb-1">Try MathKix free</p>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Adaptive math practice for Grades 1–5. No card required.</p>
              </div>
              <Link href="/signup" className="cta-btn shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: '#3678FF' }}>
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <p className="font-semibold mb-6 text-sm uppercase tracking-widest" style={{ color: '#64748B' }}>
                More from the blog
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group flex flex-col rounded-xl p-5 transition-transform duration-200 hover:-translate-y-0.5"
                    style={{ background: '#0E0F16', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <span
                      className="self-start rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider mb-3"
                      style={{ background: 'rgba(54,120,255,0.12)', color: '#3678FF' }}
                    >
                      {rel.category}
                    </span>
                    <p className="text-sm font-semibold leading-snug mb-2 transition-colors group-hover:text-white" style={{ color: '#e2e8f0' }}>
                      {rel.title}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-3">
                      <span className="text-xs" style={{ color: '#64748B' }}>{rel.readTime} min read</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: '#3678FF' }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
