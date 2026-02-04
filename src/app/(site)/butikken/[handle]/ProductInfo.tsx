'use client'

import parse from 'html-react-parser'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/lib/shopify/types'
import { AddToCartButton } from './AddToCartButton'
import styles from './ProductInfo.module.css'

interface RelatedEvent {
  _id: string
  title: string
  slug: { current: string }
}

interface ProductInfoProps {
  product: Product
  relatedEvents?: RelatedEvent[]
}

export function ProductInfo({ product, relatedEvents }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    // Initialize with first available option for each
    const initial: Record<string, string> = {}
    product.options?.forEach((option) => {
      if (option.values.length > 0) {
        initial[option.name] = option.values[0]
      }
    })
    return initial
  })

  // Find the selected variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null

    // If only one variant (no options), return it
    if (product.variants.length === 1) return product.variants[0]

    // Find variant matching all selected options
    return (
      product.variants.find((variant) => {
        if (!variant.selectedOptions) return false
        return variant.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
      }) || product.variants[0]
    )
  }, [product.variants, selectedOptions])

  const hasOptions =
    product.options &&
    product.options.length > 0 &&
    !(product.options.length === 1 && product.options[0].name === 'Title')

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }))
  }

  // Get max quantity available for selected variant
  const maxQuantity = selectedVariant?.quantityAvailable ?? null

  // Cap quantity when variant changes and has less stock
  useEffect(() => {
    if (maxQuantity !== null && quantity > maxQuantity) {
      setQuantity(Math.max(1, maxQuantity))
    }
  }, [maxQuantity, quantity])

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    if (maxQuantity === null || quantity < maxQuantity) {
      setQuantity(quantity + 1)
    }
  }

  const variantPrice = selectedVariant ? parseFloat(selectedVariant.price.amount) : product.price

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterStatus('loading')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Subscription failed')
      }

      setNewsletterStatus('success')
      setEmail('')
      setConsent(false)
    } catch {
      setNewsletterStatus('error')
    }
  }

  return (
    <div className={styles.productInfoSection}>
      <div className={styles.productInfoHeader}>
        <h1 className={styles.productInfoTitle}>{product.title}</h1>
        {!product.comingSoon && (
          <p className={styles.productInfoPrice}>
            {variantPrice.toLocaleString('nb-NO')} {product.currencyCode}
          </p>
        )}
      </div>

      {product.descriptionHtml && (
        <div className={styles.productInfoDescription}>
          {parse(product.descriptionHtml)}
        </div>
      )}

      {/* Variant Options */}
      {hasOptions && (
        <div className={styles.productInfoOptions}>
          {product.options
            ?.filter((opt) => opt.name !== 'Title')
            .map((option) => (
              <fieldset key={option.name} className={styles.productInfoOptionGroup}>
                <legend className={styles.productInfoOptionLabel}>{option.name}</legend>
                <div
                  className={styles.productInfoOptionValues}
                  role="radiogroup"
                  aria-label={option.name}
                >
                  {option.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selectedOptions[option.name] === value}
                      className={`${styles.productInfoOptionButton} ${
                        selectedOptions[option.name] === value
                          ? styles.productInfoOptionButtonActive
                          : ''
                      }`}
                      onClick={() => handleOptionChange(option.name, value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
        </div>
      )}

      {/* Quantity Selector - hidden for coming soon */}
      {!product.comingSoon && (
        <div className={styles.productInfoQuantitySection}>
          <label className={styles.productInfoQuantityLabel}>Antall</label>
          <div className={styles.productInfoQuantity}>
            <button
              type="button"
              className={styles.productInfoQuantityButton}
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              aria-label="Reduser antall"
            >
              -
            </button>
            <span className={styles.productInfoQuantityValue}>{quantity}</span>
            <button
              type="button"
              className={styles.productInfoQuantityButton}
              onClick={increaseQuantity}
              disabled={maxQuantity !== null && quantity >= maxQuantity}
              aria-label="Øk antall"
            >
              +
            </button>
          </div>
          {maxQuantity !== null && maxQuantity <= 10 && maxQuantity > 0 && (
            <p className={styles.productInfoStockWarning}>Kun {maxQuantity} igjen på lager</p>
          )}
        </div>
      )}

      {/* Add to Cart or Coming Soon */}
      {product.comingSoon ? (
        <>
          <div className={styles.comingSoonBanner}>
            <span>Kommer snart</span>
          </div>

          {/* Newsletter signup for coming soon products */}
          <div className={styles.comingSoonNewsletter}>
            <p className={styles.comingSoonNewsletterText}>
              Meld deg på nyhetsbrevet for å få beskjed når dette blir tilgjengelig.
            </p>
            {newsletterStatus === 'success' ? (
              <p className={styles.comingSoonNewsletterSuccess}>Takk for påmeldingen!</p>
            ) : (
              <form className={styles.comingSoonNewsletterForm} onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Din e-postadresse"
                  aria-label="E-postadresse"
                  className={styles.comingSoonNewsletterInput}
                  required
                  disabled={newsletterStatus === 'loading'}
                />
                <label className={styles.comingSoonNewsletterConsent}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    Jeg samtykker til{' '}
                    <a href="/personvern" target="_blank" rel="noopener noreferrer">
                      personvern
                    </a>
                  </span>
                </label>
                <button
                  type="submit"
                  className={styles.comingSoonNewsletterButton}
                  disabled={newsletterStatus === 'loading' || !consent}
                >
                  {newsletterStatus === 'loading' ? 'Sender...' : 'Meld på'}
                </button>
                {newsletterStatus === 'error' && (
                  <p className={styles.comingSoonNewsletterError}>Noe gikk galt. Prøv igjen.</p>
                )}
              </form>
            )}
          </div>
        </>
      ) : (
        selectedVariant && (
          <AddToCartButton
            variantId={selectedVariant.id}
            available={selectedVariant.availableForSale}
            quantity={quantity}
          />
        )
      )}

      {/* Related Events */}
      {relatedEvents && relatedEvents.length > 0 && (
        <div className={styles.relatedEvents}>
          {relatedEvents.map((event) => (
            <Link
              key={event._id}
              href={`/${event.slug.current}`}
              className={styles.relatedEventBanner}
            >
              <span className={styles.relatedEventText}>
                Dette produktet er knyttet til et arrangement. Klikk her for å lese mer.
              </span>
              <span className={styles.relatedEventArrow} aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
