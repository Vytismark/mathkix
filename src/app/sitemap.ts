import type { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog'
import { getPublishedDbPosts } from '@/lib/blog-db'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mathkix.com'

  const dbPosts = await getPublishedDbPosts()
  const dbSlugs = new Set(dbPosts.map((p) => p.slug))

  const staticRoutes: MetadataRoute.Sitemap = BLOG_POSTS
    .filter((p) => !dbSlugs.has(p.slug))
    .map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  const dbRoutes: MetadataRoute.Sitemap = dbPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...dbRoutes,
    ...staticRoutes,
    {
      url: baseUrl,
      lastModified: new Date('2026-03-18'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date('2026-03-18'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/science`,
      lastModified: new Date('2026-03-18'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2026-03-18'),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-03-17'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-03-17'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
