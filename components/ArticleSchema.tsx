interface ArticleSchemaProps {
  title: string
  description: string
  slug: string
  datePublished: string // ISO yyyy-mm-dd
  dateModified?: string
}

/**
 * Emits BlogPosting (Article) JSON-LD for a blog post. AI assistants and Google
 * strongly favor attributed, dated articles — these posts previously had no
 * Article schema, author, or publish date in structured form.
 */
export function ArticleSchema({
  title,
  description,
  slug,
  datePublished,
  dateModified,
}: ArticleSchemaProps) {
  const url = `https://tankfindr.com/blog/${slug}`
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: 'https://tankfindr.com/opengraph-image.png',
    author: {
      '@type': 'Organization',
      name: 'TankFindr',
      url: 'https://tankfindr.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TankFindr',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tankfindr.com/icon-512.png',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
