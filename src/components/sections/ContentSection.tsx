import Image from 'next/image'
import Link from 'next/link'
import styles from './ContentSection.module.css'

interface ContentSectionProps {
  label?: string
  title: string
  description: string
  image: {
    src: string
    alt: string
  }
  ctaText?: string
  ctaHref?: string
  reversed?: boolean
}

export default function ContentSection({
  label,
  title,
  description,
  image,
  ctaText,
  ctaHref,
  reversed = false,
}: ContentSectionProps) {
  return (
    <section className={styles.section}>
      <div className={`${styles.container} ${reversed ? styles.reversed : ''}`}>
        {/* Image */}
        <div className={styles.imageWrapper}>
          <Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 50vw" />
        </div>

        {/* Content */}
        <div className={styles.content}>
          {label && <span className={styles.label}>{label}</span>}
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
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
