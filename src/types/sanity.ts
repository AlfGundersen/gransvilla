// Sanity Types for Section System

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  alt?: string
}

// Hero Section
export interface HeroSection {
  _type: 'heroSection'
  _key: string
  image?: SanityImage
}

// Event reference for sections
export interface EventReference {
  _id: string
  title: string
  slug: {
    current: string
  }
}

// Event item with images for EventsSection
export interface EventItem {
  _key: string
  imageLayout?: '1' | '2'
  event: EventReference
  image1?: SanityImage & { alt?: string }
  image2?: SanityImage & { alt?: string }
}

// Events Section (Arrangementer)
export interface EventsSection {
  _type: 'eventsSection'
  _key: string
  items?: EventItem[]
}

// Timeline Entry
export interface TimelineEntry {
  _key: string
  year: number
  // title?: string  // Re-enable when per-year titles are needed
  description?: string
  // image?: SanityImage  // Re-enable when per-year images are needed
}

// Timeline Section
export interface TimelineSection {
  _type: 'timelineSection'
  _key: string
  image?: SanityImage & { alt?: string }
  heading?: string
  entries?: TimelineEntry[]
}

// Featured Column
export interface FeaturedColumn {
  _key: string
  heading?: string
  description?: string
  link?: {
    _id: string
    _type: 'page' | 'event'
    title: string
    slug: {
      current: string
    }
  }
  image?: SanityImage & { alt?: string }
}

// Featured Section (2-column layout)
export interface FeaturedSection {
  _type: 'featuredSection'
  _key: string
  columns?: FeaturedColumn[]
}

// Content Section (for generic pages)
export interface ContentSection {
  _type: 'contentSection'
  _key: string
  image?: SanityImage & { alt?: string }
  labelText?: string
  heading?: string
  body?: string
  ctaText?: string
  ctaHref?: string
  imagePosition?: 'left' | 'right'
}

// Featured Product Section
export interface FeaturedProductSection {
  _type: 'featuredProductSection'
  _key: string
  productHandle?: string
}

// Newsletter Section
export interface NewsletterSection {
  _type: 'newsletter'
  _key: string
  heading?: string
  description?: string
  placeholder?: string
  buttonText?: string
  successMessage?: string
}

// Union of all section types
export type PageSection =
  | HeroSection
  | FeaturedSection
  | EventsSection
  | TimelineSection
  | ContentSection
  | FeaturedProductSection
  | NewsletterSection

// Frontpage document - singleton with predefined sections
export interface Frontpage {
  hero?: Omit<HeroSection, '_type' | '_key'>
  featured?: Omit<FeaturedSection, '_type' | '_key'>
  events?: Omit<EventsSection, '_type' | '_key'>
  timeline?: Omit<TimelineSection, '_type' | '_key'>
  featuredProduct?: Omit<FeaturedProductSection, '_type' | '_key'>
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: SanityImage
  }
}

// Shop Category (synced from Shopify)
export interface ShopCategory {
  _id: string
  title: string
  shopifyCollectionId: string
  shopifyHandle: string
  description: string | null
  order: number
}

// Page document
export interface Page {
  _id: string
  title: string
  slug: {
    current: string
  }
  sections?: PageSection[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: SanityImage
  }
}
