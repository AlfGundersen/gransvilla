'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocale, useT } from '@/lib/i18n/provider'
import { formatVariantTitle } from '@/lib/i18n/variant-date'
import modal from '../VariantModal.module.css'
import styles from './ConfirmDatesModal.module.css'

interface ConfirmDatesModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  productTitle: string
  /** The dates about to be added, in calendar order */
  dates: { title: string; price: number }[]
  /** Seats per date */
  quantity: number
  currencyCode: string
  allergies?: string
}

/**
 * A last look before several dates go into the cart at once.
 *
 * One date is added straight away, as it always was. Several are easy to pick
 * by a stray tap, and each is a separate line to pay for, so they are listed
 * and summed first. Built on the variant modal's classes so the two look alike.
 */
export function ConfirmDatesModal({
  isOpen,
  onClose,
  onConfirm,
  productTitle,
  dates,
  quantity,
  currencyCode,
  allergies,
}: ConfirmDatesModalProps) {
  const t = useT()
  const locale = useLocale()
  const numberLocale = locale === 'en' ? 'en-GB' : 'nb-NO'

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  const money = (amount: number) => `${amount.toLocaleString(numberLocale)} ${currencyCode}`
  const total = dates.reduce((sum, date) => sum + date.price * quantity, 0)

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: the backdrop only catches clicks beside the dialog
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape closes it, handled above
    <div
      className={modal.modalBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={modal.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dates-title"
      >
        <button
          type="button"
          className={modal.closeButton}
          onClick={onClose}
          aria-label={t('Lukk')}
        >
          ×
        </button>

        <h2 id="confirm-dates-title" className={modal.modalTitle}>
          {productTitle}
        </h2>
        <p className={modal.modalSubtitle}>{t('Bekreft datoer')}</p>

        <ul className={styles.dates}>
          {dates.map((date) => (
            <li key={date.title} className={styles.date}>
              <span className={styles.dateTitle}>{formatVariantTitle(date.title, locale)}</span>
              <span>
                {quantity} × {money(date.price)}
              </span>
            </li>
          ))}
        </ul>

        <p className={styles.total}>
          <span>{t('Totalt')}</span>
          <span>{money(total)}</span>
        </p>

        {allergies && (
          <p className={styles.allergies}>
            {t('Allergier')}: {allergies}
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            {t('Avbryt')}
          </button>
          <button type="button" className={modal.addButton} onClick={onConfirm}>
            {t('Legg i handlekurv')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
