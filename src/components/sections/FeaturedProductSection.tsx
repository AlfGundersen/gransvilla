import { getProductByHandle } from '@/lib/shopify'
import type { FeaturedProductSection } from '@/types/sanity'
import Image from 'next/image'
import Link from 'next/link'
import styles from './FeaturedProductSection.module.css'

interface FeaturedProductSectionProps {
  data: FeaturedProductSection
}

export async function FeaturedProductSectionComponent({ data }: FeaturedProductSectionProps) {
  const { productHandle } = data

  if (!productHandle) {
    return null
  }

  // Fetch product data from Shopify
  const product = await getProductByHandle(productHandle)

  if (!product) {
    return null
  }

  const productUrl = `/nettbutikk/${product.handle}`
  const productImage = product.images[0]

  return (
    <section className={styles.featProductSection} aria-label={`Fokusprodukt: ${product.title}`}>
      <div className={styles.featProductContainer}>
        <div className={styles.featProductContent}>
          <span className={styles.featProductLabel}>Fokusprodukt</span>
          <h2 className={styles.featProductTitle}>{product.title}</h2>
          {product.description && <p className={styles.featProductDescription}>{product.description}</p>}

          <div className={styles.featProductButtons}>
            <div className={styles.featProductButtonRow}>
              <button type="button" className={styles.featProductBtnPrimary}>
                Legg i handlevogn
              </button>
              <Link href={productUrl} className={styles.featProductBtnSecondary}>
                Les mer
              </Link>
            </div>
            <Link href="/nettbutikk" className={styles.featProductBtnSecondary}>
              Se alle produkter
            </Link>
          </div>
        </div>

        {productImage && (
          <div className={styles.featProductImageCol}>
            <Image
              src={productImage.url}
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
