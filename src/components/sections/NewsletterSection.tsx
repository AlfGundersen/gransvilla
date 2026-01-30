'use client'

import { useState } from 'react'
import type { NewsletterSection } from '@/types/sanity'
import styles from './NewsletterSection.module.css'

interface NewsletterSectionComponentProps {
  data: NewsletterSection
}

export function NewsletterSectionComponent({ data }: NewsletterSectionComponentProps) {
  const { heading = 'Meld deg på nyhetsbrevet', description } = data
  const [email, setEmail] = useState('')
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
          {description && <p className={styles.newsletterDescription}>{description}</p>}

          <form className={styles.newsletterForm} onSubmit={handleSubmit}>
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
            <button type="submit" className={styles.newsletterButton} disabled={status === 'loading'}>
              {status === 'loading' ? 'Sender...' : 'Meld på'}
            </button>
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
