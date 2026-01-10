import { getProductByHandle } from '@/lib/shopify'
import type { FeaturedProductSection } from '@/types/sanity'
import Image from 'next/image'
import { Link } from 'next-view-transitions'
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
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.label}>Fokusprodukt</span>
          <h2 className={styles.title}>{product.title}</h2>
          {product.description && <p className={styles.description}>{product.description}</p>}

          <div className={styles.buttons}>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.buttonPrimary}>
                Legg i handlevogn
              </button>
              <Link href={productUrl} className={styles.buttonSecondary}>
                Les mer
              </Link>
            </div>
            <Link href="/nettbutikk" className={styles.buttonSecondary}>
              Se alle produkter
            </Link>
          </div>
        </div>

        {productImage && (
          <div className={styles.imageCol}>
            <Image
              src={productImage.url}
              alt={productImage.altText || product.title}
              width={productImage.width || 800}
              height={productImage.height || 600}
              className={styles.image}
            />
          </div>
        )}
      </div>
    </section>
  )
}
