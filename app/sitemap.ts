import { MetadataRoute } from 'next'
import { STATES } from '@/lib/stateData'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tankfindr.com'
  const currentDate = new Date()

  // Programmatic state coverage pages (the hub + one page per featured state).
  const stateEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/septic-records`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...STATES.map((s) => ({
      url: `${baseUrl}/septic-records/${s.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ]

  return [
    ...stateEntries,
    // Homepage - Highest priority
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    
    // Core Product Pages - Very High Priority
    {
      url: `${baseUrl}/pro`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/report`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    
    // Pricing & Product Pages - High Priority
    {
      url: `${baseUrl}/pricing-pro`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/inspector-pro`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    
    // NOTE: the old flat state slugs (/florida-septic-tank-locator, etc.) were
    // removed — California/Virginia never existed (404s) and Florida now lives
    // at /septic-records/florida. The flat slugs 301-redirect there (next.config).

    // Information Pages - Medium-High Priority
    {
      url: `${baseUrl}/coverage`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sample-report`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    
    // Blog - High Priority for SEO
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog/how-to-find-your-septic-tank`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/septic-vs-sewer-how-to-tell`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/septic-tank-inspection-checklist`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/florida-septic-tank-regulations`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/septic-tank-gps-coordinates-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/demo`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    
    // NOTE: auth pages (/auth/login, /auth/sign-up) intentionally excluded —
    // they have no crawl value and were diluting the sitemap. They are also
    // disallowed in robots.ts and carry noindex.

    // Legal Pages - Low Priority
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
