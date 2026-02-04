import type { MetadataRoute } from 'next'
import { groq } from 'next-sanity'
import { client } from '@/lib/sanity/client'
import { getProducts } from '@/lib/shopify'

const BASE_URL = `https://${process.env.NEXT_PUBLIC_SITE_URL || 'gransvilla.no'}`

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/nettbutikk`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/arrangementer`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/om-oss`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/kantine`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/kontakt`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/praktisk-info`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Dynamic Sanity pages and events
  const [pages, events] = await Promise.all([
    client.fetch<{ slug: string; _updatedAt: string }[]>(
      groq`*[_type == "page" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    ),
    client.fetch<{ slug: string; _updatedAt: string }[]>(
      groq`*[_type == "event" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    ),
  ])

  const sanityRoutes: MetadataRoute.Sitemap = [...pages, ...events].map((doc) => ({
    url: `${BASE_URL}/${doc.slug}`,
    lastModified: doc._updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Shopify products
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const products = await getProducts(100)
    productRoutes = products.map((product) => ({
      url: `${BASE_URL}/nettbutikk/${product.handle}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // Shopify fetch may fail during build; skip product URLs
  }

  return [...staticRoutes, ...sanityRoutes, ...productRoutes]
}
