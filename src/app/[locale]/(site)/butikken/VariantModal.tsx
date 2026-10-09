'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AllergyField } from '@/components/cart/AllergyField'
import { useCart } from '@/context/CartContext'
import { useLocale, useT } from '@/lib/i18n/provider'
import { formatVariantTitle, variantDateOrder } from '@/lib/i18n/variant-date'
import type { GuestAddon } from '@/lib/shopify/types'
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
  /** Set where a guest can be brought along, for a surcharge */
  guestAddon?: GuestAddon
}

export function VariantModal({
  isOpen,
  onClose,
  productTitle,
  variants,
  currencyCode,
  askAllergies = false,
  guestAddon,
}: VariantModalProps) {
  const { addLinesToCart } = useCart()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  // Several dates get a last look before they are added; one does not
  const [isConfirming, setIsConfirming] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [allergies, setAllergies] = useState('')
  // A guest is asked for; how many, and on which dates, is settled in the summary
  const [withGuest, setWithGuest] = useState(false)
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
      setWithGuest(false)
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

  /**
   * `quantities` and `guests` follow the order of the chosen dates; without
   * them, one each and no guest. A guest is one more lunch plus the surcharge,
   * which names the lunch the guest has a seat on.
   */
  const handleAddToCart = async (quantities?: number[], guests: number[] = []) => {
    if (selectedIds.length === 0 || isAdding) return

    setIsConfirming(false)
    setIsAdding(true)
    try {
      const chosen = variants.filter((v) => selectedIds.includes(v.id))
      await addLinesToCart(
        [
          ...chosen.map((variant, i) => ({
            variantId: variant.id,
            quantity: (quantities?.[i] ?? 1) + (guests[i] ?? 0),
          })),
          ...chosen.flatMap((variant, i) =>
            guestAddon && guests[i] > 0
              ? [{ variantId: guestAddon.variantId, quantity: guests[i], guestOf: variant.id }]
              : [],
          ),
        ].filter((line) => line.quantity > 0),
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

  // What a guest pays in all: the lunch and the surcharge
  const guestPrice = guestAddon
    ? parseFloat((variants.find((v) => selectedIds.includes(v.id)) ?? variants[0]).price.amount) +
      guestAddon.price
    : 0
  const selectedVariants = variants.filter((v) => selectedIds.includes(v.id))
  const total = selectedVariants.reduce(
    (sum, v) => sum + parseFloat(v.price.amount) + (withGuest && guestAddon ? guestPrice : 0),
    0,
  )
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
              guest={withGuest && guestAddon ? { price: guestPrice, quantity: 1 } : undefined}
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

            {guestAddon && (
              <button
                type="button"
                className={`${styles.guestToggle} ${withGuest ? styles.guestToggleOn : ''}`}
                aria-pressed={withGuest}
                onClick={() => setWithGuest(!withGuest)}
              >
                {withGuest ? '✓ ' : '+ '}
                {withGuest ? t('Gjest lagt til') : t('Legg til gjest')} (
                {guestPrice.toLocaleString(numberLocale)} {currencyCode})
              </button>
            )}

            <button
              type="button"
              className={styles.addButton}
              // With a guest there are two kinds of seat to count, so even one
              // date goes by way of the summary
              onClick={() =>
                selectedIds.length > 1 || (withGuest && guestAddon)
                  ? setIsConfirming(true)
                  : handleAddToCart()
              }
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
