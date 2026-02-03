'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/lib/shopify/types'
import styles from './EventProductsSection.module.css'

interface EventProductCardProps {
  product: Product
}

function hasRealOptions(product: Product) {
  return product.options && product.options.some((opt) => opt.name !== 'Title' && opt.values.length > 1)
}

export function EventProductCard({ product }: EventProductCardProps) {
  const { addToCart, isLoading: cartLoading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    product.options?.forEach((option) => {
      if (option.values.length > 0) {
        initial[option.name] = option.values[0]
      }
    })
    return initial
  })

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null
    if (product.variants.length === 1) return product.variants[0]
    return product.variants.find((variant) => {
      if (!variant.selectedOptions) return false
      return variant.selectedOptions.every(
        (opt) => selectedOptions[opt.name] === opt.value
      )
    }) || product.variants[0]
  }, [product.variants, selectedOptions])

  const available = selectedVariant?.availableForSale ?? false
  const productImage = product.images[0]
  const isLoading = isAdding || cartLoading
  const showOptions = hasRealOptions(product)

  const variantPrice = selectedVariant
    ? parseFloat(selectedVariant.price.amount)
    : product.price
  const currencyCode = selectedVariant
    ? (selectedVariant.price.currencyCode === 'NOK' ? 'kr' : selectedVariant.price.currencyCode)
    : product.currencyCode

  const handleOptionChange = useCallback((name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleAddToCart = async () => {
    if (!available || isLoading || !selectedVariant) return

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

  return (
    <div className={styles.eventProductCard}>
      {productImage && (
        <div className={styles.eventProductImageWrapper}>
          <Image
            src={productImage.url}
            alt={productImage.altText || product.title}
            fill
            className={styles.eventProductImage}
            sizes="(max-width: 767px) 50vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <h3 className={styles.eventProductTitle}>{product.title}</h3>
      <p className={styles.eventProductPrice}>
        {variantPrice.toLocaleString('nb-NO')} {currencyCode}
      </p>
      {product.description && (
        <p className={styles.eventProductDescription}>{product.description}</p>
      )}
      {showOptions && (
        <div className={styles.eventProductOptions}>
          {product.options?.filter((opt) => opt.name !== 'Title').map((option) => (
            <fieldset key={option.name} className={styles.eventProductOptionGroup}>
              <legend className={styles.eventProductOptionLabel}>{option.name}</legend>
              <div className={styles.eventProductOptionValues}>
                {option.values.map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selectedOptions[option.name] === value}
                    className={`${styles.eventProductOptionBtn} ${
                      selectedOptions[option.name] === value ? styles.eventProductOptionBtnActive : ''
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
      <div className={styles.eventProductCardButtons}>
        {available && (
          <button
            type="button"
            className={`${styles.eventProductButton} site-button`}
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isAdding
              ? 'Legger til...'
              : added
                ? 'Lagt til!'
                : 'Legg i handlekurv'}
          </button>
        )}
        <Link href={`/nettbutikk/${product.handle}`} className={`${styles.eventProductLinkButton} site-button`}>
          Les mer
        </Link>
      </div>
    </div>
  )
}

// Exported for use in single-product layout (server component passes props)
interface EventProductSingleProps {
  product: Product
}

export function EventProductSingle({ product }: EventProductSingleProps) {
  const { addToCart, isLoading: cartLoading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    product.options?.forEach((option) => {
      if (option.values.length > 0) {
        initial[option.name] = option.values[0]
      }
    })
    return initial
  })

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null
    if (product.variants.length === 1) return product.variants[0]
    return product.variants.find((variant) => {
      if (!variant.selectedOptions) return false
      return variant.selectedOptions.every(
        (opt) => selectedOptions[opt.name] === opt.value
      )
    }) || product.variants[0]
  }, [product.variants, selectedOptions])

  const available = selectedVariant?.availableForSale ?? false
  const isLoading = isAdding || cartLoading
  const showOptions = hasRealOptions(product)

  const variantPrice = selectedVariant
    ? parseFloat(selectedVariant.price.amount)
    : product.price
  const currencyCode = selectedVariant
    ? (selectedVariant.price.currencyCode === 'NOK' ? 'kr' : selectedVariant.price.currencyCode)
    : product.currencyCode

  const handleOptionChange = useCallback((name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleAddToCart = async () => {
    if (!available || isLoading || !selectedVariant) return

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

  return (
    <>
      <div className={styles.singleProductCenter}>
        <div>
          <h3 className={styles.singleProductTitle}>{product.title}</h3>
          <p className={styles.singleProductPrice}>
            {variantPrice.toLocaleString('nb-NO')} {currencyCode}
          </p>
          {product.description && (
            <p className={styles.singleProductDescription}>{product.description}</p>
          )}
        </div>
        {showOptions && (
          <div className={styles.singleProductOptions}>
            {product.options?.filter((opt) => opt.name !== 'Title').map((option) => (
              <fieldset key={option.name} className={styles.eventProductOptionGroup}>
                <legend className={styles.eventProductOptionLabel}>{option.name}</legend>
                <div className={styles.eventProductOptionValues}>
                  {option.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selectedOptions[option.name] === value}
                      className={`${styles.eventProductOptionBtn} ${
                        selectedOptions[option.name] === value ? styles.eventProductOptionBtnActive : ''
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
      </div>
      <div className={styles.singleProductButtons}>
        {available && (
          <button
            type="button"
            className={`${styles.singleProductPrimaryBtn} site-button`}
            onClick={handleAddToCart}
            disabled={isLoading}
            aria-busy={isAdding}
            aria-live="polite"
          >
            {isAdding ? 'Legger til...' : added ? 'Lagt til!' : 'Legg i handlekurv'}
          </button>
        )}
        <Link href={`/nettbutikk/${product.handle}`} className={`${styles.singleProductSecondaryBtn} site-button`}>
          Les mer
        </Link>
      </div>
    </>
  )
}
