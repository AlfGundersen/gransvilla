'use client'

import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { createDataAttribute } from 'next-sanity'
import { WatermarkClient } from '@/components/WatermarkClient'
import { urlFor } from '@/lib/sanity/image'
import type { TimelineSection } from '@/types/sanity'
import styles from './TimelineSection.module.css'

interface TimelineSectionComponentProps {
  data: TimelineSection
  documentId?: string
  documentType?: string
  watermarkSrc?: string
}

export function TimelineSectionComponent({
  data,
  documentId,
  documentType,
  watermarkSrc,
}: TimelineSectionComponentProps) {
  const { imageTitle, heading, entries, image } = data
  const entryList = entries ?? []

  if (entryList.length === 0 && !image?.asset) {
    return null
  }

  return (
    <section className={styles.timelineSection} aria-label="Historie">
      <div className={styles.timelineContainer}>
        <div className={styles.timelineGrid}>
          {/* Left: Title and image */}
          <div className={styles.timelineLeftCol}>
            {imageTitle && <p className={styles.timelineImageTitle}>{imageTitle}</p>}
            {image?.asset && (
              <div className={styles.timelineImageWrap}>
                <Image
                  src={urlFor(image).url()}
                  alt={image.alt || image.assetAltText || ''}
                  fill
                  sizes="50vw"
                  className={styles.timelineImage}
                />
                <WatermarkClient src={watermarkSrc} image={image} />
              </div>
            )}
          </div>

          {/* Right: Heading and text paragraphs */}
          <div className={styles.timelineTextCol}>
            {heading && <h2 className={styles.timelineHeading}>{heading}</h2>}
            {entryList.map((entry) =>
              entry.description ? (
                <div
                  key={entry._key}
                  className={styles.timelineDescription}
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
                  <PortableText value={entry.description} />
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
