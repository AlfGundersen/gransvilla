import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import { locales } from '@/lib/i18n/config'
import { alternatesFor, openGraphLocale } from '@/lib/i18n/metadata'
import { getTranslator, translateContent } from '@/lib/i18n/server'
import { sanityFetch } from '@/lib/sanity/live'
import { eventsByProductHandleQuery } from '@/lib/sanity/queries'
import { getProductByHandle, getProducts } from '@/lib/shopify'
import { ProductGallery } from './ProductGallery'
import { ProductInfo } from './ProductInfo'
import styles from './page.module.css'

interface RelatedEvent {
  _id: string
  title: string
  slug: { current: string }
}

export const revalidate = 60
export const dynamicParams = true

interface Props {
  params: Promise<{ locale: string; handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params
  const t = getTranslator(locale)
  const product = translateContent(await getProductByHandle(handle), locale)

  if (!product) {
    return { title: t('Produkt ikke funnet') }
  }

  return {
    title: product.title,
    description: product.description,
    alternates: alternatesFor(`/butikken/${handle}`, locale),
    openGraph: {
      locale: openGraphLocale(locale),
      title: product.title,
      description: product.description,
      type: 'website',
      ...(product.images[0] && {
        images: [{ url: product.images[0].url, alt: product.images[0].altText || product.title }],
      }),
    },
  }
}

export async function generateStaticParams() {
  try {
    const products = await getProducts()
    // Handles are the same in both languages; only the host differs.
    return locales.flatMap((locale) =>
      products.map((product) => ({ locale, handle: product.handle })),
    )
  } catch {
    // Return empty array if store unavailable - pages will be generated on-demand
    return []
  }
}

export default async function ProductPage({ params }: Props) {
  const { locale, handle } = await params
  const [rawProduct, { data: rawRelated }] = await Promise.all([
    getProductByHandle(handle),
    sanityFetch({
      query: eventsByProductHandleQuery,
      params: { handle },
    }) as Promise<{ data: RelatedEvent[] }>,
  ])
  const product = translateContent(rawProduct, locale)
  const relatedEvents = translateContent(rawRelated, locale)

  if (!product) {
    notFound()
  }

  return (
    <div className={styles.productPage}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.description,
          ...(product.images[0] && { image: product.images[0].url }),
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currencyCode,
            availability: product.variants.some((v) => v.availableForSale)
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
        }}
      />
      <div className={styles.productContainer}>
        <ProductGallery images={product.images} title={product.title} />
        <ProductInfo product={product} relatedEvents={relatedEvents} />
      </div>
    </div>
  )
}
