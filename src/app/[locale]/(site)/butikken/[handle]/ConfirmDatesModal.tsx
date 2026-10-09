'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '@/lib/i18n/provider'
import { DatesSummary } from '../DatesSummary'
import modal from '../VariantModal.module.css'

interface ConfirmDatesModalProps {
  isOpen: boolean
  onClose: () => void
  /** Called with the seats settled on for each date, in the order of `dates` */
  onConfirm: (quantities: number[], guests: number[]) => void
  productTitle: string
  /** The dates about to be added, in calendar order */
  dates: { title: string; price: number; max?: number | null }[]
  /** Seats each date starts with */
  quantity: number
  currencyCode: string
  allergies?: string
  /** Where a guest can come along: the surcharge, and how many each date starts with */
  guest?: { surcharge: number; quantity: number }
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
  guest,
}: ConfirmDatesModalProps) {
  const t = useT()

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

        <DatesSummary
          dates={dates}
          quantity={quantity}
          currencyCode={currencyCode}
          allergies={allergies}
          guest={guest}
          onCancel={onClose}
          onConfirm={onConfirm}
        />
      </div>
    </div>,
    document.body,
  )
}
