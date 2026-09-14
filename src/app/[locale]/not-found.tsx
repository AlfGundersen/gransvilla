'use client'

import Link from 'next/link'
import { useT } from '@/lib/i18n/provider'
import styles from './not-found.module.css'

/**
 * A client component because not-found.tsx never receives route params, so the
 * locale has to come from the provider the layout already mounts.
 */
export default function NotFound() {
  const t = useT()

  return (
    <div className={styles.container}>
      <h1 className={styles.number}>404</h1>
      <p className={styles.text}>{t('Siden du leter etter finnes ikke')}</p>
      <Link href="/" className={styles.link}>
        {t('Tilbake til forsiden')}
      </Link>
    </div>
  )
}
