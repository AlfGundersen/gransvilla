import Image from 'next/image'
import Link from 'next/link'
import { MaybeWatermark } from '@/components/Watermark'
import { urlFor } from '@/lib/sanity/image'
import type { HeroSection } from '@/types/sanity'
import styles from './HeroSection.module.css'

interface HeroSectionComponentProps {
  data: HeroSection
}

export function HeroSectionComponent({ data }: HeroSectionComponentProps) {
  const { image, announcement } = data
  const announcementText = announcement?.text?.trim()
  const announcementHref = announcement?.href?.trim()

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <div className={styles.heroImageWrap}>
          {image?.asset && (
            <>
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
              <MaybeWatermark image={image} />
            </>
          )}
          {announcementText &&
            (announcementHref ? (
              <Link
                href={announcementHref}
                className={`${styles.heroAnnouncement} site-button`}
              >
                {announcementText}
              </Link>
            ) : (
              <span className={`${styles.heroAnnouncement} site-button`}>
                {announcementText}
              </span>
            ))}
        </div>
      </div>
    </section>
  )
}
