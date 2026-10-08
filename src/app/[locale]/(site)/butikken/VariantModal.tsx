'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AllergyField } from '@/components/cart/AllergyField'
import { useCart } from '@/context/CartContext'
import { useLocale, useT } from '@/lib/i18n/provider'
import { formatVariantTitle, variantDateOrder } from '@/lib/i18n/variant-date'
import { DatesSummary } from './DatesSummary'
import styles from './VariantModal.module.css'

type Variant = {
  id: string
  title: string
  availableForSale: boolean
  price: { amount: string; currencyCode: string }
  quantityAvailable?: number | null
}

interface VariantModalProps {
  isOpen: boolean
  onClose: () => void
  productTitle: string
  variants: Variant[]
  currencyCode: string
  /** Ask for allergies before adding, for products that send them to the kitchen */
  askAllergies?: boolean
}

export function VariantModal({
  isOpen,
  onClose,
  productTitle,
  variants,
  currencyCode,
  askAllergies = false,
}: VariantModalProps) {
  const { addLinesToCart } = useCart()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  // Several dates get a last look before they are added; one does not
  const [isConfirming, setIsConfirming] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [allergies, setAllergies] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)
  const t = useT()
  const locale = useLocale()
  const numberLocale = locale === 'en' ? 'en-GB' : 'nb-NO'

  // The same rule as the product page: one date for sale is not a choice.
  // Held as an id rather than a variant so re-renders of the parent cannot
  // reset a selection the visitor has already made.
  const soleAvailableVariantId = useMemo(() => {
    const sellable = variants.filter((variant) => variant.availableForSale)
    return sellable.length === 1 ? sellable[0].id : null
  }, [variants])

  // The same rule as the product page here too: where the choice is between
  // dates, several can be booked in one go.
  const isDates = useMemo(
    () => variants.length > 1 && variants.every((v) => variantDateOrder(v.title) !== null),
    [variants],
  )

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(soleAvailableVariantId ? [soleAvailableVariantId] : [])
      setIsConfirming(false)
      setAllergies('')
    }
  }, [isOpen, soleAvailableVariantId])

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

  const choose = (id: string) => {
    if (!isDates) return setSelectedIds([id])
    // Filtering the variants' own list keeps the chosen dates in calendar order
    setSelectedIds(
      variants
        .filter((v) => (v.id === id ? !selectedIds.includes(v.id) : selectedIds.includes(v.id)))
        .map((v) => v.id),
    )
  }

  /** `quantities` follows the order of the chosen dates; without it, one each */
  const handleAddToCart = async (quantities?: number[]) => {
    if (selectedIds.length === 0 || isAdding) return

    setIsConfirming(false)
    setIsAdding(true)
    try {
      await addLinesToCart(
        selectedIds.map((variantId, i) => ({ variantId, quantity: quantities?.[i] ?? 1 })),
        askAllergies ? allergies : undefined,
      )
      onClose()
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  if (!isOpen) return null

  const selectedVariants = variants.filter((v) => selectedIds.includes(v.id))
  const total = selectedVariants.reduce((sum, v) => sum + parseFloat(v.price.amount), 0)
  // A product with nothing to choose only opens this to ask for allergies
  const isDefaultOnly = variants.length === 1 && variants[0].title === 'Default Title'

  const modalContent = (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true">
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={t('Lukk')}
        >
          ×
        </button>

        <h2 className={styles.modalTitle}>{productTitle}</h2>
        {isConfirming ? (
          <>
            <p className={styles.modalSubtitle}>{t('Bekreft datoer')}</p>
            <DatesSummary
              dates={selectedVariants.map((v) => ({
                title: v.title,
                price: parseFloat(v.price.amount),
                max: v.quantityAvailable,
              }))}
              quantity={1}
              currencyCode={currencyCode}
              allergies={askAllergies ? allergies.trim() : undefined}
              onCancel={() => setIsConfirming(false)}
              onConfirm={handleAddToCart}
            />
          </>
        ) : (
          <>
            {!isDefaultOnly && (
              <p className={styles.modalSubtitle}>
                {t('Velg en dato')}
                {isDates && ` (${t('du kan velge flere')})`}
              </p>
            )}

            <div
              className={styles.variantList}
              role={isDates ? 'group' : 'radiogroup'}
              aria-label={t('Velg dato')}
              hidden={isDefaultOnly}
            >
              {variants.map((variant) => {
                const isSoldOut = !variant.availableForSale
                const price = parseFloat(variant.price.amount)

                return (
                  <button
                    key={variant.id}
                    type="button"
                    role={isDates ? undefined : 'radio'}
                    aria-checked={isDates ? undefined : selectedIds.includes(variant.id)}
                    aria-pressed={isDates ? selectedIds.includes(variant.id) : undefined}
                    disabled={isSoldOut}
                    className={`${styles.variantOption} ${
                      selectedIds.includes(variant.id) ? styles.variantOptionSelected : ''
                    } ${isSoldOut ? styles.variantOptionSoldOut : ''}`}
                    onClick={() => choose(variant.id)}
                  >
                    <span className={styles.variantTitle}>
                      {formatVariantTitle(variant.title, locale)}
                    </span>
                    <span className={styles.variantPrice}>
                      {isSoldOut
                        ? t('Utsolgt')
                        : `${price.toLocaleString(numberLocale)} ${currencyCode}`}
                    </span>
                  </button>
                )
              })}
            </div>

            {askAllergies && (
              <div className={styles.allergies}>
                <AllergyField value={allergies} onChange={setAllergies} disabled={isAdding} />
              </div>
            )}

            <button
              type="button"
              className={styles.addButton}
              onClick={() => (selectedIds.length > 1 ? setIsConfirming(true) : handleAddToCart())}
              disabled={selectedIds.length === 0 || isAdding}
            >
              {isAdding
                ? t('Legger til...')
                : selectedIds.length === 0
                  ? t('Velg en dato')
                  : `${t('Legg i handlekurv')} – ${total.toLocaleString(numberLocale)} ${currencyCode}${
                      selectedIds.length > 1 ? ` (${selectedIds.length} ${t('datoer')})` : ''
                    }`}
            </button>
          </>
        )}
      </div>
    </div>
  )

  // Use portal to render at body level, avoiding transform context issues
  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}
