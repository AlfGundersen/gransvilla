import Image from 'next/image'
import styles from './Timeline.module.css'

// TODO: Fetch timeline data from Sanity
const timelineYears = [
  { year: '2024', active: true },
  { year: '2023', active: false },
  { year: '2022', active: false },
  { year: '2021', active: false },
  { year: '2020', active: false },
  { year: '2019', active: false },
  { year: '2018', active: false },
  { year: '2017', active: false },
  { year: '2016', active: false },
  { year: '2015', active: false },
  { year: '2014', active: false },
  { year: '2013', active: false },
  { year: '2012', active: false },
  { year: '2011', active: false },
  { year: '2010', active: false },
  { year: '2009', active: false },
  { year: '2008', active: false },
  { year: '2007', active: false },
  { year: '2006', active: false },
  { year: '2005', active: false },
  { year: '2004', active: false },
  { year: '2003', active: false },
  { year: '2002', active: false },
  { year: '2001', active: false },
  { year: '2000', active: false },
  { year: '1999', active: false },
  { year: '1998', active: false },
  { year: '1997', active: false },
  { year: '1996', active: false },
  { year: '1995', active: false },
  { year: '1994', active: false },
  { year: '1993', active: false },
  { year: '1992', active: false },
]

export default function Timeline() {
  return (
    <section className={styles.timeline}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left side - Image and title */}
          <div className={styles.left}>
            <div className={styles.imageWrapper}>
              <Image
                src="/images/timeline-image.svg"
                alt="Gransvilla gjennom tidene"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Right side - Title and timeline */}
          <div className={styles.right}>
            <div className={styles.titleWrapper}>
              <span className={styles.label}>Etablert i</span>
              <h2 className={styles.title}>1992</h2>
            </div>

            <div className={styles.description}>
              <p>
                Gransvilla ble etablert i 1992, og siden den gang har vi utviklet oss til å bli et
                av regionens mest ettertraktede arenaer for bryllup, selskaper, konserter og
                arrangementer.
              </p>
            </div>

            <div className={styles.yearList}>
              {timelineYears.map((item) => (
                <span
                  key={item.year}
                  className={`${styles.year} ${item.active ? styles.yearActive : ''}`}
                >
                  {item.year}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
