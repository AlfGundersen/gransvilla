'use client'

import { useState } from 'react'
import styles from './Newsletter.module.css'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    // TODO: Integrate with Mailjet API
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className={styles.newsletter}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.label}>Hold deg oppdatert</span>
          <h2 className={styles.title}>Meld deg på nyhetsbrevet</h2>
          <p className={styles.description}>
            Få informasjon om kommende arrangementer, konserter og spesialtilbud direkte i
            innboksen.
          </p>

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
