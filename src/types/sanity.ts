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
  title?: string
  description?: string
  image?: SanityImage
}

// Timeline Section
export interface TimelineSection {
  _type: 'timelineSection'
  _key: string
  entries?: TimelineEntry[]
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
  | EventsSection
  | TimelineSection
  | ContentSection
  | FeaturedProductSection
  | NewsletterSection

// Frontpage document - singleton with predefined sections
export interface Frontpage {
  hero?: Omit<HeroSection, '_type' | '_key'>
  events?: Omit<EventsSection, '_type' | '_key'>
  timeline?: Omit<TimelineSection, '_type' | '_key'>
  featuredProduct?: Omit<FeaturedProductSection, '_type' | '_key'>
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: SanityImage
  }
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
