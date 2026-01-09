import { getProducts } from '@/lib/shopify'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Nettbutikk',
  description: 'Handle mat og produkter fra Gransvilla',
}

export default async function NettbutikkPage() {
  const products = await getProducts()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nettbutikk</h1>
        <p className={styles.description}>
          Handle gavekort, matopplevelser og produkter fra Gransvilla
        </p>
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <p>Ingen produkter tilgjengelig ennå.</p>
          <p>Legg til produkter i Shopify for å vise dem her.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/nettbutikk/${product.handle}`}
              className={styles.product}
            >
              {product.images[0] && (
                <div className={styles.imageWrapper}>
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].altText || product.title}
                    fill
                    className={styles.image}
                  />
                </div>
              )}
              <div className={styles.info}>
                <h2 className={styles.productTitle}>{product.title}</h2>
                <p className={styles.price}>
                  {product.price.toLocaleString('nb-NO')} {product.currencyCode}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
