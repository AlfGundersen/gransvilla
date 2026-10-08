'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

const VISIBLE_SECONDS = 60

/**
 * A guest's phone and email, shown on request and put away again after a
 * minute: the list is often open on a screen others can see, and is read far
 * more often than anyone is rung. Plain text rather than links, so a slip of
 * the finger does not start a call.
 */
export function Contact({ email, phone }: { email: string; phone: string }) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  if (!email && !phone) return null

  if (secondsLeft <= 0) {
    return (
      <button
        type="button"
        className={styles.contactButton}
        onClick={() => setSecondsLeft(VISIBLE_SECONDS)}
      >
        Vis kontakt
      </button>
    )
  }

  return (
    <div className={styles.contact}>
      {phone && <span>{phone}</span>}
      {email && <span>{email}</span>}
      <span className={styles.contactCountdown}>Skjules om {secondsLeft} s</span>
    </div>
  )
}
