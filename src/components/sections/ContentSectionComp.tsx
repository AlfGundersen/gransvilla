import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/image'
import type { ContentSection } from '@/types/sanity'
import styles from './ContentSection.module.css'

interface ContentSectionComponentProps {
  data: ContentSection
}

export function ContentSectionComponent({ data }: ContentSectionComponentProps) {
  const { label, heading, body, cta, image, layout = 'imageRight' } = data

  const isReversed = layout === 'imageLeft'

  return (
    <section className={styles.section}>
      <div className={`${styles.container} ${isReversed ? styles.reversed : ''}`}>
        {/* Image */}
        <div className={styles.imageWrapper}>
          {image?.asset && (
            <Image src={urlFor(image).url()} alt={image.alt || heading} fill sizes="50vw" />
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {label && <span className={styles.label}>{label}</span>}
          <h2 className={styles.heading}>{heading}</h2>
          {body && <p className={styles.body}>{body}</p>}
          {cta?.label && cta?.href && (
            <Link href={cta.href} className={styles.cta}>
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
