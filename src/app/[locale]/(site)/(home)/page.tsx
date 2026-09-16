import type { Metadata } from 'next'
import { EventsSectionComponent } from '@/components/sections/EventsSection'
import { FeaturedProductSectionComponent } from '@/components/sections/FeaturedProductSection'
import { FeaturedSectionComponent } from '@/components/sections/FeaturedSection'
import { HeroSectionComponent } from '@/components/sections/HeroSection'
import { TimelineSectionComponent } from '@/components/sections/TimelineSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { SchemaGenerator } from '@/components/seo/SchemaGenerator'
import { getWatermarkSrc } from '@/components/Watermark'
import { alternatesFor, openGraphLocale } from '@/lib/i18n/metadata'
import { getTranslator, translateContent } from '@/lib/i18n/server'
import { urlFor } from '@/lib/sanity/image'
import { sanityFetch } from '@/lib/sanity/live'
import { frontpageQuery } from '@/lib/sanity/queries'
import type { Frontpage } from '@/types/sanity'
import styles from '../page.module.css'

/**
 * Published Sanity content should not wait for the next deploy. Only the shop
 * pages revalidated, so an edit made after a build stayed invisible until
 * something else triggered one.
 */
export const revalidate = 60

type Params = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const t = getTranslator(locale)
  const { data } = await sanityFetch({ query: frontpageQuery })
  const frontpage = await translateContent(data, locale)

  const seo = frontpage?.seo
  const ogImage = seo?.ogImage?.asset
    ? urlFor(seo.ogImage).width(1200).height(630).url()
    : undefined

  return {
    title: seo?.metaTitle || t('Forside'),
    description: seo?.metaDescription || undefined,
    alternates: alternatesFor('/', locale),
    openGraph: {
      locale: openGraphLocale(locale),
      title: seo?.metaTitle || t('Forside'),
      description: seo?.metaDescription || undefined,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
  }
}

export default async function HomePage({ params }: Params) {
  const { locale } = await params
  const t = getTranslator(locale)
  const [{ data }, watermarkSrc] = await Promise.all([
    sanityFetch({ query: frontpageQuery }),
    getWatermarkSrc(),
  ])
  const frontpage = await translateContent(data, locale)

  // If no frontpage data from Sanity yet, show placeholder
  if (!frontpage) {
    return (
      <div className={styles.page}>
        <div className={styles.placeholder}>
          <p>{t('Opprett forsiden i Sanity Studio for å legge til innhold.')}</p>
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
          description: frontpage.seo?.metaDescription || t('Restaurant, kantine og arrangementer'),
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Jahnebakken 6',
            addressLocality: 'Bergen',
            postalCode: '5007',
            addressCountry: 'NO',
          },
        }}
      />
      <SchemaGenerator seo={frontpage.seo} document={{ ...frontpage, title: 'Grans Villa' }} />
      <h1 className="visually-hidden">{t('Gransvilla — Restaurant, kantine og arrangementer')}</h1>
      {frontpage.hero && (
        <HeroSectionComponent data={{ ...frontpage.hero, _type: 'heroSection', _key: 'hero' }} />
      )}

      {frontpage.featured && (
        <FeaturedSectionComponent
          locale={locale}
          data={{ ...frontpage.featured, _type: 'featuredSection', _key: 'featured' }}
        />
      )}

      {frontpage.events && (
        <EventsSectionComponent
          data={{ ...frontpage.events, _type: 'eventsSection', _key: 'events' }}
          watermarkSrc={watermarkSrc}
        />
      )}

      {frontpage.timeline && (
        <TimelineSectionComponent
          data={{ ...frontpage.timeline, _type: 'timelineSection', _key: 'timeline' }}
          watermarkSrc={watermarkSrc}
        />
      )}

      {frontpage.featuredProduct && (
        <FeaturedProductSectionComponent
          locale={locale}
          data={{
            ...frontpage.featuredProduct,
            _type: 'featuredProductSection',
            _key: 'featuredProduct',
          }}
        />
      )}
    </div>
  )
}
