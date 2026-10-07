import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/navigation/BackLink'
import { JsonLd } from '@/components/seo/JsonLd'
import { localeHref } from '@/lib/i18n/href'
import { alternatesFor, openGraphLocale } from '@/lib/i18n/metadata'
import { getTranslator, translateContent } from '@/lib/i18n/server'
import { sanityFetch } from '@/lib/sanity/live'
import { eventsByProductHandleQuery, pageByHiddenProductHandleQuery } from '@/lib/sanity/queries'
import { getProductByHandle } from '@/lib/shopify'
import { ProductGallery } from './ProductGallery'
import { ProductInfo } from './ProductInfo'
import styles from './page.module.css'

interface RelatedEvent {
  _id: string
  title: string
  slug: { current: string }
}

/**
 * The page a product is sold from when it is kept out of the shop listing.
 * Such a product was never reached from /butikken, so that is not where its
 * back link should lead, and search engines have no business listing it.
 */
export async function fetchOwnerPage(handle: string) {
  const { data } = (await sanityFetch({
    query: pageByHiddenProductHandleQuery,
    params: { handle },
  })) as { data: { title: string; slug: { current: string } } | null }
  return data
}

/**
 * Where a product lives. One kept out of the shop listing is served at the top
 * level — /framdrift-lunsj — because that is the address printed on its poster,
 * and a member following it never passes through /butikken.
 */
export function productPath(handle: string, isHidden: boolean): string {
  return isHidden ? `/${handle}` : `/butikken/${handle}`
}

export async function productMetadata(locale: string, handle: string): Promise<Metadata> {
  const t = getTranslator(locale)
  const [rawProduct, ownerPage] = await Promise.all([
    getProductByHandle(handle),
    fetchOwnerPage(handle),
  ])
  const product = await translateContent(rawProduct, locale)

  if (!product) {
    return { title: t('Produkt ikke funnet') }
  }

  return {
    title: product.title,
    description: product.description,
    ...(ownerPage && { robots: { index: false, follow: false } }),
    alternates: alternatesFor(productPath(handle, Boolean(ownerPage)), locale),
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

/**
 * The product page itself, shared by the two routes that can show it:
 * /butikken/[handle] for anything in the shop, and /[slug] for a product kept
 * out of it.
 */
export async function ProductPageContent({ locale, handle }: { locale: string; handle: string }) {
  const t = getTranslator(locale)
  const [rawProduct, { data: rawRelated }, rawOwnerPage] = await Promise.all([
    getProductByHandle(handle),
    sanityFetch({
      query: eventsByProductHandleQuery,
      params: { handle },
    }) as Promise<{ data: RelatedEvent[] }>,
    fetchOwnerPage(handle),
  ])
  const product = await translateContent(rawProduct, locale)
  const ownerPage = await translateContent(rawOwnerPage, locale)
  const relatedEvents = await translateContent(rawRelated, locale)

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
      {ownerPage ? (
        <BackLink
          href={localeHref(`/${ownerPage.slug.current}`, locale)}
          label={`${t('Tilbake til')} ${ownerPage.title}`}
          className={styles.productBack}
        />
      ) : (
        <BackLink
          href={localeHref('/butikken', locale)}
          label={t('Tilbake til butikken')}
          className={styles.productBack}
        />
      )}
      <div className={styles.productContainer}>
        <ProductGallery images={product.images} title={product.title} handle={handle} />
        <ProductInfo product={product} relatedEvents={relatedEvents} />
      </div>
    </div>
  )
}
