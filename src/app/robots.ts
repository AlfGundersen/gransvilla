import type { MetadataRoute } from 'next'
import { originFor } from '@/lib/i18n/config'

const BASE_URL = originFor('nb')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
