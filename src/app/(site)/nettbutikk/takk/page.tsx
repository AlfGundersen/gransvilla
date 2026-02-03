import Link from 'next/link'
import styles from './page.module.css'

interface Props {
  searchParams: Promise<{ order?: string }>
}

export default async function ThankYouPage({ searchParams }: Props) {
  const { order } = await searchParams

  return (
    <div className={styles.thankYouPage}>
      <div className={styles.thankYouContainer}>
        <div className={styles.thankYouIcon}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="32" cy="32" r="30" />
            <path d="M20 32l8 8 16-16" />
          </svg>
        </div>

        <h1 className={styles.thankYouTitle}>Takk for din bestilling!</h1>

        {order && (
          <p className={styles.thankYouOrderNumber}>Ordrenummer: {order}</p>
        )}

        <p className={styles.thankYouMessage}>
          Vi har mottatt din bestilling og sender deg en bekreftelse på e-post.
        </p>

        <div className={styles.thankYouActions}>
          <Link href="/nettbutikk" className={`${styles.thankYouButtonPrimary} site-button`}>
            Fortsett å handle
          </Link>
          <Link href="/" className={`${styles.thankYouButtonSecondary} site-button`}>
            Tilbake til forsiden
          </Link>
        </div>
      </div>
    </div>
  )
}
