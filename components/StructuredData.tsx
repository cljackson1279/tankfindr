export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TankFindr',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://tankfindr.com',
    description: 'Locate septic tanks 10x faster with GPS-accurate locations from government records. 2.3M+ tanks mapped across 12 states.',
    offers: [
      {
        '@type': 'Offer',
        price: '99',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Starter',
        description: '300 tank lookups per month',
      },
      {
        '@type': 'Offer',
        price: '249',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Pro',
        description: '1,500 tank lookups per month',
      },
      {
        '@type': 'Offer',
        price: '599',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Enterprise',
        description: 'Unlimited tank lookups',
      },
      {
        '@type': 'Offer',
        price: '79',
        priceCurrency: 'USD',
        name: 'TankFindr Inspector Pro',
        description: 'Unlimited septic system reports for home inspectors',
      },
      {
        '@type': 'Offer',
        price: '19',
        priceCurrency: 'USD',
        name: 'Property Septic Report',
        description: 'One-time septic system report for homeowners',
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
