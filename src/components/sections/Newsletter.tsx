'use client'

import { useState } from 'react'
import { localeHref } from '@/lib/i18n/href'
import { useLocale, useT } from '@/lib/i18n/provider'
import styles from './Newsletter.module.css'

export default function Newsletter() {
  const locale = useLocale()
  const t = useT()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

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

  return (
    <section className={styles.newsletter}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.label}>Hold deg oppdatert</span>
          <h2 className={styles.title}>{t('Meld deg på nyhetsbrevet')}</h2>
          <p className={styles.description}>
            Få informasjon om kommende arrangementer, konserter og spesialtilbud direkte i
            innboksen.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputRow}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Din e-postadresse')}
                aria-label="E-postadresse"
                className={styles.input}
                required
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                className={`${styles.button} site-button`}
                disabled={status === 'loading' || !consent}
              >
                {status === 'loading' ? 'Sender...' : 'Meld på'}
              </button>
            </div>
            <label className={styles.consent}>
              <input
                id="newsletter-consent"
                name="newsletter-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                {t('Jeg samtykker til')}{' '}
                <a
                  href={localeHref('/personvern', locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('personvern')}
                </a>{' '}
                {t('og lagring av e-post for nyhetsbrev.')}
              </span>
            </label>
          </form>

          {status === 'success' && (
            <p className={styles.successMessage}>{t('Takk for påmeldingen!')}</p>
          )}
          {status === 'error' && (
            <p className={styles.errorMessage}>{t('Noe gikk galt. Vennligst prøv igjen.')}</p>
          )}
        </div>
      </div>
    </section>
  )
}
