'use client'

import parse from 'html-react-parser'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { localeHref } from '@/lib/i18n/href'
import { useLocale, useT } from '@/lib/i18n/provider'
import { formatVariantTitle } from '@/lib/i18n/variant-date'
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
  const t = useT()
  const locale = useLocale()
  const numberLocale = locale === 'en' ? 'en-GB' : 'nb-NO'
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [quantity, setQuantity] = useState(1)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  // Initialize from URL params if present, then fill in anything that has
  // only one answer.
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    product.options?.forEach((option) => {
      if (option.name !== 'Title') {
        const paramValue = searchParams.get(option.name)
        if (paramValue && option.values.includes(paramValue)) {
          initial[option.name] = paramValue
          return
        }

        // A single date left to sell is not a choice. Picking it here opens
        // the page on the real price and an add-to-cart button, instead of a
        // disabled "Velg en dato" the visitor has to satisfy first.
        const sellable = option.values.filter((value) =>
          product.variants?.some(
            (variant) =>
              variant.availableForSale &&
              variant.selectedOptions?.some(
                (opt) => opt.name === option.name && opt.value === value,
              ),
          ),
        )
        if (sellable.length === 1) {
          initial[option.name] = sellable[0]
        }
      }
    })
    return initial
  })

  const hasOptions =
    product.options &&
    product.options.length > 0 &&
    !(product.options.length === 1 && product.options[0].name === 'Title')

  // Build a set of option values that have no available variant.
  // For multi-option products this checks "value is reachable given currently
  // selected other options". For single-option products it just checks stock.
  const soldOutValues = useMemo(() => {
    const result = new Set<string>()
    if (!product.options || !product.variants) return result

    for (const option of product.options) {
      if (option.name === 'Title') continue
      for (const value of option.values) {
        const matchingVariants = product.variants.filter((variant) => {
          if (!variant.selectedOptions) return false
          // Variant must match this value...
          const matchesThisValue = variant.selectedOptions.some(
            (opt) => opt.name === option.name && opt.value === value,
          )
          if (!matchesThisValue) return false
          // ...and any other currently selected options.
          return variant.selectedOptions.every((opt) => {
            if (opt.name === option.name) return true
            const selected = selectedOptions[opt.name]
            return !selected || selected === opt.value
          })
        })
        if (matchingVariants.length > 0 && !matchingVariants.some((v) => v.availableForSale)) {
          result.add(`${option.name}::${value}`)
        }
      }
    }
    return result
  }, [product.options, product.variants, selectedOptions])

  // Check if all required options have been selected
  const allOptionsSelected = useMemo(() => {
    if (!hasOptions) return true
    const requiredOptions = product.options?.filter((opt) => opt.name !== 'Title') || []
    return requiredOptions.every((opt) => selectedOptions[opt.name])
  }, [hasOptions, product.options, selectedOptions])

  // Find the selected variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null

    // If only one variant (no options), return it
    if (product.variants.length === 1) return product.variants[0]

    // If not all options selected, return null
    if (!allOptionsSelected) return null

    // Find variant matching all selected options
    return (
      product.variants.find((variant) => {
        if (!variant.selectedOptions) return false
        return variant.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
      }) || null
    )
  }, [product.variants, selectedOptions, allOptionsSelected])

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => {
      const newOptions = { ...prev, [optionName]: value }

      // Update URL with new options
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(newOptions).forEach(([key, val]) => {
        params.set(key, val)
      })
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })

      return newOptions
    })
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
            {hasOptions && !allOptionsSelected
              ? `${t('Fra')} ${product.price.toLocaleString(numberLocale)} ${product.currencyCode}`
              : `${variantPrice.toLocaleString(numberLocale)} ${product.currencyCode}`}
          </p>
        )}
      </div>

      {product.descriptionHtml && (
        <div className={styles.productInfoDescription}>{parse(product.descriptionHtml)}</div>
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
                  {option.values.map((value) => {
                    const isSoldOut = soldOutValues.has(`${option.name}::${value}`)
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selectedOptions[option.name] === value}
                        aria-disabled={isSoldOut}
                        className={`${styles.productInfoOptionButton} ${
                          selectedOptions[option.name] === value
                            ? styles.productInfoOptionButtonActive
                            : ''
                        } ${isSoldOut ? styles.productInfoOptionButtonSoldOut : ''}`}
                        onClick={() => handleOptionChange(option.name, value)}
                      >
                        {formatVariantTitle(value, locale)}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}
        </div>
      )}

      {/* Quantity Selector - hidden for coming soon */}
      {!product.comingSoon && (
        <div className={styles.productInfoQuantitySection}>
          <label className={styles.productInfoQuantityLabel}>{t('Antall')}</label>
          <div className={styles.productInfoQuantity}>
            <button
              type="button"
              className={styles.productInfoQuantityButton}
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              aria-label={t('Reduser antall')}
            >
              -
            </button>
            <span className={styles.productInfoQuantityValue}>{quantity}</span>
            <button
              type="button"
              className={styles.productInfoQuantityButton}
              onClick={increaseQuantity}
              disabled={maxQuantity !== null && quantity >= maxQuantity}
              aria-label={t('Øk antall')}
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
            <span>{t('Kommer snart')}</span>
          </div>

          {/* Newsletter signup for coming soon products */}
          <div className={styles.comingSoonNewsletter}>
            <p className={styles.comingSoonNewsletterText}>
              {t('Meld deg på nyhetsbrevet for å få beskjed når dette blir tilgjengelig.')}
            </p>
            {newsletterStatus === 'success' ? (
              <p className={styles.comingSoonNewsletterSuccess}>{t('Takk for påmeldingen!')}</p>
            ) : (
              <form className={styles.comingSoonNewsletterForm} onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('Din e-postadresse')}
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
                    <a
                      href={localeHref('/personvern', locale)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      personvern
                    </a>
                  </span>
                </label>
                <button
                  type="submit"
                  className={styles.comingSoonNewsletterButton}
                  disabled={newsletterStatus === 'loading' || !consent}
                >
                  {newsletterStatus === 'loading' ? t('Sender...') : t('Meld på')}
                </button>
                {newsletterStatus === 'error' && (
                  <p className={styles.comingSoonNewsletterError}>
                    {t('Noe gikk galt. Prøv igjen.')}
                  </p>
                )}
              </form>
            )}
          </div>
        </>
      ) : hasOptions && !allOptionsSelected ? (
        <button className={styles.addToCartDisabled} disabled>
          {t('Velg en dato')}
        </button>
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
              href={localeHref(`/${event.slug.current}`, locale)}
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
