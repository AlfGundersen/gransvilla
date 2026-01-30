import { createDataAttribute } from 'next-sanity'
import { EventsSectionComponent } from '@/components/sections/EventsSection'
import { FeaturedProductSectionComponent } from '@/components/sections/FeaturedProductSection'
import { FeaturedSectionComponent } from '@/components/sections/FeaturedSection'
import { HeroSectionComponent } from '@/components/sections/HeroSection'
import { TimelineSectionComponent } from '@/components/sections/TimelineSection'
import { sanityFetch } from '@/lib/sanity/live'
import { frontpageQuery } from '@/lib/sanity/queries'
import type { Frontpage } from '@/types/sanity'
import styles from './page.module.css'

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
      {frontpage.hero && (
        <div data-sanity={createDataAttribute({ id: frontpage._id, type: frontpage._type, path: 'hero' }).toString()}>
          <HeroSectionComponent
            data={{ ...frontpage.hero, _type: 'heroSection', _key: 'hero' }}
          />
        </div>
      )}

      {frontpage.featured && (
        <div data-sanity={createDataAttribute({ id: frontpage._id, type: frontpage._type, path: 'featured' }).toString()}>
          <FeaturedSectionComponent
            data={{ ...frontpage.featured, _type: 'featuredSection', _key: 'featured' }}
          />
        </div>
      )}

      {frontpage.events && (
        <div data-sanity={createDataAttribute({ id: frontpage._id, type: frontpage._type, path: 'events' }).toString()}>
          <EventsSectionComponent
            data={{ ...frontpage.events, _type: 'eventsSection', _key: 'events' }}
          />
        </div>
      )}

      {frontpage.timeline && (
        <div data-sanity={createDataAttribute({ id: frontpage._id, type: frontpage._type, path: 'timeline' }).toString()}>
          <TimelineSectionComponent
            data={{ ...frontpage.timeline, _type: 'timelineSection', _key: 'timeline' }}
          />
        </div>
      )}

      {frontpage.featuredProduct && (
        <div data-sanity={createDataAttribute({ id: frontpage._id, type: frontpage._type, path: 'featuredProduct' }).toString()}>
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
