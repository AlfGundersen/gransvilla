import { getProductByHandle, getProducts } from '@/lib/shopify'
import { sanityFetch } from '@/lib/sanity/live'
import { eventsByProductHandleQuery } from '@/lib/sanity/queries'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/seo/JsonLd'
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
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)

  if (!product) {
    return { title: 'Produkt ikke funnet' }
  }

  return {
    title: product.title,
    description: product.description,
    alternates: {
      canonical: `/nettbutikk/${handle}`,
    },
    openGraph: {
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
  const products = await getProducts()
  return products.map((product) => ({
    handle: product.handle,
  }))
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  const [product, { data: relatedEvents }] = await Promise.all([
    getProductByHandle(handle),
    sanityFetch({
      query: eventsByProductHandleQuery,
      params: { handle },
    }) as Promise<{ data: RelatedEvent[] }>,
  ])

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
