'use client'

import { useEffect, useRef } from 'react'
import { NewsletterForm } from './NewsletterForm'
import styles from './NewsletterModal.module.css'

interface NewsletterModalProps {
  open: boolean
  onClose: () => void
}

export function NewsletterModal({ open, onClose }: NewsletterModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click-to-close; ESC is handled natively by <dialog>
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => {
        // Native <dialog>: a click on the backdrop targets the dialog itself
        if (e.target === dialogRef.current) onClose()
      }}
      aria-label="Meld deg på nyhetsbrev"
    >
      <div className={styles.content}>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Lukk">
          ×
        </button>
        <p className={styles.title}>Holde deg oppdatert og meld deg på nyhetsbrevet</p>
        <NewsletterForm idPrefix="modal" />
      </div>
    </dialog>
  )
}
