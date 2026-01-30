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

  const activeItem = items[activeIndex]
  const hasAnySecondImage = items.some((item) => item.imageLayout !== '1' && item.image2?.asset)
  const singleImage = activeItem?.imageLayout === '1'

  return (
    <section className={styles.eventsSection} aria-label="Arrangementer">
      <div className={styles.eventsContainer}>
        <div className={`${styles.eventsGrid} ${!hasAnySecondImage || singleImage ? styles.eventsGrid2col : styles.eventsGrid3col}`}>
          {/* Navigation column */}
          <div className={styles.eventsNav}>
            <h2 className={styles.eventsHeading}>Arrangementer</h2>
            <ul className={styles.eventsNavList}>
              {items.map((item, index) => (
                <li key={item._key}>
                  <Link
                    href={`/${item.event.slug.current}`}
                    className={`${styles.eventsNavLink} ${index === activeIndex ? styles.eventsNavLinkActive : ''}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                  >
                    {item.event.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image column 1 - all images stacked, crossfade via opacity */}
          <div className={styles.eventsImageCol}>
            <div className={styles.eventsImageWrap}>
              {items.map((item, index) => (
                item.image1?.asset && (
                  <Image
                    key={`img1-${item._key}`}
                    src={urlFor(item.image1).url()}
                    alt={item.image1.alt || item.image1.assetAltText || ''}
                    fill
                    sizes="50vw"
                    className={`${styles.eventsImage} ${index === activeIndex ? styles.eventsImageActive : ''}`}
                  />
                )
              ))}
            </div>
          </div>

          {/* Image column 2 - stays in DOM, collapses via CSS */}
          {hasAnySecondImage && (
            <div className={`${styles.eventsImageCol} ${singleImage ? styles.eventsImageColHidden : ''}`}>
              <div className={styles.eventsImageWrap}>
                {items.map((item, index) => (
                  item.image2?.asset && (
                    <Image
                      key={`img2-${item._key}`}
                      src={urlFor(item.image2).url()}
                      alt={item.image2.alt || item.image2.assetAltText || ''}
                      fill
                      sizes="33vw"
                      className={`${styles.eventsImage} ${index === activeIndex ? styles.eventsImageActive : ''}`}
                    />
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
