'use client'

import styles from '../error.module.css'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Noe gikk galt</h1>
      <p className={styles.text}>
        Vi beklager, men noe uventet skjedde. Prøv å laste siden på nytt.
      </p>
      <button className={`${styles.button} site-button`} onClick={reset}>
        Prøv igjen
      </button>
    </div>
  )
}
