'use client'

import Image from 'next/image'
import { useState } from 'react'
import { urlFor } from '@/lib/sanity/image'
import type { TimelineSection } from '@/types/sanity'
import styles from './TimelineSection.module.css'

interface TimelineSectionComponentProps {
  data: TimelineSection
}

export function TimelineSectionComponent({ data }: TimelineSectionComponentProps) {
  const { entries = [] } = data

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
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left: Title and Image */}
          <div className={styles.leftCol}>
            {activeEntry && (
              <h2 key={`title-${activeEntry._key}`} className={styles.title}>
                {activeEntry.title && <span>{activeEntry.title}</span>}
                <span className={styles.titleYear}>{activeEntry.year}</span>
              </h2>
            )}

            <div className={styles.imageWrapper}>
              {/* All images stacked, crossfade via opacity */}
              {sortedEntries.map((entry, index) => (
                entry.image?.asset && (
                  <Image
                    key={entry._key}
                    src={urlFor(entry.image).url()}
                    alt={entry.title || String(entry.year)}
                    fill
                    sizes="50vw"
                    className={`${styles.image} ${index === activeIndex ? styles.imageActive : ''}`}
                  />
                )
              ))}
            </div>
          </div>

          {/* Right: Year list */}
          <div className={styles.yearList}>
            {sortedEntries.map((entry, index) => (
              <button
                key={entry._key}
                className={`${styles.yearItem} ${index === activeIndex ? styles.yearItemActive : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-expanded={index === activeIndex}
              >
                <span className={styles.year}>{entry.year}</span>
                {index === activeIndex && entry.description && (
                  <p className={styles.description}>{entry.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
