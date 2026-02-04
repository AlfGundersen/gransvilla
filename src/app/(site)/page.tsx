import type { Metadata } from 'next'
import { createDataAttribute } from 'next-sanity'
import { EventsSectionComponent } from '@/components/sections/EventsSection'
import { FeaturedProductSectionComponent } from '@/components/sections/FeaturedProductSection'
import { FeaturedSectionComponent } from '@/components/sections/FeaturedSection'
import { HeroSectionComponent } from '@/components/sections/HeroSection'
import { TimelineSectionComponent } from '@/components/sections/TimelineSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { SchemaGenerator } from '@/components/seo/SchemaGenerator'
import { urlFor } from '@/lib/sanity/image'
import { sanityFetch } from '@/lib/sanity/live'
import { frontpageQuery } from '@/lib/sanity/queries'
import type { Frontpage } from '@/types/sanity'
import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const { data: frontpage } = await sanityFetch({ query: frontpageQuery })

  const seo = frontpage?.seo
  const ogImage = seo?.ogImage?.asset ? urlFor(seo.ogImage).width(1200).height(630).url() : undefined

  return {
    title: seo?.metaTitle || 'Forside',
    description: seo?.metaDescription || undefined,
    openGraph: {
      title: seo?.metaTitle || 'Forside',
      description: seo?.metaDescription || undefined,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
  }
}

export default async function HomePage() {
  const { data: frontpage } = await sanityFetch({ query: frontpageQuery })

  // If no frontpage data from Sanity yet, show placeholder
  if (!frontpage) {
    return (
      <div className={styles.page}>
        <div className={styles.placeholder}>
          <p>Opprett forsiden i Sanity Studio for å legge til innhold.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          '@id': 'https://gransvilla.no/#localbusiness',
          name: 'Grans Villa',
          url: 'https://gransvilla.no',
          description: frontpage.seo?.metaDescription || 'Restaurant, kantine og arrangementer',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Jahnebakken 6',
            addressLocality: 'Bergen',
            postalCode: '5007',
            addressCountry: 'NO',
          },
        }}
      />
      <SchemaGenerator
        seo={frontpage.seo}
        document={{ ...frontpage, title: 'Grans Villa' }}
      />
      <h1 className="visually-hidden">Gransvilla — Restaurant, kantine og arrangementer</h1>
      {frontpage.hero && (
        <div
          data-sanity={createDataAttribute({
            id: frontpage._id,
            type: frontpage._type,
            path: 'hero',
          }).toString()}
        >
          <HeroSectionComponent data={{ ...frontpage.hero, _type: 'heroSection', _key: 'hero' }} />
        </div>
      )}

      {frontpage.featured && (
        <div
          data-sanity={createDataAttribute({
            id: frontpage._id,
            type: frontpage._type,
            path: 'featured',
          }).toString()}
        >
          <FeaturedSectionComponent
            data={{ ...frontpage.featured, _type: 'featuredSection', _key: 'featured' }}
            documentId={frontpage._id}
            documentType={frontpage._type}
          />
        </div>
      )}

      {frontpage.events && (
        <div
          data-sanity={createDataAttribute({
            id: frontpage._id,
            type: frontpage._type,
            path: 'events',
          }).toString()}
        >
          <EventsSectionComponent
            data={{ ...frontpage.events, _type: 'eventsSection', _key: 'events' }}
          />
        </div>
      )}

      {frontpage.timeline && (
        <div
          data-sanity={createDataAttribute({
            id: frontpage._id,
            type: frontpage._type,
            path: 'timeline',
          }).toString()}
        >
          <TimelineSectionComponent
            data={{ ...frontpage.timeline, _type: 'timelineSection', _key: 'timeline' }}
            documentId={frontpage._id}
            documentType={frontpage._type}
          />
        </div>
      )}

      {frontpage.featuredProduct && (
        <div
          data-sanity={createDataAttribute({
            id: frontpage._id,
            type: frontpage._type,
            path: 'featuredProduct',
          }).toString()}
        >
          <FeaturedProductSectionComponent
            data={{
              ...frontpage.featuredProduct,
              _type: 'featuredProductSection',
              _key: 'featuredProduct',
            }}
          />
        </div>
      )}
    </div>
  )
}
