import Image from 'next/image'
import ProductCard from '@/app/[locale]/(site)/butikken/ProductCard'
import shop from '@/app/[locale]/(site)/butikken/page.module.css'
import { RichText } from '@/components/RichText'
import { urlFor } from '@/lib/sanity/image'
import type { Product } from '@/lib/shopify/types'
import type { Page, TekstSeksjon } from '@/types/sanity'
import styles from './PageProductsLayout.module.css'

interface PageProductsLayoutProps {
  page: Page
  products: Product[]
  /** Sections that are not text, rendered by the page underneath the listing */
  children?: React.ReactNode
}

/**
 * A page that sells products, laid out like a category in /butikken: on a
 * wide screen three equal columns — the logo, what the page has to say, and
 * the products it sells.
 *
 * Built on the shop's own classes rather than a copy of them, so the two stay
 * in step. The one departure is on mobile, where the shop folds each category
 * behind a toggle — here there is a single listing and nothing to fold, so the
 * text stays visible and the products stay open.
 */
export function PageProductsLayout({ page, products, children }: PageProductsLayoutProps) {
  const textSections = (page.sections ?? []).filter(
    (section): section is TekstSeksjon => section._type === 'tekstSeksjon',
  )
  const logo = page.featuredImage?.asset ? page.featuredImage : undefined
  // Sanity writes the pixel size into the asset id: image-<hash>-<w>x<h>-<ext>
  const [, logoWidth, logoHeight] = logo?.asset._ref.match(/-(\d+)x(\d+)-/) ?? []
  const logoRatio = logoWidth && logoHeight ? Number(logoWidth) / Number(logoHeight) : 16 / 9

  return (
    <div className={shop.shopPage}>
      <header className={shop.shopHeader}>
        <h1 className={shop.shopTitle}>{page.title}</h1>
      </header>

      <div className={shop.shopSections}>
        <section className={`${shop.shopSection} ${styles.section}`}>
          <div className={`${shop.shopSidebar} ${styles.info} ${logo ? styles.infoWithLogo : ''}`}>
            <div
              className={`${shop.shopSidebarContent} ${styles.infoContent} ${
                logo ? styles.infoContentWithLogo : ''
              }`}
            >
              {logo && (
                <Image
                  src={urlFor(logo).width(600).url()}
                  alt={logo.alt || logo.assetAltText || page.title}
                  width={600}
                  height={Math.round(600 / logoRatio)}
                  className={styles.logo}
                  priority
                />
              )}
              <div className={styles.infoBlocks}>
                {textSections.map((section) => (
                  <div key={section._key} className={styles.infoBlock}>
                    {section.overskrift && (
                      <h2 className={shop.shopCategoryTitle}>{section.overskrift}</h2>
                    )}
                    {section.tekst && (
                      <div className={styles.infoText}>
                        <RichText value={section.tekst} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${shop.shopProductGrid} ${styles.products}`}>
            {products.map((product) => (
              <div key={product.id} className={shop.shopProductItem} data-open="true">
                <div className={`${shop.shopProductColumn} ${styles.productColumn}`}>
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {children}
    </div>
  )
}
