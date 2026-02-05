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
              src={urlFor(image).width(1920).height(1080).quality(92).fit('crop').url()}
              alt={image.alt || image.assetAltText || ''}
              role={!image.alt ? 'presentation' : undefined}
              fill
              sizes="100vw"
              priority
              fetchPriority="high"
              style={
                image.hotspot
                  ? {
                      objectPosition: `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`,
                    }
                  : undefined
              }
            />
          )}
          {/* Temporary announcement - remove when ready */}
          <div className={styles.heroAnnouncement}>
            Åpner sommeren 2026...
          </div>
        </div>
      </div>
    </section>
  )
}
