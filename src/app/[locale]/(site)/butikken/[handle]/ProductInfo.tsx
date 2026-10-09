'use client'

import parse from 'html-react-parser'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AllergyField } from '@/components/cart/AllergyField'
import { useCart } from '@/context/CartContext'
import { localeHref } from '@/lib/i18n/href'
import { useLocale, useT } from '@/lib/i18n/provider'
import { formatVariantTitle, variantDateOrder } from '@/lib/i18n/variant-date'
import type { Product } from '@/lib/shopify/types'
import { AddToCartButton } from './AddToCartButton'
import buttonStyles from './AddToCartButton.module.css'
import { ConfirmDatesModal } from './ConfirmDatesModal'
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

/**
 * Dates are laid out as a grid of equal buttons instead of each being as wide
 * as its own digits, which left the rows ragged. Other options keep their
 * natural widths.
 */
function optionDatesClass(values: string[]): string {
  if (!values.every((value) => variantDateOrder(value) !== null)) return ''
  const timed = values.some((value) => value.includes('kl'))
  return timed ? styles.productInfoOptionValuesTimed : styles.productInfoOptionValuesDays
}

export function ProductInfo({ product, relatedEvents }: ProductInfoProps) {
  const { guestAddon } = product
  const t = useT()
  const locale = useLocale()
  const numberLocale = locale === 'en' ? 'en-GB' : 'nb-NO'

  const [quantity, setQuantity] = useState(1)
  // Guests brought along, on top of the members counted in `quantity`
  const [guests, setGuests] = useState(0)
  // Most who book are members on their own, so the guest row is asked for
  const [showGuests, setShowGuests] = useState(false)
  // A month of lunches is a wall of dates; the week ahead is what is usually wanted
  const [showAllDates, setShowAllDates] = useState(false)
  const [allergies, setAllergies] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  // Starts with anything that has only one answer. What the address asks for
  // is applied once the page is in the browser (below): reading it here, with
  // useSearchParams, would opt the whole page out of being rendered on the
  // server — and stop it building at all without a loading state around it.
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    product.options?.forEach((option) => {
      if (option.name !== 'Title') {
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

  // A product sold by date can be booked for several dates in one go: the
  // lunch is bought for the week, not one day at a time. Only when the date is
  // the one thing to choose, so a second option cannot make a pick ambiguous.
  const dateOption = useMemo(() => {
    const options = product.options?.filter((opt) => opt.name !== 'Title') ?? []
    const [only] = options
    return options.length === 1 && only.values.every((value) => variantDateOrder(value) !== null)
      ? only
      : null
  }, [product.options])

  const { addLinesToCart } = useCart()
  const [selectedDates, setSelectedDates] = useState<string[]>(() => {
    const first = dateOption && selectedOptions[dateOption.name]
    return first ? [first] : []
  })
  const [isConfirmingDates, setIsConfirmingDates] = useState(false)
  const [isAddingDates, setIsAddingDates] = useState(false)

  // A link can name the option to open on: /butikken/x?Dato=08.11.2026
  // biome-ignore lint/correctness/useExhaustiveDependencies: read once, when the page arrives
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const asked: Record<string, string> = {}
    for (const option of product.options ?? []) {
      const value = params.get(option.name)
      if (option.name !== 'Title' && value && option.values.includes(value)) {
        asked[option.name] = value
      }
    }
    if (Object.keys(asked).length === 0) return

    setSelectedOptions((current) => ({ ...current, ...asked }))
    if (dateOption && asked[dateOption.name]) setSelectedDates([asked[dateOption.name]])
  }, [])

  /** Puts the choice in the address without a navigation, so it can be shared. */
  const writeQuery = (change: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(window.location.search)
    change(params)
    const query = params.toString()
    window.history.replaceState(
      null,
      '',
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    )
  }

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

      writeQuery((params) => {
        for (const [key, val] of Object.entries(newOptions)) params.set(key, val)
      })

      return newOptions
    })
  }

  // The variants behind the chosen dates, in calendar order
  const selectedDateVariants = useMemo(() => {
    if (!dateOption) return []
    return selectedDates.flatMap((date) => {
      const variant = product.variants?.find(
        (candidate) =>
          candidate.availableForSale &&
          candidate.selectedOptions?.some(
            (opt) => opt.name === dateOption.name && opt.value === date,
          ),
      )
      return variant ? [{ date, variant }] : []
    })
  }, [dateOption, selectedDates, product.variants])

  // The dates on show: the week from the first one, for a product sold day by
  // day. A dated event has few enough to show them all, and each is a choice
  // in its own right. A date already chosen is never hidden.
  const visibleDates = useMemo(() => {
    if (!dateOption) return []
    const all = dateOption.values
    if (showAllDates || all.some((value) => value.includes('kl'))) return all
    const first = Math.min(...all.map((value) => variantDateOrder(value) ?? Infinity))
    const week = 7 * 24 * 60 * 60 * 1000
    return all.filter(
      (value) =>
        (variantDateOrder(value) ?? Infinity) < first + week || selectedDates.includes(value),
    )
  }, [dateOption, showAllDates, selectedDates])

  /** Keeps the single-date state and the address in step with the dates chosen. */
  const applyDates = (dates: string[]) => {
    if (!dateOption) return
    setSelectedDates(dates)
    setSelectedOptions(dates.length > 0 ? { [dateOption.name]: dates[0] } : {})

    // The address can only name one date, so it does when there is one
    writeQuery((params) => {
      if (dates.length === 1) params.set(dateOption.name, dates[0])
      else params.delete(dateOption.name)
    })
  }

  const toggleDate = (value: string) => {
    if (!dateOption || soldOutValues.has(`${dateOption.name}::${value}`)) return
    // Filtering the option's own list keeps the chosen dates in calendar order
    applyDates(
      dateOption.values.filter((date) =>
        date === value ? !selectedDates.includes(date) : selectedDates.includes(date),
      ),
    )
  }

  // A guest is one more lunch, which takes a seat like any other, plus the
  // surcharge. `guestQuantities` is empty where no guest can be brought.
  const addSelectedDates = async (quantities: number[], guestQuantities: number[] = []) => {
    setIsConfirmingDates(false)
    setIsAddingDates(true)
    try {
      await addLinesToCart(
        [
          ...selectedDateVariants.map(({ variant }, i) => ({
            variantId: variant.id,
            quantity: (quantities[i] ?? quantity) + (guestQuantities[i] ?? 0),
          })),
          // The surcharge is one variant whatever the day, so each line
          // names the lunch the guest has a seat on
          ...selectedDateVariants.flatMap(({ variant }, i) =>
            guestAddon && guestQuantities[i] > 0
              ? [
                  {
                    variantId: guestAddon.variantId,
                    quantity: guestQuantities[i],
                    guestOf: variant.id,
                  },
                ]
              : [],
          ),
        ].filter((line) => line.quantity > 0),
        product.askAllergies ? allergies : undefined,
      )
      setAllergies('')
      setGuests(0)
      setShowGuests(false)
      setQuantity(1)
      applyDates([])
    } catch (error) {
      // Nothing was added, so the dates stay chosen, ready to try again
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAddingDates(false)
    }
  }

  // Get max quantity available for the selected variant, or across the chosen
  // dates: the same number of seats is booked on each
  const dateStock = selectedDateVariants.flatMap(({ variant }) =>
    typeof variant.quantityAvailable === 'number' ? [variant.quantityAvailable] : [],
  )
  const maxQuantity =
    selectedDateVariants.length > 1
      ? dateStock.length > 0
        ? Math.min(...dateStock)
        : null
      : (selectedVariant?.quantityAvailable ?? null)

  // Cap quantity when variant changes and has less stock
  useEffect(() => {
    if (maxQuantity !== null && quantity + guests > maxQuantity) {
      setGuests(0)
      setQuantity(Math.max(1, maxQuantity))
    }
  }, [maxQuantity, quantity, guests])

  // Members and guests share the seats, and at least one person is booked
  const seatsFull = maxQuantity !== null && quantity + guests >= maxQuantity
  const minQuantity = guests > 0 ? 0 : 1

  const decreaseQuantity = () => {
    if (quantity > minQuantity) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    if (!seatsFull) setQuantity(quantity + 1)
  }

  const variantPrice = selectedVariant ? parseFloat(selectedVariant.price.amount) : product.price
  // What a guest pays in all: the lunch and the surcharge
  const guestPrice = guestAddon ? variantPrice + guestAddon.price : null

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
                <legend className={styles.productInfoOptionLabel}>
                  {option.name}
                  {option === dateOption && option.values.length > 1 && (
                    <span className={styles.productInfoOptionHint}>
                      {' '}
                      ({t('du kan velge flere')})
                    </span>
                  )}
                </legend>
                <div
                  className={`${styles.productInfoOptionValues} ${optionDatesClass(option.values)}`}
                  role={option === dateOption ? 'group' : 'radiogroup'}
                  aria-label={option.name}
                >
                  {(option === dateOption ? visibleDates : option.values).map((value) => {
                    const isSoldOut = soldOutValues.has(`${option.name}::${value}`)
                    // Dates are switched on and off; anything else is one of several
                    const isDate = option === dateOption
                    const isSelected = isDate
                      ? selectedDates.includes(value)
                      : selectedOptions[option.name] === value
                    return (
                      <button
                        key={value}
                        type="button"
                        role={isDate ? undefined : 'radio'}
                        aria-checked={isDate ? undefined : isSelected}
                        aria-pressed={isDate ? isSelected : undefined}
                        aria-disabled={isSoldOut}
                        className={`${styles.productInfoOptionButton} ${
                          isSelected ? styles.productInfoOptionButtonActive : ''
                        } ${isSoldOut ? styles.productInfoOptionButtonSoldOut : ''}`}
                        onClick={() =>
                          isDate ? toggleDate(value) : handleOptionChange(option.name, value)
                        }
                      >
                        {formatVariantTitle(value, locale)}
                      </button>
                    )
                  })}
                </div>
                {option === dateOption && visibleDates.length < option.values.length && (
                  <button
                    type="button"
                    className={styles.productInfoTextButton}
                    onClick={() => setShowAllDates(true)}
                  >
                    {t('Vis flere datoer')}
                  </button>
                )}
                {/* Said where the dates are picked, so the one quantity further
                    down is not taken to be the only chance to set it */}
                {option === dateOption && selectedDateVariants.length > 1 && (
                  <p className={styles.productInfoDatesHint} aria-live="polite">
                    {selectedDateVariants.length} {t('datoer valgt')}.{' '}
                    {t('Du kan velge ulike antall per dato i neste steg.')}
                  </p>
                )}
              </fieldset>
            ))}
        </div>
      )}

      {/* Quantity Selector - hidden for coming soon */}
      {!product.comingSoon && (
        <div className={styles.productInfoOrderRow}>
          <div className={styles.productInfoQuantitySection}>
            <label className={styles.productInfoQuantityLabel}>
              {/* Once a guest is counted beside it, this one says who it counts */}
              {showGuests ? t('Medlem') : t('Antall')}
              {showGuests && (
                <span className={styles.productInfoOptionHint}>
                  {' '}
                  ({variantPrice.toLocaleString(numberLocale)} {product.currencyCode})
                </span>
              )}
            </label>
            <div className={styles.productInfoQuantity}>
              <button
                type="button"
                className={styles.productInfoQuantityButton}
                onClick={decreaseQuantity}
                disabled={quantity <= minQuantity}
                aria-label={t('Reduser antall')}
              >
                -
              </button>
              <span className={styles.productInfoQuantityValue}>{quantity}</span>
              <button
                type="button"
                className={styles.productInfoQuantityButton}
                onClick={increaseQuantity}
                disabled={seatsFull}
                aria-label={t('Øk antall')}
              >
                +
              </button>
            </div>
            {maxQuantity !== null && maxQuantity <= 10 && maxQuantity > 0 && (
              <p className={styles.productInfoStockWarning}>Kun {maxQuantity} igjen på lager</p>
            )}
            {guestAddon && guestPrice !== null && !showGuests && (
              <button
                type="button"
                className={`${styles.productInfoOptionButton} ${styles.productInfoAddGuest}`}
                onClick={() => {
                  setShowGuests(true)
                  if (!seatsFull) setGuests(1)
                }}
              >
                + {t('Legg til gjest')} ({guestPrice.toLocaleString(numberLocale)}{' '}
                {product.currencyCode})
              </button>
            )}
            {guestAddon && guestPrice !== null && showGuests && (
              <>
                <span
                  className={`${styles.productInfoQuantityLabel} ${styles.productInfoGuestLabel}`}
                >
                  {t('Gjest')}
                  <span className={styles.productInfoOptionHint}>
                    {' '}
                    ({guestPrice.toLocaleString(numberLocale)} {product.currencyCode})
                  </span>
                </span>
                <div className={styles.productInfoQuantity}>
                  <button
                    type="button"
                    className={styles.productInfoQuantityButton}
                    onClick={() => setGuests(guests - 1)}
                    disabled={guests <= (quantity > 0 ? 0 : 1)}
                    aria-label={`${t('Reduser antall')}: ${t('Gjest')}`}
                  >
                    -
                  </button>
                  <span className={styles.productInfoQuantityValue}>{guests}</span>
                  <button
                    type="button"
                    className={styles.productInfoQuantityButton}
                    onClick={() => setGuests(guests + 1)}
                    disabled={seatsFull}
                    aria-label={`${t('Øk antall')}: ${t('Gjest')}`}
                  >
                    +
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Beside the quantity where there is room, wrapping underneath where there is not */}
          {product.askAllergies && selectedVariant?.availableForSale !== false && (
            <div className={styles.productInfoAllergies}>
              <AllergyField value={allergies} onChange={setAllergies} />
            </div>
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
      ) : selectedDateVariants.length > 1 ? (
        <>
          <button
            type="button"
            className={`${buttonStyles.button} site-button`}
            onClick={() => setIsConfirmingDates(true)}
            disabled={isAddingDates}
            aria-busy={isAddingDates}
            aria-live="polite"
          >
            {isAddingDates
              ? t('Legger til...')
              : `${t('Legg i handlekurv')} (${selectedDateVariants.length} ${t('datoer')})`}
          </button>
          <ConfirmDatesModal
            isOpen={isConfirmingDates}
            onClose={() => setIsConfirmingDates(false)}
            onConfirm={addSelectedDates}
            productTitle={product.title}
            dates={selectedDateVariants.map(({ date, variant }) => ({
              title: date,
              price: parseFloat(variant.price.amount),
              max: variant.quantityAvailable,
            }))}
            quantity={quantity}
            currencyCode={product.currencyCode}
            allergies={product.askAllergies ? allergies.trim() : undefined}
            guest={
              guestPrice !== null && showGuests
                ? { price: guestPrice, quantity: guests }
                : undefined
            }
          />
        </>
      ) : guestAddon && guests > 0 && selectedDateVariants.length === 1 ? (
        // One date with a guest is two lines, so it goes the way several dates do
        <button
          type="button"
          className={`${buttonStyles.button} site-button`}
          onClick={() => addSelectedDates([quantity], [guests])}
          disabled={isAddingDates}
          aria-busy={isAddingDates}
          aria-live="polite"
        >
          {isAddingDates ? t('Legger til...') : t('Legg i handlekurv')}
        </button>
      ) : selectedVariant ? (
        <AddToCartButton
          variantId={selectedVariant.id}
          available={selectedVariant.availableForSale}
          quantity={quantity}
          allergies={product.askAllergies ? allergies : undefined}
          // The next lunch added is as likely to be for someone else
          onAdded={() => setAllergies('')}
        />
      ) : (
        // Every date has been, so there is no variant left to offer
        <button type="button" className={styles.addToCartDisabled} disabled>
          {t('Utsolgt')}
        </button>
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
