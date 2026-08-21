import type { Metadata } from 'next'

/**
 * Shared `noindex, follow` metadata for private application routes.
 *
 * Use this in the `layout.tsx` of any route segment that should not appear in
 * search results: auth screens, account settings, and logged-in dashboards.
 *
 * Why `follow` and not `nofollow`?
 *   `noindex` keeps the page itself out of the index. `follow` still lets link
 *   equity flow through any links on the page back into the public site, so we
 *   drop the page without throwing away its outbound link value.
 *
 * Why this instead of a robots.txt `Disallow`?
 *   A disallowed page can never be fetched, so Google can never read this
 *   directive — it just indexes a bare URL instead. See the long comment in
 *   `app/robots.ts`. These routes MUST stay crawlable for noindex to work.
 */
export const noindexMetadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
}
