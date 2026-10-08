import type { Metadata } from 'next'
import { alternatesFor } from '@/lib/i18n/metadata'
import { getTranslator, translateContent } from '@/lib/i18n/server'
import { getHiddenProductHandles } from '@/lib/sanity/hiddenProducts'
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

/** Fewer products than this and mobile lists them without the category folds. */
const FLAT_BELOW_PRODUCTS = 5

export default async function ButikkenPage({ params }: Params) {
  const { locale } = await params
  const t = getTranslator(locale)

  let collections: Awaited<ReturnType<typeof getCollections>> = []
  try {
    collections = await translateContent(await getCollections(), locale)
  } catch {
    // Store unavailable - show empty state
  }

  // Products sold only from a page of their own are left out, and a collection
  // that held nothing else goes with them (Shopify controls order)
  const hidden = await getHiddenProductHandles()
  const activeCollections = collections
    .map((c) => ({ ...c, products: c.products.filter((p) => !hidden.has(p.handle)) }))
    .filter((c) => c.products.length > 0)

  // With only a handful of products there is nothing to tidy away, so on
  // mobile they are listed one after another instead of behind a tap each
  const productCount = activeCollections.reduce((sum, c) => sum + c.products.length, 0)
  const flat = productCount < FLAT_BELOW_PRODUCTS

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
              flat={flat}
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
