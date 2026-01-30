import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
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
                    {Array.isArray(column.description) ? <PortableText value={column.description} /> : <p>{column.description}</p>}
                  </div>
                )}
                {column.link?.slug?.current && (
                  <Link
                    href={`/${column.link.slug.current}`}
                    className={styles.featuredCta}
                    aria-label={column.heading ? `Vis mer om ${column.heading}` : 'Vis mer'}
                  >
                    Vis mer
                  </Link>
                )}
              </div>
              {column.image?.asset && (
                <div className={styles.featuredImageWrap}>
                  <Image
                    src={urlFor(column.image).width(1400).quality(100).url()}
                    alt={column.image.alt || column.image.assetAltText || column.heading || ''}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
