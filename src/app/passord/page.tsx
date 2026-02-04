'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import styles from './page.module.css'

function PasswordForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        const redirectTo = searchParams.get('from') || '/'
        router.push(redirectTo)
        router.refresh()
      } else {
        setError('Feil passord')
      }
    } catch {
      setError('Noe gikk galt')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Passord"
        className={styles.input}
        autoFocus
      />

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={`${styles.button} site-button`} disabled={isLoading}>
        {isLoading ? 'Logger inn...' : 'Logg inn'}
      </button>
    </form>
  )
}

function PageContent() {
  const [showPassword, setShowPassword] = useState(false)

  if (showPassword) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Gransvilla</h1>
        <p className={styles.subtitle}>Skriv inn passord for å fortsette</p>
        <PasswordForm />
      </div>
    )
  }

  return (
    <div className={styles.splashContainer}>
      <Image
        src="/logo.svg"
        alt="Gransvilla"
        width={500}
        height={500}
        className={styles.logo}
        priority
      />
      <p className={styles.splashText}>Lansering på gang...</p>
      <button
        type="button"
        onClick={() => setShowPassword(true)}
        className={`${styles.button} site-button`}
      >
        Logg inn
      </button>
    </div>
  )
}

export default function PasswordPage() {
  return (
    <div className={styles.page}>
      <Suspense>
        <PageContent />
      </Suspense>
    </div>
  )
}
