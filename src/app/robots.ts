import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mathkix.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/billing/', '/account/', '/children/', '/admin/', '/support/'],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/science', '/pricing'],
        disallow: ['/api/', '/dashboard/', '/billing/', '/account/', '/children/', '/admin/', '/support/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/science', '/pricing'],
        disallow: ['/api/', '/dashboard/', '/billing/', '/account/', '/children/', '/admin/', '/support/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/science', '/pricing'],
        disallow: ['/api/', '/dashboard/', '/billing/', '/account/', '/children/', '/admin/', '/support/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/science', '/pricing'],
        disallow: ['/api/', '/dashboard/', '/billing/', '/account/', '/children/', '/admin/', '/support/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
