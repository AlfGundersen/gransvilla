import { groq } from 'next-sanity'

// Image fragment — includes asset alt text from media library as fallback
const imageFragment = groq`
  asset,
  "assetAltText": asset->altText,
  hotspot,
  crop
`

// Frontpage query - singleton document
export const frontpageQuery = groq`
  *[_type == "frontpage"][0] {
    _id,
    _type,
    hero {
      image {
        ${imageFragment}
      },
      heading,
      ctaText,
      ctaHref
    },
    featured {
      columns[] {
        _key,
        heading,
        "description": description[defined(_type)],
        link-> {
          _id,
          _type,
          title,
          slug
        },
        image {
          ${imageFragment},
          alt
        }
      }
    },
    events {
      items[] {
        _key,
        imageLayout,
        event-> {
          _id,
          title,
          slug,
          description
        },
        image1 {
          ${imageFragment},
          alt
        },
        image2 {
          ${imageFragment},
          alt
        }
      }
    },
    timeline {
      image {
        ${imageFragment},
        alt
      },
      heading,
      entries[] {
        _key,
        year,
        "description": description[defined(_type)]
      }
    },
    featuredProduct {
      productHandle
    },
    newsletter {
      heading,
      "description": description[defined(_type)],
      placeholder,
      buttonText,
      successMessage
    },
    seo {
      metaTitle,
      metaDescription,
      ogImage {
        asset
      }
    }
  }
`

// Fragment for hero section
const heroSectionFragment = groq`
  _type == "heroSection" => {
    image {
      ${imageFragment}
    },
    heading,
    ctaText,
    ctaHref
  }
`

// Fragment for featured section
const featuredSectionFragment = groq`
  _type == "featuredSection" => {
    columns[] {
      _key,
      heading,
      "description": description[defined(_type)],
      link-> {
        _id,
        title,
        slug
      },
      image {
        ${imageFragment},
        alt
      }
    }
  }
`

// Fragment for events section
const eventsSectionFragment = groq`
  _type == "eventsSection" => {
    items[] {
      _key,
      imageLayout,
      event-> {
        _id,
        title,
        slug,
        description
      },
      image1 {
        ${imageFragment},
        alt
      },
      image2 {
        ${imageFragment},
        alt
      }
    }
  }
`

// Fragment for timeline section
const timelineSectionFragment = groq`
  _type == "timelineSection" => {
    image {
      ${imageFragment},
      alt
    },
    heading,
    entries[] {
      _key,
      year,
      "description": description[defined(_type)]
    }
  }
`

// Fragment for content section
const contentSectionFragment = groq`
  _type == "contentSection" => {
    image {
      ${imageFragment},
      alt
    },
    labelText,
    heading,
    "body": body[defined(_type)],
    ctaText,
    ctaHref,
    imagePosition
  }
`

// Fragment for featured product section
const featuredProductSectionFragment = groq`
  _type == "featuredProductSection" => {
    productHandle
  }
`

// Fragment for newsletter section
const newsletterFragment = groq`
  _type == "newsletter" => {
    heading,
    "description": description[defined(_type)],
    placeholder,
    buttonText,
    successMessage
  }
`

// All sections fragment
const sectionsFragment = groq`
  sections[] {
    _type,
    _key,
    ${heroSectionFragment},
    ${featuredSectionFragment},
    ${eventsSectionFragment},
    ${timelineSectionFragment},
    ${contentSectionFragment},
    ${featuredProductSectionFragment},
    ${newsletterFragment}
  }
`

// Menu item fragment
const menuItemFragment = groq`
  customLink,
  label,
  href,
  page-> {
    _id,
    _type,
    title,
    slug
  }
`

// Site settings query
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    siteName,
    siteDescription,
    logo {
      asset
    },
    favicon {
      asset
    },
    mainMenu[] {
      ${menuItemFragment}
    },
    footerMenu[] {
      ${menuItemFragment}
    },
    contactInfo {
      email,
      phone,
      "address": address[defined(_type)]
    },
    openingHours[] {
      days,
      hours
    },
    socialLinks[] {
      platform,
      url
    }
  }
`

// Arrangementer settings query
export const arrangementerSettingsQuery = groq`
  *[_type == "arrangementerSettings"][0] {
    heroLayout,
    "beskrivelse": beskrivelse[defined(_type)],
    heroBilde {
      ${imageFragment}
    }
  }
`

// Events query
export const eventsQuery = groq`
  *[_type == "event"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    featuredImage {
      ${imageFragment},
      alt
    }
  }
`

// Event page sections fragment
const eventSectionsFragment = groq`
  sections[] {
    _type,
    _key,
    _type == "tekstSeksjon" => {
      overskrift,
      "tekst": tekst[defined(_type)]
    },
    _type == "bildeSeksjon" => {
      bilde {
        ${imageFragment},
        alt
      },
      bildeforhold,
      fullBredde
    },
    _type == "bildeTekstSeksjon" => {
      bilde {
        ${imageFragment},
        alt
      },
      bildeforhold,
      "tekst": tekst[defined(_type)],
      visOverskrift,
      overskrift,
      bildeForst
    },
    _type == "bildegalleriSeksjon" => {
      visInnhold,
      overskrift,
      "tekst": tekst[defined(_type)],
      bildeforhold,
      antallKolonner,
      bilder[] {
        ${imageFragment},
        alt
      }
    }
  }
`

// Single event query
export const eventQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    description,
    featuredImage {
      ${imageFragment},
      alt
    },
    ${eventSectionsFragment},
    "products": products[].productHandle
  }
`

// Page query - fetches a page by slug with all sections
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    description,
    featuredImage {
      ${imageFragment},
      alt
    },
    ${eventSectionsFragment},
    seo {
      metaTitle,
      metaDescription,
      ogImage {
        asset
      }
    }
  }
`

// Personvernerklæring query
export const personvernQuery = groq`
  *[_type == "personvernerklaering"][0] {
    "innhold": innhold[defined(_type)],
    opprettet,
    oppdatert
  }
`

// Shop categories query
export const shopCategoriesQuery = groq`
  *[_type == "shopCategory"] | order(order asc) {
    _id,
    title,
    shopifyCollectionId,
    shopifyHandle,
    description,
    order
  }
`

// Events by product handle query - find events that reference a specific product
export const eventsByProductHandleQuery = groq`
  *[_type == "event" && $handle in products[].productHandle] {
    _id,
    title,
    slug
  }
`
