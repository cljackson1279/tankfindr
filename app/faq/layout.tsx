import type { Metadata } from 'next'
import { faqs } from './faqData'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers about TankFindr: how to find your septic tank, data accuracy and confidence tiers, pricing and the no-record refund guarantee, coverage by state, and how reports are delivered.',
  // CRITICAL FIX: this page previously had no metadata, so it inherited the
  // root layout's homepage canonical — telling Google /faq was a duplicate of
  // the homepage. It now has its own self-canonical.
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'TankFindr FAQ — Septic Tank Location, Accuracy & Pricing',
    description:
      'Everything about finding septic tanks with TankFindr: accuracy tiers, pricing, coverage, and delivery.',
    type: 'website',
    url: 'https://tankfindr.com/faq',
  },
}

// Build a real FAQPage schema from the SAME data the page renders, so the
// structured data matches the visible content (Google requirement). Array
// answers are joined into a single plain-text string.
function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: Array.isArray(faq.answer)
          ? faq.answer.filter(Boolean).join(' ')
          : faq.answer,
      },
    })),
  }
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }}
      />
      {children}
    </>
  )
}
