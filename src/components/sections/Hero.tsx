import Image from 'next/image'
import styles from './Hero.module.css'

// TODO: Fetch hero image from Sanity
const heroImage = {
  src: '/images/hero.png',
  alt: 'Gransvilla',
}

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.imageWrapper}>
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          sizes="100vw"
          priority
          fetchPriority="high"
        />
      </div>
    </section>
  )
}
