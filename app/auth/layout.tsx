import type { Metadata } from 'next'
import { noindexMetadata } from '@/lib/seo/noindex'

// Private route — kept crawlable so Google can read the noindex directive,
// then excluded from the index. See app/robots.ts for the full rationale.
export const metadata: Metadata = {
  ...noindexMetadata,
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
