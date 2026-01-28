import type { PageSection } from '@/types/sanity'
import { ContentSectionComponent } from './ContentSectionComp'
import { EventsSectionComponent } from './EventsSection'
import { FeaturedProductSectionComponent } from './FeaturedProductSection'
import { FeaturedSectionComponent } from './FeaturedSection'
import { HeroSectionComponent } from './HeroSection'
import { NewsletterSectionComponent } from './NewsletterSection'
import { TimelineSectionComponent } from './TimelineSection'

interface SectionRendererProps {
  sections: PageSection[]
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <>
      {sections.map((section) => {
        switch (section._type) {
          case 'heroSection':
            return <HeroSectionComponent key={section._key} data={section} />
          case 'featuredSection':
            return <FeaturedSectionComponent key={section._key} data={section} />
          case 'eventsSection':
            return <EventsSectionComponent key={section._key} data={section} />
          case 'timelineSection':
            return <TimelineSectionComponent key={section._key} data={section} />
          case 'contentSection':
            return <ContentSectionComponent key={section._key} data={section} />
          case 'featuredProductSection':
            return <FeaturedProductSectionComponent key={section._key} data={section} />
          case 'newsletter':
            return <NewsletterSectionComponent key={section._key} data={section} />
          default:
            console.warn('Unknown section type:', (section as { _type: string })._type)
            return null
        }
      })}
    </>
  )
}
