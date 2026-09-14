import type { MetadataRoute } from 'next'
import { groq } from 'next-sanity'
import { defaultLocale, type Locale, locales, originFor } from '@/lib/i18n/config'
import { client } from '@/lib/sanity/client'
import { getProducts } from '@/lib/shopify'

/**
 * One sitemap covering both languages.
 *
 * Every path exists in both languages — English under the `/en` prefix — so
 * each entry carries the hreflang pair.
 *
 * Paths come from the routes and Sanity slugs that actually exist. The previous
 * hardcoded list had drifted: /kantine and /praktisk-info were listed but have
 * no Sanity document, and /om-oss appeared twice because it is also a Sanity
 * page.
 */
function entry(
  path: string,
  rest: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>,
): MetadataRoute.Sitemap[number] {
  const clean = path === '/' ? '' : path
  const join = (l: Locale) => (clean ? `${originFor(l)}${clean}` : originFor(l))

  return {
    url: join(defaultLocale),
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, join(l)])) },
    ...rest,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appRoutes: MetadataRoute.Sitemap = [
    entry('/', { changeFrequency: 'weekly', priority: 1 }),
    entry('/butikken', { changeFrequency: 'daily', priority: 0.9 }),
    entry('/arrangementer', { changeFrequency: 'weekly', priority: 0.8 }),
    entry('/kontakt', { changeFrequency: 'monthly', priority: 0.6 }),
    entry('/personvern', { changeFrequency: 'yearly', priority: 0.3 }),
    entry('/salgsvilkar', { changeFrequency: 'yearly', priority: 0.3 }),
  ]

  const [pages, events] = await Promise.all([
    client.fetch<{ slug: string; _updatedAt: string }[]>(
      groq`*[_type == "page" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    ),
    client.fetch<{ slug: string; _updatedAt: string }[]>(
      groq`*[_type == "event" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    ),
  ])

  const sanityRoutes: MetadataRoute.Sitemap = [...pages, ...events].map((doc) =>
    entry(`/${doc.slug}`, {
      lastModified: doc._updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  )

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const products = await getProducts(100)
    productRoutes = products.map((product) =>
      entry(`/butikken/${product.handle}`, { changeFrequency: 'weekly', priority: 0.8 }),
    )
  } catch {
    // Shopify fetch may fail during build; skip product URLs
  }

  const all = [...appRoutes, ...sanityRoutes, ...productRoutes]
  return all.filter((route, i) => all.findIndex((r) => r.url === route.url) === i)
}
