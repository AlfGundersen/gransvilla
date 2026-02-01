import { getProductByHandle } from '@/lib/shopify'
import type { Product } from '@/lib/shopify/types'
import { EventProductCard } from './EventProductCard'
import styles from './EventProductsSection.module.css'

interface EventProductsSectionProps {
  products: string[]
}

export async function EventProductsSection({ products }: EventProductsSectionProps) {
  const fetchedProducts = await Promise.all(
    products.map((handle) => getProductByHandle(handle))
  )

  const validProducts = fetchedProducts.filter((p): p is Product => p !== null)

  if (validProducts.length === 0) {
    return null
  }

  return (
    <section className={styles.eventProductsSection} aria-label="Produkter">
      <h2 className={styles.eventProductsHeading}>Produkter</h2>
      <div className={styles.eventProductsGrid}>
        {validProducts.map((product) => (
          <EventProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
