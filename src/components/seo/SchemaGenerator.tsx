import { urlFor } from '@/lib/sanity/image'
import { JsonLd } from './JsonLd'

interface SEOData {
  metaTitle?: string
  metaDescription?: string
  schemaType?: string
  ogImage?: { asset?: { _ref: string } }
  articleAuthor?: string
  faqItems?: { question: string; answer: string }[]
  eventLocation?: string
  eventPrice?: number
  serviceType?: string
  serviceArea?: string
}

interface DocumentData {
  _type: string
  _createdAt?: string
  _updatedAt?: string
  title: string
  description?: string
  slug?: { current: string }
  featuredImage?: { asset?: { _ref: string } }
  date?: string
  endDate?: string
}

interface SchemaGeneratorProps {
  seo?: SEOData
  document: DocumentData
  baseUrl?: string
}

function getAutoSchemaType(docType: string): string {
  switch (docType) {
    case 'event':
      return 'Event'
    case 'frontpage':
      return 'WebSite'
    case 'page':
    default:
      return 'WebPage'
  }
}

export function SchemaGenerator({ seo, document, baseUrl = 'https://gransvilla.no' }: SchemaGeneratorProps) {
  const schemaType = seo?.schemaType === 'auto' || !seo?.schemaType
    ? getAutoSchemaType(document._type)
    : seo.schemaType

  if (schemaType === 'none') {
    return null
  }

  const title = seo?.metaTitle || document.title
  const description = seo?.metaDescription || document.description
  const url = document.slug ? `${baseUrl}/${document.slug.current}` : baseUrl
  const image = seo?.ogImage?.asset
    ? urlFor(seo.ogImage).width(1200).height(630).url()
    : document.featuredImage?.asset
      ? urlFor(document.featuredImage).width(1200).height(630).url()
      : undefined

  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: title,
    description,
    url,
    ...(image && { image }),
  }

  // Article types
  if (['Article', 'NewsArticle', 'BlogPosting'].includes(schemaType)) {
    return (
      <JsonLd
        data={{
          ...baseSchema,
          headline: title,
          author: {
            '@type': 'Organization',
            name: seo?.articleAuthor || 'Grans Villa',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Grans Villa',
            url: baseUrl,
          },
          datePublished: document._createdAt,
          dateModified: document._updatedAt,
        }}
      />
    )
  }

  // FAQ Page
  if (schemaType === 'FAQPage' && seo?.faqItems?.length) {
    return (
      <JsonLd
        data={{
          ...baseSchema,
          mainEntity: seo.faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }}
      />
    )
  }

  // Event
  if (schemaType === 'Event') {
    return (
      <JsonLd
        data={{
          ...baseSchema,
          startDate: document.date,
          ...(document.endDate && { endDate: document.endDate }),
          location: {
            '@type': 'Place',
            name: seo?.eventLocation || 'Grans Villa',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Jahnebakken 6',
              addressLocality: 'Bergen',
              postalCode: '5007',
              addressCountry: 'NO',
            },
          },
          organizer: {
            '@type': 'Organization',
            name: 'Grans Villa',
            url: baseUrl,
          },
          ...(seo?.eventPrice !== undefined && {
            offers: {
              '@type': 'Offer',
              price: seo.eventPrice,
              priceCurrency: 'NOK',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />
    )
  }

  // Service
  if (schemaType === 'Service') {
    return (
      <JsonLd
        data={{
          ...baseSchema,
          provider: {
            '@type': 'Organization',
            name: 'Grans Villa',
            url: baseUrl,
          },
          ...(seo?.serviceType && { serviceType: seo.serviceType }),
          ...(seo?.serviceArea && {
            areaServed: {
              '@type': 'Place',
              name: seo.serviceArea,
            },
          }),
        }}
      />
    )
  }

  // AboutPage / ContactPage / WebPage (generic)
  return (
    <JsonLd
      data={{
        ...baseSchema,
        mainEntity: {
          '@type': 'Organization',
          name: 'Grans Villa',
          url: baseUrl,
        },
      }}
    />
  )
}
