import { groq } from 'next-sanity'

// Image fragment
const imageFragment = groq`
  asset,
  hotspot,
  crop
`

// Frontpage query - singleton document
export const frontpageQuery = groq`
  *[_type == "frontpage"][0] {
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
        description,
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
          slug
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
        description
      }
    },
    featuredProduct {
      productHandle
    },
    newsletter {
      heading,
      description,
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
      description,
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
        slug
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
      description
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
    body,
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
    description,
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

// Page query - fetches a page by slug with all sections
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    ${sectionsFragment},
    seo {
      metaTitle,
      metaDescription,
      ogImage {
        asset
      }
    }
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
    contactInfo {
      email,
      phone,
      address
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

// Events query
export const eventsQuery = groq`
  *[_type == "event"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    image {
      ${imageFragment}
    }
  }
`

// Single event query
export const eventQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    body,
    image {
      ${imageFragment}
    }
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
