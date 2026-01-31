'use client'

import Image from 'next/image'
import { useState } from 'react'
import { PortableText } from '@portabletext/react'
import { createDataAttribute } from 'next-sanity'
import { urlFor } from '@/lib/sanity/image'
import type { TimelineSection } from '@/types/sanity'
import styles from './TimelineSection.module.css'

interface TimelineSectionComponentProps {
  data: TimelineSection
  documentId?: string
  documentType?: string
}

export function TimelineSectionComponent({ data, documentId, documentType }: TimelineSectionComponentProps) {
  const { entries = [], image, heading } = data

  // Sort entries by year, newest first
  const sortedEntries = [...entries].sort((a, b) => b.year - a.year)

  // Default to the first entry with a description, or just the first entry
  const defaultIndex = sortedEntries.findIndex((e) => e.description) ?? 0
  const [activeIndex, setActiveIndex] = useState(defaultIndex >= 0 ? defaultIndex : 0)

  const activeEntry = sortedEntries[activeIndex]

  if (sortedEntries.length === 0) {
    return null
  }

  return (
    <section className={styles.timelineSection} aria-label={heading || 'Tidslinje'}>
      <div className={styles.timelineContainer}>
        <div className={styles.timelineGrid}>
          {/* Left: Image and heading */}
          <div className={styles.timelineLeftCol}>
            {heading && <h2 className={styles.timelineHeading}>{heading}</h2>}
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

          {/* Right: Year list */}
          <div className={styles.timelineYearList}>
            {sortedEntries.map((entry, index) => (
              <button
                key={entry._key}
                className={`${styles.timelineYearItem} ${index === activeIndex ? styles.timelineYearItemActive : ''}`}
                onClick={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                aria-expanded={index === activeIndex}
                aria-label={`${entry.year}`}
                data-sanity={documentId && documentType ? createDataAttribute({ id: documentId, type: documentType, path: `timeline.entries[_key=="${entry._key}"]` }).toString() : undefined}
              >
                <span className={styles.timelineYear}>{entry.year}</span>
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
