'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './page.module.css'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  })
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const formLoadTime = useRef<number>(Date.now())

  // Reset load time when component mounts
  useEffect(() => {
    formLoadTime.current = Date.now()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    // Anti-spam: Check honeypot
    if (honeypot) {
      // Silently fail for bots
      setStatus('success')
      return
    }

    // Anti-spam: Check if form was filled too quickly (less than 3 seconds)
    const timeTaken = Date.now() - formLoadTime.current
    if (timeTaken < 3000) {
      setStatus('success') // Silently fail for bots
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          _time: timeTaken,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Noe gikk galt')
      }

      setStatus('success')
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
      })
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Noe gikk galt. Vennligst prøv igjen.')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.successMessage}>
        <h2 className={styles.successTitle}>Takk for din henvendelse!</h2>
        <p>Vi tar kontakt med deg så snart som mulig.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="firstName" className={styles.label}>
            Fornavn<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className={styles.input}
            autoComplete="given-name"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="lastName" className={styles.label}>
            Etternavn<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className={styles.input}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            E-post<span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
            autoComplete="email"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.label}>
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={styles.input}
            autoComplete="tel"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.label}>
          Melding
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          className={styles.textarea}
        />
      </div>

      {/* Honeypot field - hidden from users, bots will fill it */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          Jeg samtykker til at mine personopplysninger behandles i henhold til{' '}
          <a href="/personvern" target="_blank" rel="noopener noreferrer">
            personvernerklæringen
          </a>.
        </span>
      </label>

      {status === 'error' && (
        <p className={styles.errorMessage}>{errorMessage}</p>
      )}

      <button
        type="submit"
        className={`${styles.submitButton} site-button`}
        disabled={!consent || status === 'loading'}
      >
        {status === 'loading' ? 'Sender...' : 'Send nå'}
      </button>
    </form>
  )
}
