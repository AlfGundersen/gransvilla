'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import { urlFor } from '@/lib/sanity/image'
import type { EventsSection } from '@/types/sanity'
import styles from './EventsSection.module.css'

interface EventsSectionComponentProps {
  data: EventsSection
}

export function EventsSectionComponent({ data }: EventsSectionComponentProps) {
  const items = data.items ?? []
  const [activeIndex, setActiveIndex] = useState(0)

  const handleNavClick = useCallback((e: React.MouseEvent, index: number) => {
    if (window.innerWidth <= 768) {
      e.preventDefault()
      setActiveIndex(index)
    }
  }, [])

  if (items.length === 0) {
    return null
  }

  const activeItem = items[activeIndex]
  const hasAnySecondImage = items.some((item) => item.imageLayout !== '1' && item.image2?.asset)
  const singleImage = activeItem?.imageLayout === '1' || !activeItem?.image2?.asset

  const carouselImages = [
    activeItem?.image1?.asset ? activeItem.image1 : null,
    activeItem?.image2?.asset ? activeItem.image2 : null,
  ].filter(Boolean)

  return (
    <section className={styles.eventsSection} aria-label="Arrangementer">
      <div className={styles.eventsContainer}>
        <div className={`${styles.eventsGrid} ${!hasAnySecondImage || singleImage ? styles.eventsGrid2col : styles.eventsGrid3col}`}>
          {/* Navigation column */}
          <div className={styles.eventsNav}>
            <h2 className={styles.eventsHeading}>Arrangementer</h2>
            <div className={styles.eventsMobileTop}>
              <div className={styles.eventsMobileNavCol}>
                <ul className={styles.eventsNavList}>
                  {items.map((item, index) => (
                    <li key={item._key}>
                      <Link
                        href={`/${item.event.slug.current}`}
                        className={`${styles.eventsNavLink} ${index === activeIndex ? styles.eventsNavLinkActive : ''}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onFocus={() => setActiveIndex(index)}
                        onClick={(e) => handleNavClick(e, index)}
                      >
                        {item.event.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${activeItem.event.slug.current}`}
                  className={`${styles.eventsMobileButton} site-button`}
                >
                  Om {activeItem.event.title}
                </Link>
              </div>
              {carouselImages.length > 0 && (
                <div className={styles.eventsMobileImages}>
                  <div className={`${styles.eventsMobileCarousel} ${carouselImages.length === 1 ? styles.eventsMobileCarouselSingle : ''}`}>
                    {carouselImages.map((img, i) => (
                      <div key={i} className={styles.eventsMobileCarouselItem}>
                        <Image
                          src={urlFor(img!).width(500).height(700).quality(92).fit('crop').url()}
                          alt={img!.alt || img!.assetAltText || ''}
                          fill
                          sizes="45vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
