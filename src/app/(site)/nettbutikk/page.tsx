import { getCollections } from '@/lib/shopify'
import { client } from '@/lib/sanity/client'
import { shopCategoriesQuery } from '@/lib/sanity/queries'
import type { ShopCategory } from '@/types/sanity'
import type { Metadata } from 'next'
import styles from './page.module.css'
import ProductCard from './ProductCard'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Nettbutikk',
  description: 'Handle mat og produkter fra Gransvilla',
}

export default async function NettbutikkPage() {
  const [collections, shopCategories] = await Promise.all([
    getCollections(),
    client.fetch<ShopCategory[]>(shopCategoriesQuery),
  ])

  // Filter out empty collections and merge with Sanity descriptions
  const activeCollections = collections
    .filter((c) => c.products.length > 0)
    .map((collection) => {
      // Find matching Sanity category by Shopify collection ID
      const sanityCategory = shopCategories.find(
        (cat) => cat.shopifyCollectionId === collection.id
      )
      return {
        ...collection,
        description: sanityCategory?.description || collection.description,
        order: sanityCategory?.order ?? 999,
      }
    })
    .sort((a, b) => a.order - b.order)

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
