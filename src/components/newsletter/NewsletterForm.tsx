'use client'

import { useState } from 'react'
import { localeHref } from '@/lib/i18n/href'
import { useLocale, useT } from '@/lib/i18n/provider'
import styles from './NewsletterForm.module.css'

interface NewsletterFormProps {
  /** Unique prefix so input ids don't collide when the form exists twice on a page */
  idPrefix: string
}

export function NewsletterForm({ idPrefix }: NewsletterFormProps) {
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const t = useT()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Subscription failed')
      }

      setStatus('success')
      setEmail('')
      setConsent(false)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return <p className={styles.successMessage}>{t('Takk for påmeldingen!')}</p>
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Nyhetsbrev">
      <label htmlFor={`${idPrefix}-email`} className="visually-hidden">
        {t('E-postadresse')}
      </label>
      <input
        id={`${idPrefix}-email`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('Din e-postadresse')}
        className={styles.input}
        required
        disabled={status === 'loading'}
      />
      <label className={styles.consent}>
        <input
          id={`${idPrefix}-newsletter-consent`}
          name={`${idPrefix}-newsletter-consent`}
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          {t('Jeg samtykker til')}{' '}
          <a href={localeHref('/personvern', locale)} target="_blank" rel="noopener noreferrer">
            {t('personvern')}
          </a>{' '}
          {t('og lagring av e-post for nyhetsbrev.')}
        </span>
      </label>
      <button
        type="submit"
        className={`${styles.button} site-button`}
        disabled={!consent || status === 'loading'}
      >
        {status === 'loading' ? t('Sender...') : t('Send nå')}
      </button>
      {status === 'error' && (
        <p className={styles.errorMessage}>{t('Noe gikk galt. Vennligst prøv igjen.')}</p>
      )}
    </form>
  )
}
