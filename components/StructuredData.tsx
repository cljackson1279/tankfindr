export function StructuredData() {
  // Organization schema
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TankFindr',
    url: 'https://tankfindr.com',
    logo: 'https://tankfindr.com/icon-512.png',
    description: 'The #1 septic tank locator tool trusted by contractors, inspectors, and homeowners across America.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/tankfindr',
      'https://facebook.com/tankfindr',
      'https://linkedin.com/company/tankfindr'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@tankfindr.com',
      availableLanguage: 'English'
    }
  }

  // SoftwareApplication schema
  const softwareData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TankFindr - Septic Tank Locator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://tankfindr.com',
    description: 'Professional septic tank locator tool - Find septic tanks instantly with GPS coordinates. Access 2.5M+ septic system records across 20 states, sourced from government permit databases with transparent data quality labels.',
    offers: [
      {
        '@type': 'Offer',
        price: '79',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Starter',
        description: '100 septic tank lookups per month for contractors',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://tankfindr.com/pricing-pro'
      },
      {
        '@type': 'Offer',
        price: '159',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Professional',
        description: '300 septic tank lookups per month with priority support',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://tankfindr.com/pricing-pro'
      },
      {
        '@type': 'Offer',
        price: '279',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Enterprise',
        description: 'Unlimited septic tank lookups with API access',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://tankfindr.com/pricing-pro'
      },
      {
        '@type': 'Offer',
        price: '69',
        priceCurrency: 'USD',
        name: 'TankFindr Inspector Pro',
        description: 'Unlimited septic system reports for home inspectors',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://tankfindr.com/inspector-pro'
      },
    ],
    // NOTE: aggregateRating removed — only add this back once real, verifiable
    // customer reviews are collected and displayed on-page (Google policy
    // requires visible reviews backing any rating markup).
    author: {
      '@type': 'Organization',
      name: 'TankFindr',
      url: 'https://tankfindr.com',
    },
    featureList: [
      'GPS-accurate septic tank locations',
      '2.5M+ septic system records',
      'Coverage across 20 states',
      'Instant septic tank lookup by address',
      'Septic vs sewer identification',
      'Government permit record access',
      'Mobile-friendly interface',
      'Export to PDF reports'
    ]
  }

  // Service schema
  const serviceData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Septic Tank Location Service',
    description: 'Professional septic tank locator service providing GPS-accurate locations from government permit records',
    provider: {
      '@type': 'Organization',
      name: 'TankFindr'
    },
    areaServed: [
      { '@type': 'State', name: 'Florida' },
      { '@type': 'State', name: 'New Mexico' },
      { '@type': 'State', name: 'California' },
      { '@type': 'State', name: 'Virginia' },
      { '@type': 'State', name: 'Vermont' },
      { '@type': 'State', name: 'Pennsylvania' },
      { '@type': 'State', name: 'North Carolina' },
      { '@type': 'State', name: 'Maryland' },
      { '@type': 'State', name: 'Iowa' },
      { '@type': 'State', name: 'Indiana' }
    ],
    serviceType: 'Septic Tank Locator',
    audience: {
      '@type': 'Audience',
      audienceType: 'Contractors, Home Inspectors, Homeowners'
    }
  }

  // NOTE: The generic 8-question FAQPage that used to live here (injected on
  // EVERY page) was removed. A real, complete FAQPage schema now lives on /faq
  // (app/faq/layout.tsx), built from the same data the page renders. Duplicating
  // a generic FAQ site-wide is a schema-quality problem and risked mismatched
  // structured data on non-FAQ pages.

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceData) }}
      />
    </>
  )
}
