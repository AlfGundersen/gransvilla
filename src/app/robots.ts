import type { MetadataRoute } from 'next'

const BASE_URL = `https://${process.env.NEXT_PUBLIC_SITE_URL || 'gransvilla.no'}`

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/api/', '/passord'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
