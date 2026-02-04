// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockContent = any[]

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
  assetAltText?: string
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
  description?: BlockContent
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
  description?: BlockContent
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
  description?: BlockContent
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
  body?: BlockContent
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
  description?: BlockContent
  placeholder?: string
  buttonText?: string
  successMessage?: string
}

// Event page section types

export interface TekstSeksjon {
  _type: 'tekstSeksjon'
  _key: string
  overskrift?: string
  tekst?: BlockContent
}

export type AspectRatio = '16/9' | '3/2' | '4/3' | '1/1' | '3/4' | '2/3'

export interface BildeSeksjon {
  _type: 'bildeSeksjon'
  _key: string
  bilde?: SanityImage & { alt?: string }
  bildeforhold?: AspectRatio
  fullBredde?: boolean
}

export interface BildeTekstSeksjon {
  _type: 'bildeTekstSeksjon'
  _key: string
  bilde?: SanityImage & { alt?: string }
  bildeforhold?: AspectRatio
  tekst?: BlockContent
  visOverskrift?: boolean
  overskrift?: string
  bildeForst?: boolean
}

export interface BildegalleriSeksjon {
  _type: 'bildegalleriSeksjon'
  _key: string
  visInnhold?: boolean
  overskrift?: string
  tekst?: BlockContent
  bildeforhold?: AspectRatio
  antallKolonner?: number
  bilder?: (SanityImage & { alt?: string })[]
}

export type EventPageSection = TekstSeksjon | BildeSeksjon | BildeTekstSeksjon | BildegalleriSeksjon

// Event document
export interface Event {
  _id: string
  _type: 'event'
  title: string
  slug: {
    current: string
  }
  description?: BlockContent
  featuredImage?: SanityImage & { alt?: string }
  sections?: EventPageSection[]
  products?: string[]
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
  _id: string
  _type: 'frontpage'
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

// Menu item (used in siteSettings navigation)
export interface MenuItem {
  customLink?: boolean
  label?: string
  href?: string
  page?: {
    _id: string
    _type: 'page' | 'event'
    title: string
    slug: {
      current: string
    }
  }
}

// Resolved navigation link (computed from MenuItem)
export interface NavLink {
  label: string
  href: string
}

// Social link
export interface SocialLink {
  platform: string
  url: string
}

export const socialPlatformLabels: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  twitter: 'X (Twitter)',
  spotify: 'Spotify',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  tripadvisor: 'Tripadvisor',
}

// Site Settings
export interface SiteSettings {
  siteName: string
  siteDescription?: string
  logo?: SanityImage
  favicon?: SanityImage
  mainMenu?: MenuItem[]
  footerMenu?: MenuItem[]
  contactInfo?: {
    email?: string
    phone?: string
    address?: BlockContent
  }
  openingHours?: {
    days: string
    hours: string
  }[]
  socialLinks?: SocialLink[]
}

// Personvernerklæring
export interface Personvernerklaering {
  firmanavn?: string
  orgnummer?: string
  adresse?: string
  epost?: string
  innhold?: BlockContent
  opprettet?: string
  oppdatert?: string
}

// Salgsvilkår
export interface Salgsvilkar {
  innhold?: BlockContent
}

// Arrangementer Settings
export interface ArrangementerSettings {
  heroLayout?: '1-1-2' | '1-3'
  beskrivelse?: BlockContent
  heroBilde?: SanityImage
}

// Shop Category (synced from Shopify)
export interface ShopCategory {
  _id: string
  title: string
  shopifyCollectionId: string
  shopifyHandle: string
  description: BlockContent | null
  order: number
}

// Page document
export interface Page {
  _id: string
  _type: 'page'
  title: string
  slug: {
    current: string
  }
  description?: BlockContent
  featuredImage?: SanityImage & { alt?: string }
  sections?: EventPageSection[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: SanityImage
  }
}
