// Document types
import event from './documents/event'
import frontpage from './documents/frontpage'
import navigation from './documents/navigation'
import page from './documents/page'
import siteSettings from './documents/siteSettings'

// Object types
import blockContent from './objects/blockContent'
import link from './objects/link'
import seo from './objects/seo'

// Page sections - Predefined section types with variations
import contentSection from './sections/contentSection'
import eventsSection from './sections/eventsSection'
import featuredProductSection from './sections/featuredProductSection'
import heroSection from './sections/heroSection'
import newsletter from './sections/newsletter'
import timelineSection from './sections/timelineSection'

export const schemaTypes = [
  // Documents
  frontpage,
  page,
  siteSettings,
  navigation,
  event,

  // Objects
  blockContent,
  link,
  seo,

  // Sections
  heroSection,
  eventsSection,
  timelineSection,
  contentSection,
  featuredProductSection,
  newsletter,
]
