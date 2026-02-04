import Image from 'next/image'
import Link from 'next/link'
import { getProductByHandle } from '@/lib/shopify'
import type { Product } from '@/lib/shopify/types'
import { EventProductCard, EventProductSingle } from './EventProductCard'
import styles from './EventProductsSection.module.css'

interface EventProductsSectionProps {
  products: string[]
}

export async function EventProductsSection({ products }: EventProductsSectionProps) {
  const fetchedProducts = await Promise.all(products.map((handle) => getProductByHandle(handle)))

  const validProducts = fetchedProducts.filter((p): p is Product => p !== null)

  if (validProducts.length === 0) {
    return null
  }

  const isSingle = validProducts.length === 1

  return (
    <section className={styles.eventProductsSection} aria-label="Produkter">
      <div className={styles.eventProductsHeader}>
        <h2 className={styles.eventProductsHeading}>Fra nettbutikken</h2>
        <p className={styles.eventProductsSubtext}>Produkter knyttet til dette arrangementet</p>
        <Link href="/butikken" className={styles.eventProductsLink}>
          Se alle produkter
        </Link>
      </div>
      {isSingle ? (
        <SingleProductLayout product={validProducts[0]} />
      ) : (
        <div className={styles.eventProductsGrid}>
          {validProducts.map((product) => (
            <EventProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

function SingleProductLayout({ product }: { product: Product }) {
  const productImage = product.images[0]

  return (
    <div className={styles.singleProduct}>
      {productImage && (
        <div className={styles.singleProductImageCol}>
          <Image
            src={productImage.url}
            alt={productImage.altText || product.title}
            width={productImage.width || 800}
            height={productImage.height || 600}
            className={styles.singleProductImage}
          />
        </div>
      )}
      <div className={styles.singleProductContent}>
        <EventProductSingle product={product} />
      </div>
    </div>
  )
}
