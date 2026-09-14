import Link from 'next/link'
import { getTranslator } from '@/lib/i18n/server'
import styles from './page.module.css'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ order?: string }>
}

export default async function ThankYouPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { order } = await searchParams
  const t = getTranslator(locale)

  return (
    <div className={styles.thankYouPage}>
      <div className={styles.thankYouContainer}>
        <div className={styles.thankYouIcon}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="32" cy="32" r="30" />
            <path d="M20 32l8 8 16-16" />
          </svg>
        </div>

        <h1 className={styles.thankYouTitle}>{t('Takk for din bestilling!')}</h1>

        {order && (
          <p className={styles.thankYouOrderNumber}>
            {t('Ordrenummer')}: {order}
          </p>
        )}

        <p className={styles.thankYouMessage}>
          {t('Vi har mottatt din bestilling og sender deg en bekreftelse på e-post.')}
        </p>

        <div className={styles.thankYouActions}>
          <Link href="/butikken" className={`${styles.thankYouButtonPrimary} site-button`}>
            {t('Fortsett å handle')}
          </Link>
          <Link href="/" className={`${styles.thankYouButtonSecondary} site-button`}>
            {t('Tilbake til forsiden')}
          </Link>
        </div>
      </div>
    </div>
  )
}
