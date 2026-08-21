import { MetadataRoute } from 'next'

/**
 * robots.txt
 *
 * IMPORTANT — why almost nothing is disallowed here:
 *
 * `Disallow` blocks *crawling*, not *indexing*. If Google discovers a URL
 * through an internal link or a backlink, it can still index that URL even
 * when robots.txt forbids crawling it — it just indexes a bare, snippet-less
 * result. Worse, because it is never allowed to fetch the page, it can never
 * see a `noindex` directive telling it to drop the URL.
 *
 * That is exactly how https://tankfindr.com/auth/login ended up in Google
 * Search Console under "Indexed, though blocked by robots.txt": it was
 * disallowed here, linked from the site, and had no noindex.
 *
 * The correct pattern for private-but-harmless routes (auth, account,
 * dashboards) is the inverse of what looks intuitive:
 *
 *   ALLOW crawling  +  emit `noindex, follow` in the route's metadata
 *
 * Google then fetches the page, reads the directive, and drops it cleanly.
 * Those noindex directives live in the `layout.tsx` of each private route
 * segment. If you add a new private section, add a noindex layout there —
 * do NOT add it to the disallow list below.
 *
 * Only `/api/` stays disallowed: it returns JSON, has no indexable content,
 * and crawling it wastes crawl budget on endpoints that may be expensive.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tankfindr.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
