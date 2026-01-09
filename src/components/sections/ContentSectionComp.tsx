import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/image'
import type { ContentSection } from '@/types/sanity'
import styles from './ContentSection.module.css'

interface ContentSectionComponentProps {
  data: ContentSection
}

export function ContentSectionComponent({ data }: ContentSectionComponentProps) {
  const { labelText, heading, body, ctaText, ctaHref, image, imagePosition = 'right' } = data

  const isReversed = imagePosition === 'left'

  return (
    <section className={styles.section}>
      <div className={`${styles.container} ${isReversed ? styles.reversed : ''}`}>
        {/* Image */}
        <div className={styles.imageWrapper}>
          {image?.asset && (
            <Image src={urlFor(image).url()} alt={image.alt || heading || ''} fill sizes="50vw" />
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {labelText && <span className={styles.label}>{labelText}</span>}
          {heading && <h2 className={styles.heading}>{heading}</h2>}
          {body && <p className={styles.body}>{body}</p>}
          {ctaText && ctaHref && (
            <Link href={ctaHref} className={styles.cta}>
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
