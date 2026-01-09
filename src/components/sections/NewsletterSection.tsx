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
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.heading}>{heading}</h2>
          {description && <p className={styles.description}>{description}</p>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Din e-postadresse"
              className={styles.input}
              required
              disabled={status === 'loading'}
            />
            <button type="submit" className={styles.button} disabled={status === 'loading'}>
              {status === 'loading' ? 'Sender...' : 'Meld på'}
            </button>
          </form>

          {status === 'success' && <p className={styles.successMessage}>Takk for påmeldingen!</p>}
          {status === 'error' && (
            <p className={styles.errorMessage}>Noe gikk galt. Vennligst prøv igjen.</p>
          )}
        </div>
      </div>
    </section>
  )
}
