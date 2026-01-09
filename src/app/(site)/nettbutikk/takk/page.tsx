import Link from 'next/link'
import styles from './page.module.css'

interface Props {
  searchParams: Promise<{ order?: string }>
}

export default async function ThankYouPage({ searchParams }: Props) {
  const { order } = await searchParams

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.icon}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="32" cy="32" r="30" />
            <path d="M20 32l8 8 16-16" />
          </svg>
        </div>

        <h1 className={styles.title}>Takk for din bestilling!</h1>

        {order && (
          <p className={styles.orderNumber}>Ordrenummer: {order}</p>
        )}

        <p className={styles.message}>
          Vi har mottatt din bestilling og sender deg en bekreftelse på e-post.
        </p>

        <div className={styles.actions}>
          <Link href="/nettbutikk" className={styles.buttonPrimary}>
            Fortsett å handle
          </Link>
          <Link href="/" className={styles.buttonSecondary}>
            Tilbake til forsiden
          </Link>
        </div>
      </div>
    </div>
  )
}
