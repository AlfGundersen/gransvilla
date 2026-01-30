import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import type { HeroSection } from '@/types/sanity'
import styles from './HeroSection.module.css'

interface HeroSectionComponentProps {
  data: HeroSection
}

export function HeroSectionComponent({ data }: HeroSectionComponentProps) {
  const { image } = data

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <div className={styles.heroImageWrap}>
          {image?.asset && (
            <Image
              src={urlFor(image).url()}
              alt={image.alt || image.assetAltText || ''}
              role={!image.alt ? 'presentation' : undefined}
              fill
              sizes="100vw"
              priority
            />
          )}
        </div>
      </div>
    </section>
  )
}
