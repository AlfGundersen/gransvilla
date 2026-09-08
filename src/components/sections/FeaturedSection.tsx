import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { MaybeWatermark } from '@/components/Watermark'
import { urlFor } from '@/lib/sanity/image'
import type { FeaturedSection } from '@/types/sanity'
import styles from './FeaturedSection.module.css'

interface FeaturedSectionComponentProps {
  data: FeaturedSection
}

export function FeaturedSectionComponent({ data }: FeaturedSectionComponentProps) {
  const columns = data.columns ?? []

  if (columns.length === 0) {
    return null
  }

  return (
    <section className={styles.featuredSection}>
      <div className={styles.featuredContainer}>
        <div className={styles.featuredGrid}>
          {columns.map((column) => (
            <div key={column._key} className={styles.featuredColumn}>
              <div className={styles.featuredContent}>
                {column.heading && <h2 className={styles.featuredHeading}>{column.heading}</h2>}
                {column.description && (
                  <div className={styles.featuredDescription}>
                    {Array.isArray(column.description) ? (
                      <PortableText value={column.description} />
                    ) : (
                      <p>{column.description}</p>
                    )}
                  </div>
                )}
                {column.link?.slug?.current && (
                  <Link
                    href={`/${column.link.slug.current}`}
                    className={`${styles.featuredCta} site-button`}
                    aria-label={column.heading ? `Vis mer om ${column.heading}` : 'Vis mer'}
                  >
                    Vis mer
                  </Link>
                )}
              </div>
              {/* Use column image, or fallback to linked page's featured image */}
              {(() => {
                const displayImage = column.image?.asset ? column.image : column.link?.featuredImage
                if (!displayImage?.asset) return null
                return (
                  <div className={styles.featuredImageWrap}>
                    <Image
                      src={urlFor(displayImage)
                        .width(700)
                        .height(1050)
                        .quality(92)
                        .fit('crop')
                        .url()}
                      alt={displayImage.alt || displayImage.assetAltText || column.heading || ''}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <MaybeWatermark image={displayImage} />
                  </div>
                )
              })()}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
