'use client'

import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { useState } from 'react'
import { urlFor } from '@/lib/sanity/image'
import type { EventsSection } from '@/types/sanity'
import styles from './EventsSection.module.css'

interface EventsSectionComponentProps {
  data: EventsSection
}

export function EventsSectionComponent({ data }: EventsSectionComponentProps) {
  const items = data.items ?? []
  const [activeIndex, setActiveIndex] = useState(0)

  if (items.length === 0) {
    return null
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={`${styles.grid} ${styles.grid3col}`}>
          {/* Navigation column */}
          <div className={styles.nav}>
            <h2 className={styles.heading}>Arrangementer</h2>
            <ul className={styles.navList}>
              {items.map((item, index) => (
                <li key={item._key}>
                  <Link
                    href={`/arrangementer/${item.event.slug.current}`}
                    className={`${styles.navLink} ${index === activeIndex ? styles.navLinkActive : ''}`}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    {item.event.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image column 1 - all images stacked, crossfade via opacity */}
          <div className={styles.imageCol}>
            <div className={styles.imageWrapper}>
              {items.map((item, index) => (
                item.image1?.asset && (
                  <Image
                    key={`img1-${item._key}`}
                    src={urlFor(item.image1).url()}
                    alt={item.image1.alt || ''}
                    fill
                    sizes="33vw"
                    className={`${styles.image} ${index === activeIndex ? styles.imageActive : ''}`}
                  />
                )
              ))}
            </div>
          </div>

          {/* Image column 2 - all images stacked, crossfade via opacity */}
          <div className={styles.imageCol}>
            <div className={styles.imageWrapper}>
              {items.map((item, index) => (
                item.image2?.asset && (
                  <Image
                    key={`img2-${item._key}`}
                    src={urlFor(item.image2).url()}
                    alt={item.image2.alt || ''}
                    fill
                    sizes="33vw"
                    className={`${styles.image} ${index === activeIndex ? styles.imageActive : ''}`}
                  />
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
