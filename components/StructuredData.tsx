export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TankFindr',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://tankfindr.com',
    description: 'Septic tank locator tool - Find your septic tank instantly with GPS coordinates. 2.3M+ verified septic system records across 12 states. #1 septic tank finder for contractors and homeowners.',
    offers: [
      {
        '@type': 'Offer',
        price: '79',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Starter',
        description: '100 septic tank lookups per month',
        priceValidUntil: '2026-12-31',
      },
      {
        '@type': 'Offer',
        price: '159',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Pro',
        description: '300 septic tank lookups per month',
        priceValidUntil: '2026-12-31',
      },
      {
        '@type': 'Offer',
        price: '279',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Enterprise',
        description: 'Unlimited septic tank lookups',
        priceValidUntil: '2026-12-31',
      },
      {
        '@type': 'Offer',
        price: '69',
        priceCurrency: 'USD',
        name: 'TankFindr Inspector Pro',
        description: 'Unlimited septic system reports for home inspectors',
        priceValidUntil: '2026-12-31',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Organization',
      name: 'TankFindr',
      url: 'https://tankfindr.com',
    },
  }

  // FAQPage structured data
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I find my septic tank?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TankFindr provides GPS-accurate septic tank locations from government permit records. Simply enter your address to see if your property has a septic system and where the tank is located.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does my house have a septic tank or sewer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TankFindr can instantly tell you whether your property has a septic system or is connected to municipal sewer. We access 2.3M+ records across 12 states to provide accurate information.',
        },
      },
      {
        '@type': 'Question',
        name: 'How accurate are septic tank locations?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TankFindr uses GPS coordinates from official county permit records and state GIS databases, providing the most accurate septic tank locations available. Most locations are accurate within 10-20 feet.',
        },
      },
      {
        '@type': 'Question',
        name: 'What states does TankFindr cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TankFindr currently covers 12 states with over 2.3 million septic tank records. Coverage includes Florida, California, Virginia, New Mexico, Arizona, Oregon, and more. Check our coverage map for specific counties.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is my septic tank located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Your septic tank location can be found using TankFindr septic tank locator. Enter your property address and we will show you GPS coordinates and a map with the exact septic tank location from government permit records.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does a septic tank locator cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TankFindr septic tank locator starts at $79/month for contractors with 100 lookups, or $69/month for home inspectors with unlimited reports. Individual property reports are also available.',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  )
}
