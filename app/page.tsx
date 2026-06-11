import type { Metadata } from 'next'
import HomePage from './HomeClient'

// Server wrapper so the homepage gets page-level metadata (the client
// component itself cannot export metadata). The canonical lives HERE, not in
// the root layout, so other pages no longer inherit a homepage canonical.
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default function Page() {
  return <HomePage />
}
