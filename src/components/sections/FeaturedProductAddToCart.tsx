'use client'

import { useMemo, useState } from 'react'
import { useCart } from '@/context/CartContext'
import type { ShopifyProductVariant } from '@/lib/shopify/types'
import styles from './FeaturedProductSection.module.css'

interface ProductOption {
  name: string
  values: string[]
}

interface FeaturedProductAddToCartProps {
  variants: ShopifyProductVariant[]
  options?: ProductOption[]
  available: boolean
}

export function FeaturedProductAddToCart({ variants, options, available }: FeaturedProductAddToCartProps) {
  const { addToCart, isLoading: cartLoading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const hasOptions =
    options &&
    options.length > 0 &&
    !(options.length === 1 && options[0].name === 'Title')

  // Check if all required options have been selected
  const allOptionsSelected = useMemo(() => {
    if (!hasOptions) return true
    const requiredOptions = options?.filter((opt) => opt.name !== 'Title') || []
    return requiredOptions.every((opt) => selectedOptions[opt.name])
  }, [hasOptions, options, selectedOptions])

  // Find the selected variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!variants || variants.length === 0) return null

    // If only one variant (no options), return it
    if (variants.length === 1) return variants[0]

    // If not all options selected, return null
    if (!allOptionsSelected) return null

    // Find variant matching all selected options
    return (
      variants.find((variant) => {
        if (!variant.selectedOptions) return false
        return variant.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
      }) || null
    )
  }, [variants, selectedOptions, allOptionsSelected])

  const isLoading = isAdding || cartLoading

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }))
  }

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedVariant.availableForSale || isLoading) return

    setIsAdding(true)
    try {
      await addToCart(selectedVariant.id, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  if (!available) {
    return (
      <button type="button" className={`${styles.featProductBtnPrimary} site-button`} disabled>
        Utsolgt
      </button>
    )
  }

  return (
    <div className={styles.featProductAddToCart}>
      {/* Variant Options */}
      {hasOptions && (
        <div className={styles.featProductOptions}>
          {options
            ?.filter((opt) => opt.name !== 'Title')
            .map((option) => (
              <div key={option.name} className={styles.featProductOptionGroup}>
                <label className={styles.featProductOptionLabel}>{option.name}</label>
                <div className={styles.featProductOptionValues}>
                  {option.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.featProductOptionButton} ${
                        selectedOptions[option.name] === value
                          ? styles.featProductOptionButtonActive
                          : ''
                      }`}
                      onClick={() => handleOptionChange(option.name, value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add to Cart Button */}
      {hasOptions && !allOptionsSelected ? (
        <p className={styles.featProductSelectPrompt}>Velg et alternativ</p>
      ) : (
        <button
          type="button"
          className={`${styles.featProductBtnPrimary} site-button`}
          onClick={handleAddToCart}
          disabled={isLoading || !selectedVariant?.availableForSale}
          aria-busy={isAdding}
          aria-live="polite"
        >
          {!selectedVariant?.availableForSale
            ? 'Utsolgt'
            : isAdding
              ? 'Legger til...'
              : added
                ? 'Lagt til!'
                : 'Legg i handlekurv'}
        </button>
      )}
    </div>
  )
}
