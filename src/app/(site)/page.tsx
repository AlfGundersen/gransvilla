import { EventsSectionComponent } from '@/components/sections/EventsSection'
import { FeaturedProductSectionComponent } from '@/components/sections/FeaturedProductSection'
import { HeroSectionComponent } from '@/components/sections/HeroSection'
import { TimelineSectionComponent } from '@/components/sections/TimelineSection'
import { client } from '@/lib/sanity/client'
import { frontpageQuery } from '@/lib/sanity/queries'
import type { Frontpage } from '@/types/sanity'
import styles from './page.module.css'

export default async function HomePage() {
  const frontpage = await client.fetch<Frontpage | null>(frontpageQuery)

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
        <HeroSectionComponent
          data={{ ...frontpage.hero, _type: 'heroSection', _key: 'hero' }}
        />
      )}

      {frontpage.events && (
        <EventsSectionComponent
          data={{ ...frontpage.events, _type: 'eventsSection', _key: 'events' }}
        />
      )}

      {frontpage.timeline && (
        <TimelineSectionComponent
          data={{ ...frontpage.timeline, _type: 'timelineSection', _key: 'timeline' }}
        />
      )}

      {frontpage.featuredProduct && (
        <FeaturedProductSectionComponent
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
