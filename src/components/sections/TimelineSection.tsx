'use client'

import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { createDataAttribute } from 'next-sanity'
import { useState } from 'react'
import { urlFor } from '@/lib/sanity/image'
import type { TimelineSection } from '@/types/sanity'
import styles from './TimelineSection.module.css'

interface TimelineSectionComponentProps {
  data: TimelineSection
  documentId?: string
  documentType?: string
}

export function TimelineSectionComponent({
  data,
  documentId,
  documentType,
}: TimelineSectionComponentProps) {
  const { entries, image } = data
  const entryList = entries ?? []

  // Default to the first entry with a description, or just the first entry
  const defaultIndex = entryList.findIndex((e) => e.description)
  const [activeIndex, setActiveIndex] = useState(defaultIndex >= 0 ? defaultIndex : 0)

  if (entryList.length === 0) {
    return null
  }

  return (
    <section className={styles.timelineSection} aria-label="Tidslinje">
      <div className={styles.timelineContainer}>
        <div className={styles.timelineGrid}>
          {/* Left: Image */}
          <div className={styles.timelineLeftCol}>
            {image?.asset && (
              <div className={styles.timelineImageWrap}>
                <Image
                  src={urlFor(image).url()}
                  alt={image.alt || image.assetAltText || ''}
                  fill
                  sizes="50vw"
                  className={styles.timelineImage}
                />
              </div>
            )}
          </div>

          {/* Right: Entry list */}
          <div className={styles.timelineYearList}>
            {entryList.map((entry, index) => (
              <button
                key={entry._key}
                className={`${styles.timelineYearItem} ${index === activeIndex ? styles.timelineYearItemActive : ''}`}
                onClick={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                aria-expanded={index === activeIndex}
                aria-label={entry.title}
                data-sanity={
                  documentId && documentType
                    ? createDataAttribute({
                        id: documentId,
                        type: documentType,
                        path: `timeline.entries[_key=="${entry._key}"]`,
                      }).toString()
                    : undefined
                }
              >
                {entry.showTitle && entry.title && (
                  <span className={styles.timelineYear}>{entry.title}</span>
                )}
                {index === activeIndex && entry.description && (
                  <div className={styles.timelineDescription}>
                    <PortableText value={entry.description} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
