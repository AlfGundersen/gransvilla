'use client'

import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/context/CartContext'
import styles from './VariantModal.module.css'

type Variant = {
  id: string
  title: string
  availableForSale: boolean
  price: { amount: string; currencyCode: string }
}

interface VariantModalProps {
  isOpen: boolean
  onClose: () => void
  productTitle: string
  variants: Variant[]
  currencyCode: string
}

export function VariantModal({
  isOpen,
  onClose,
  productTitle,
  variants,
  currencyCode,
}: VariantModalProps) {
  const { addToCart } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedVariantId(null)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleAddToCart = async () => {
    if (!selectedVariantId || isAdding) return

    setIsAdding(true)
    try {
      await addToCart(selectedVariantId, 1)
      onClose()
    } finally {
      setIsAdding(false)
    }
  }

  if (!isOpen) return null

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true">
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Lukk"
        >
          ×
        </button>

        <h2 className={styles.modalTitle}>{productTitle}</h2>
        <p className={styles.modalSubtitle}>Velg en dato</p>

        <div className={styles.variantList} role="radiogroup" aria-label="Velg dato">
          {variants.map((variant) => {
            const isSoldOut = !variant.availableForSale
            const price = parseFloat(variant.price.amount)

            return (
              <button
                key={variant.id}
                type="button"
                role="radio"
                aria-checked={selectedVariantId === variant.id}
                disabled={isSoldOut}
                className={`${styles.variantOption} ${
                  selectedVariantId === variant.id ? styles.variantOptionSelected : ''
                } ${isSoldOut ? styles.variantOptionSoldOut : ''}`}
                onClick={() => setSelectedVariantId(variant.id)}
              >
                <span className={styles.variantTitle}>{variant.title}</span>
                <span className={styles.variantPrice}>
                  {isSoldOut
                    ? 'Utsolgt'
                    : `${price.toLocaleString('nb-NO')} ${currencyCode}`}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={handleAddToCart}
          disabled={!selectedVariantId || isAdding}
        >
          {isAdding
            ? 'Legger til...'
            : selectedVariant
              ? `Legg i handlekurv – ${parseFloat(selectedVariant.price.amount).toLocaleString('nb-NO')} ${currencyCode}`
              : 'Velg en dato'}
        </button>
      </div>
    </div>
  )
}
