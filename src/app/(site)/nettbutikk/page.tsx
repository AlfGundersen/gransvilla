import { getCollections } from '@/lib/shopify'
import type { Metadata } from 'next'
import styles from './page.module.css'
import ProductCard from './ProductCard'

export const metadata: Metadata = {
  title: 'Nettbutikk',
  description: 'Handle mat og produkter fra Gransvilla',
}

export default async function NettbutikkPage() {
  const collections = await getCollections()

  // Filter out empty collections
  const activeCollections = collections.filter((c) => c.products.length > 0)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Nettbutikk</h1>
      </header>

      {activeCollections.length === 0 ? (
        <div className={styles.empty}>
          <p>Ingen produkter tilgjengelig ennå.</p>
        </div>
      ) : (
        <div className={styles.sections}>
          {activeCollections.map((collection) => (
            <section key={collection.id} className={`${styles.section} ${styles.grid3col}`}>
              <div className={styles.sidebar}>
                <div className={styles.sidebarContent}>
                  <h2 className={styles.categoryTitle}>{collection.title}</h2>
                  {collection.description && (
                    <p className={styles.categoryDescription}>
                      {collection.description}
                    </p>
                  )}
                </div>
              </div>

              {/* First product column */}
              <div className={styles.productColumn}>
                {collection.products
                  .filter((_, i) => i % 2 === 0)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>

              {/* Second product column */}
              <div className={styles.productColumn}>
                {collection.products
                  .filter((_, i) => i % 2 === 1)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
