import Image from 'next/image'
import { Link } from 'next-view-transitions'
import styles from './Arrangementer.module.css'

// TODO: Fetch from Sanity
const eventTypes = [
  { label: 'Bryllup', href: '/bryllup' },
  { label: 'Selskaper', href: '/selskaper' },
  { label: 'Konserter', href: '/konserter' },
  { label: 'Søndagsfrokost', href: '/sondagsfrokost' },
]

export default function Arrangementer() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left: Navigation */}
          <div className={styles.nav}>
            <span className={styles.label}>Arrangementer</span>
            <ul className={styles.navList}>
              {eventTypes.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.navLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Middle: Main image */}
          <div className={styles.imageMain}>
            <Image
              src="/images/arrangementer-1.svg"
              alt="Bryllup på Gransvilla"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>

          {/* Right: Secondary image */}
          <div className={styles.imageSecondary}>
            <Image
              src="/images/arrangementer-2.svg"
              alt="Selskaper på Gransvilla"
              fill
              sizes="(max-width: 768px) 100vw, 30vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
