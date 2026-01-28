import Image from 'next/image'
import { Link } from 'next-view-transitions'
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
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {columns.map((column) => (
            <div key={column._key} className={styles.column}>
              <div className={styles.content}>
                {column.heading && <h2 className={styles.heading}>{column.heading}</h2>}
                {column.description && <p className={styles.description}>{column.description}</p>}
                {column.link?.slug?.current && (
                  <Link
                    href={
                      column.link._type === 'event'
                        ? `/arrangementer/${column.link.slug.current}`
                        : `/${column.link.slug.current}`
                    }
                    className={styles.cta}
                  >
                    Vis mer
                  </Link>
                )}
              </div>
              {column.image?.asset && (
                <div className={styles.imageWrapper}>
                  <Image
                    src={urlFor(column.image).url()}
                    alt={column.image.alt || column.heading || ''}
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
