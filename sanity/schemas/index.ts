// Document types
import event from './documents/event'
import frontpage from './documents/frontpage'
import page from './documents/page'
import shopCategory from './documents/shopCategory'
import siteSettings from './documents/siteSettings'

// Object types
import blockContent from './objects/blockContent'
import seo from './objects/seo'

// Page sections - Predefined section types with variations
import contentSection from './sections/contentSection'
import eventsSection from './sections/eventsSection'
import featuredProductSection from './sections/featuredProductSection'
import featuredSection from './sections/featuredSection'
import heroSection from './sections/heroSection'
import newsletter from './sections/newsletter'
import timelineSection from './sections/timelineSection'

// Event page sections
import tekstSeksjon from './sections/tekstSeksjon'
import bildeSeksjon from './sections/bildeSeksjon'
import bildeTekstSeksjon from './sections/bildeTekstSeksjon'
import bildegalleriSeksjon from './sections/bildegalleriSeksjon'

export const schemaTypes = [
  // Documents
  frontpage,
  page,
  siteSettings,
  event,
  shopCategory,

  // Objects
  blockContent,
  seo,

  // Sections
  heroSection,
  featuredSection,
  eventsSection,
  timelineSection,
  contentSection,
  featuredProductSection,
  newsletter,

  // Event page sections
  tekstSeksjon,
  bildeSeksjon,
  bildeTekstSeksjon,
  bildegalleriSeksjon,
]
