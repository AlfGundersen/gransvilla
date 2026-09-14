import Image from 'next/image'
import Link from 'next/link'
import { localeHref } from '@/lib/i18n/href'
import { getTranslator, translateContent } from '@/lib/i18n/server'
import { getProducts } from '@/lib/shopify'
import { shopifyImageUrl } from '@/lib/shopify/image'
import type { FeaturedProductSection } from '@/types/sanity'
import styles from './FeaturedProductSection.module.css'

interface FeaturedProductSectionProps {
  data: FeaturedProductSection
  /** This component fetches Shopify itself, so it has to translate that too. */
  locale: string
}

export async function FeaturedProductSectionComponent({
  data,
  locale,
}: FeaturedProductSectionProps) {
  const t = getTranslator(locale)
  const { productHandle } = data

  // Fetch all listed products from Shopify
  let products: Awaited<ReturnType<typeof getProducts>> = []
  try {
    products = await translateContent(await getProducts(20), locale)
  } catch {
    // Store unavailable
  }

  if (products.length === 0) {
    return null
  }

  // Check if the selected product is in the listed products (not unlisted/unpublished)
  const selectedProduct = productHandle ? products.find((p) => p.handle === productHandle) : null

  // Use selected product if listed, otherwise fall back to first listed product
  const product = selectedProduct ?? products[0]

  const productUrl = localeHref(`/butikken/${product.handle}`, locale)
  const productImage = product.images[0]

  return (
    <section className={styles.featProductSection} aria-label={`Fokusprodukt: ${product.title}`}>
      <div className={styles.featProductContainer}>
        <div className={styles.featProductContent}>
          <h2 className={styles.featProductTitle}>{product.title}</h2>
          {product.description && (
            <p className={styles.featProductDescription}>{product.description}</p>
          )}

          <div className={styles.featProductButtons}>
            <Link href={productUrl} className={`${styles.featProductBtnPrimary} site-button`}>
              {t('Les mer')}
            </Link>
            <Link
              href={localeHref('/butikken', locale)}
              className={`${styles.featProductBtnSecondary} site-button`}
            >
              {t('Se alle produkter')}
            </Link>
          </div>
        </div>

        {productImage && (
          <div className={styles.featProductImageCol}>
            <Image
              src={shopifyImageUrl(productImage.url, { width: 800, crop: 'center' })}
              alt={productImage.altText || product.title}
              width={productImage.width || 800}
              height={productImage.height || 600}
              className={styles.featProductImage}
            />
          </div>
        )}
      </div>
    </section>
  )
}
