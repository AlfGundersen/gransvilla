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
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left: Image and heading */}
          <div className={styles.leftCol}>
            {image?.asset && (
              <div className={styles.imageWrapper}>
                <Image
                  src={urlFor(image).url()}
                  alt={image.alt || ''}
                  fill
                  sizes="50vw"
                  className={styles.sectionImage}
                />
              </div>
            )}
            {heading && <h2 className={styles.heading}>{heading}</h2>}
            {activeEntry && (
              <p key={`year-${activeEntry._key}`} className={styles.activeYear}>
                {activeEntry.year}
              </p>
            )}
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
