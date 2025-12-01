import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tankfindr.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/update-password',
          '/auth/error',
          '/pro/',
          '/inspector-pro/dashboard/',
          '/inspector-pro/report/',
          '/report/view/',
          '/account/',
          '/profile/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
