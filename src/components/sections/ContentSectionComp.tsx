import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
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
    <section className={styles.contentSection}>
      <div className={`${styles.contentContainer} ${isReversed ? styles.contentReversed : ''}`}>
        {/* Image */}
        <div className={styles.contentImageWrap}>
          {image?.asset && (
            <Image src={urlFor(image).width(800).height(600).quality(92).fit('crop').url()} alt={image.alt || image.assetAltText || heading || ''} fill sizes="50vw" />
          )}
        </div>

        {/* Content */}
        <div className={styles.contentBody}>
          {labelText && <span className={styles.contentLabel}>{labelText}</span>}
          {heading && <h2 className={styles.contentHeading}>{heading}</h2>}
          {body && (
            <div className={styles.contentText}>
              {Array.isArray(body) ? <PortableText value={body} /> : <p>{body}</p>}
            </div>
          )}
          {ctaText && ctaHref && (
            <Link href={ctaHref} className={styles.contentCta}>
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
