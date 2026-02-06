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
    description: 'Professional septic tank locator tool - Find septic tanks instantly with GPS coordinates. Access 2.3M+ verified septic system records across 12 states. Trusted by 10,000+ contractors and home inspectors.',
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '247',
      bestRating: '5',
      worstRating: '1',
      reviewCount: '189'
    },
    author: {
      '@type': 'Organization',
      name: 'TankFindr',
      url: 'https://tankfindr.com',
    },
    featureList: [
      'GPS-accurate septic tank locations',
      '2.3M+ verified septic system records',
      'Coverage across 12 states',
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
      {
        '@type': 'State',
        name: 'Florida'
      },
      {
        '@type': 'State',
        name: 'California'
      },
      {
        '@type': 'State',
        name: 'Virginia'
      },
      {
        '@type': 'State',
        name: 'New Mexico'
      },
      {
        '@type': 'State',
        name: 'Arizona'
      },
      {
        '@type': 'State',
        name: 'Oregon'
      }
    ],
    serviceType: 'Septic Tank Locator',
    audience: {
      '@type': 'Audience',
      audienceType: 'Contractors, Home Inspectors, Homeowners'
    }
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
          text: 'To find your septic tank, use TankFindr septic tank locator. Simply enter your property address and TankFindr will show you GPS-accurate septic tank locations from government permit records. Most locations are accurate within 10-20 feet. TankFindr has 2.3M+ verified septic system records across 12 states.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does my house have a septic tank or sewer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TankFindr can instantly tell you whether your property has a septic system or is connected to municipal sewer. Enter your address and TankFindr will search 2.3M+ government records across 12 states to determine if your home has a septic tank. If no septic system is found, your property is likely on city sewer.',
        },
      },
      {
        '@type': 'Question',
        name: 'How accurate are septic tank locations?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TankFindr septic tank locations are highly accurate, typically within 10-20 feet. We use GPS coordinates from official county permit records and state GIS databases. All septic tank locations come from verified government sources including Florida DEP, California county health departments, and other state environmental agencies.',
        },
      },
      {
        '@type': 'Question',
        name: 'What states does TankFindr cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TankFindr currently covers 12 states with over 2.3 million septic tank records. Full coverage includes Florida (2.1M+ records), California (Sonoma County), Virginia (Fairfax County), New Mexico (statewide), and more. Check our coverage map at tankfindr.com/coverage for specific counties and states.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is my septic tank located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Your septic tank location can be found instantly using TankFindr. Enter your property address at tankfindr.com and we will show you GPS coordinates and an interactive map with the exact septic tank location from government permit records. TankFindr provides the most accurate septic tank locations available from official county and state databases.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does a septic tank locator cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TankFindr septic tank locator pricing starts at $79/month for contractors (100 lookups), $159/month for professionals (300 lookups), or $279/month for enterprise (unlimited). Home inspectors can get unlimited septic reports for $69/month. Individual property reports are also available. All plans include GPS-accurate locations and access to 2.3M+ verified records.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I find septic tank records by address?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, TankFindr allows you to find septic tank records by address. Simply enter any property address and TankFindr will search government permit databases to find septic tank location, permit number, installation date, and system type. Access 2.3M+ septic tank records across 12 states instantly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is TankFindr free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TankFindr offers a free coverage check to see if your area is covered. Professional plans start at $69/month for home inspectors and $79/month for contractors. All plans include access to 2.3M+ verified septic tank records with GPS-accurate locations. Try TankFindr free to check if your property has a septic system.',
        },
      },
    ],
  }

  // BreadcrumbList schema
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://tankfindr.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Septic Tank Locator',
        item: 'https://tankfindr.com'
      }
    ]
  }

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </>
  )
}
