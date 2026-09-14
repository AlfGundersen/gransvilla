import type { Metadata } from 'next'
import { getCollections } from '@/lib/shopify'
import CollapsibleSection from './CollapsibleSection'
import ProductCard from './ProductCard'
import styles from './page.module.css'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Butikken',
  description: 'Handle mat og produkter fra Gransvilla',
  alternates: { canonical: '/butikken' },
}

export default async function ButikkenPage() {
  let collections: Awaited<ReturnType<typeof getCollections>> = []
  try {
    collections = await getCollections()
  } catch {
    // Store unavailable - show empty state
  }

  // Filter out empty collections (Shopify controls order)
  const activeCollections = collections.filter((c) => c.products.length > 0)

  return (
    <div className={styles.shopPage}>
      <header className={styles.shopHeader}>
        <h1 className={styles.shopTitle}>Butikken</h1>
      </header>

      {activeCollections.length === 0 ? (
        <div className={styles.shopEmpty}>
          <p>Ingen produkter tilgjengelig ennå.</p>
        </div>
      ) : (
        <div className={styles.shopSections}>
          {activeCollections.map((collection) => (
            <CollapsibleSection
              key={collection.id}
              title={collection.title}
              description={collection.description}
            >
              {collection.products.map((product) => (
                <div key={product.id} className={styles.shopProductColumn}>
                  <ProductCard product={product} />
                </div>
              ))}
            </CollapsibleSection>
          ))}
        </div>
      )}
    </div>
  )
}
