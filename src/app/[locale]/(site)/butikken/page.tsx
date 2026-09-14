import type { Metadata } from 'next'
import { alternatesFor } from '@/lib/i18n/metadata'
import { getTranslator, translateContent } from '@/lib/i18n/server'
import { getCollections } from '@/lib/shopify'
import CollapsibleSection from './CollapsibleSection'
import ProductCard from './ProductCard'
import styles from './page.module.css'

export const revalidate = 60

type Params = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const t = getTranslator(locale)

  return {
    title: t('Butikken'),
    description: t('Handle mat og produkter fra Gransvilla'),
    alternates: alternatesFor('/butikken', locale),
  }
}

export default async function ButikkenPage({ params }: Params) {
  const { locale } = await params
  const t = getTranslator(locale)

  let collections: Awaited<ReturnType<typeof getCollections>> = []
  try {
    collections = await translateContent(await getCollections(), locale)
  } catch {
    // Store unavailable - show empty state
  }

  // Filter out empty collections (Shopify controls order)
  const activeCollections = collections.filter((c) => c.products.length > 0)

  return (
    <div className={styles.shopPage}>
      <header className={styles.shopHeader}>
        <h1 className={styles.shopTitle}>{t('Butikken')}</h1>
      </header>

      {activeCollections.length === 0 ? (
        <div className={styles.shopEmpty}>
          <p>{t('Ingen produkter tilgjengelig ennå.')}</p>
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
