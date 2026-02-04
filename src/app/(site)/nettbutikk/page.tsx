import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'
import { shopCategoriesQuery } from '@/lib/sanity/queries'
import { getCollections } from '@/lib/shopify'
import type { ShopCategory } from '@/types/sanity'
import CollapsibleSection from './CollapsibleSection'
import ProductCard from './ProductCard'
import styles from './page.module.css'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Nettbutikk',
  description: 'Handle mat og produkter fra Gransvilla',
  alternates: { canonical: '/nettbutikk' },
}

export default async function NettbutikkPage() {
  let collections: Awaited<ReturnType<typeof getCollections>> = []
  try {
    collections = await getCollections()
  } catch {
    // Store unavailable - show empty state
  }
  const shopCategories = await client.fetch<ShopCategory[]>(shopCategoriesQuery)

  // Filter out empty collections and merge with Sanity descriptions
  const activeCollections = collections
    .filter((c) => c.products.length > 0)
    .map((collection) => {
      // Find matching Sanity category by Shopify collection ID
      const sanityCategory = shopCategories.find((cat) => cat.shopifyCollectionId === collection.id)
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
