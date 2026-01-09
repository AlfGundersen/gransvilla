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
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.imageWrapper}>
          {image?.asset && (
            <Image
              src={urlFor(image).url()}
              alt="Hero"
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
