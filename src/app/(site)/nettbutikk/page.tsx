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
    <div className={styles.shopPage}>
      <header className={styles.shopHeader}>
        <h1 className={styles.shopTitle}>Nettbutikk</h1>
      </header>

      {activeCollections.length === 0 ? (
        <div className={styles.shopEmpty}>
          <p>Ingen produkter tilgjengelig ennå.</p>
        </div>
      ) : (
        <div className={styles.shopSections}>
          {activeCollections.map((collection) => (
            <section key={collection.id} className={styles.shopSection}>
              <div className={styles.shopSidebar}>
                <div className={styles.shopSidebarContent}>
                  <h2 className={styles.shopCategoryTitle}>{collection.title}</h2>
                  {collection.description && (
                    <p className={styles.shopCategoryDescription}>
                      {collection.description}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.shopProductGrid}>
                {collection.products.map((product) => (
                  <div key={product.id} className={styles.shopProductColumn}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
