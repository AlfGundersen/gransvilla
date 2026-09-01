'use client'

import { useState } from 'react'
import styles from './NewsletterForm.module.css'

interface NewsletterFormProps {
  /** Unique prefix so input ids don't collide when the form exists twice on a page */
  idPrefix: string
}

export function NewsletterForm({ idPrefix }: NewsletterFormProps) {
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

  if (status === 'success') {
    return <p className={styles.successMessage}>Takk for påmeldingen!</p>
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Nyhetsbrev">
      <label htmlFor={`${idPrefix}-email`} className="visually-hidden">
        E-postadresse
      </label>
      <input
        id={`${idPrefix}-email`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Din e-postadresse"
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
          Jeg samtykker til{' '}
          <a href="/personvern" target="_blank" rel="noopener noreferrer">
            personvern
          </a>{' '}
          og lagring av e-post for nyhetsbrev.
        </span>
      </label>
      <button
        type="submit"
        className={`${styles.button} site-button`}
        disabled={!consent || status === 'loading'}
      >
        {status === 'loading' ? 'Sender...' : 'Send nå'}
      </button>
      {status === 'error' && (
        <p className={styles.errorMessage}>Noe gikk galt. Vennligst prøv igjen.</p>
      )}
    </form>
  )
}
