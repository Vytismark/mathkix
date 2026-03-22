import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Clock, Calendar } from 'lucide-react'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { BLOG_POSTS, formatDate } from '@/lib/blog'

/* -- SEO Metadata -------------------------------------------- */

export const metadata: Metadata = {
  title: 'Blog — MathKix',
  description:
    'Research, parenting insights, and the thinking behind MathKix — adaptive math practice for Grades 1–5.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog — MathKix',
    description:
      'Research, parenting insights, and the thinking behind MathKix.',
    type: 'website',
    siteName: 'MathKix',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — MathKix',
    description:
      'Research, parenting insights, and the thinking behind MathKix.',
  },
}

/* -- JSON-LD -------------------------------------------------- */

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'MathKix Blog',
  description:
    'Research, parenting insights, and the thinking behind MathKix.',
  url: 'https://mathkix.com/blog',
  publisher: {
    '@type': 'Organization',
    name: 'MathKix',
    url: 'https://mathkix.com',
  },
}

/* -- Page ---------------------------------------------------- */

export default function BlogPage() {
  return (
    <div style={{ background: '#07080F', minHeight: '100vh', color: '#fff' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MarketingNav />

      {/* Hero */}
      <section
        style={{ paddingTop: '96px', paddingBottom: '64px' }}
        className="px-6"
      >
        <div className="mx-auto max-w-5xl">
          {/* Eyebrow */}
          <p
            className="text-sm font-medium tracking-widest uppercase mb-4"
            style={{ color: '#3678FF' }}
          >
            MathKix Blog
          </p>

          <h1
            className="font-bold tracking-tight"
            style={{ fontSize: '36px', lineHeight: '1.1', maxWidth: '600px' }}
          >
            Research, parenting insights, and the thinking behind MathKix.
          </h1>

          <p
            className="mt-4 text-base"
            style={{ color: '#94A3B8', maxWidth: '520px', lineHeight: '1.6' }}
          >
            Evidence-based articles on how children learn math — and how to
            help them do it better.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div
        className="mx-auto max-w-5xl px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      />

      {/* Post grid */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
                style={{
                  background: '#0E0F16',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Category badge */}
                <span
                  className="self-start rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider mb-4"
                  style={{ background: 'rgba(54,120,255,0.12)', color: '#3678FF' }}
                >
                  {post.category}
                </span>

                {/* Title */}
                <h2
                  className="font-semibold leading-snug mb-3 transition-colors duration-200 group-hover:text-white"
                  style={{ fontSize: '18px', color: '#e2e8f0' }}
                >
                  {post.title}
                </h2>

                {/* Description */}
                <p
                  className="text-sm flex-1 mb-5"
                  style={{
                    color: '#94A3B8',
                    lineHeight: '1.6',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.description}
                </p>

                {/* Meta + arrow */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3" style={{ color: '#64748B' }}>
                    <span className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3" />
                      {post.readTime} min
                    </span>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: '#3678FF' }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section
        className="px-6 py-20"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="mx-auto max-w-5xl flex flex-col items-center text-center gap-6">
          <h2
            className="font-bold tracking-tight"
            style={{ fontSize: '28px', lineHeight: '1.15' }}
          >
            Ready to see the difference?
          </h2>
          <p style={{ color: '#94A3B8', maxWidth: '400px', lineHeight: '1.6' }}>
            Adaptive math practice built on the same research you just read.
            Grades 1–5.
          </p>
          <Link
            href="/signup"
            className="cta-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: '#3678FF' }}
          >
            Start free trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
