import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site-url'

const BASE_URL = siteUrl()

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
