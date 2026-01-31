'use client'

import { useState } from 'react'
import { PortableText } from '@portabletext/react'
import type { NewsletterSection } from '@/types/sanity'
import styles from './NewsletterSection.module.css'

interface NewsletterSectionComponentProps {
  data: NewsletterSection
}

export function NewsletterSectionComponent({ data }: NewsletterSectionComponentProps) {
  const { heading = 'Meld deg på nyhetsbrevet', description } = data
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    // TODO: Integrate with Mailjet API
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className={styles.newsletterSection} aria-label={heading}>
      <div className={styles.newsletterContainer}>
        <div className={styles.newsletterContent}>
          <h2 className={styles.newsletterHeading}>{heading}</h2>
          {description && (
            <div className={styles.newsletterDescription}>
              {Array.isArray(description) ? <PortableText value={description} /> : <p>{description}</p>}
            </div>
          )}

          <form className={styles.newsletterForm} onSubmit={handleSubmit}>
            <div className={styles.newsletterInputRow}>
              <label htmlFor="newsletter-email" className="visually-hidden">E-postadresse</label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Din e-postadresse"
                className={styles.newsletterInput}
                required
                disabled={status === 'loading'}
              />
              <button type="submit" className={styles.newsletterButton} disabled={status === 'loading' || !consent}>
                {status === 'loading' ? 'Sender...' : 'Meld på'}
              </button>
            </div>
            <label className={styles.newsletterConsent}>
              <input
                id="newsletter-section-consent"
                name="newsletter-section-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>Jeg samtykker til <a href="/personvern" target="_blank" rel="noopener noreferrer">personvern</a> og lagring av e-post for nyhetsbrev.</span>
            </label>
          </form>

          <div aria-live="polite" aria-atomic="true">
            {status === 'success' && <p className={styles.newsletterSuccess}>Takk for påmeldingen!</p>}
            {status === 'error' && (
              <p className={styles.newsletterError}>Noe gikk galt. Vennligst prøv igjen.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
