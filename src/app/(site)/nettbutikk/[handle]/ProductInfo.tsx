'use client'

import { useState, useMemo } from 'react'
import type { Product } from '@/lib/shopify/types'
import { AddToCartButton } from './AddToCartButton'
import styles from './ProductInfo.module.css'

interface ProductInfoProps {
  product: Product
}

interface AccordionItem {
  title: string
  content: string
}

const accordionItems: AccordionItem[] = [
  {
    title: 'Frakt',
    content: 'Vi sender bestillinger innen 1-3 virkedager. Fri frakt på bestillinger over 500 kr. Standard frakt koster 79 kr.',
  },
  {
    title: 'Retur',
    content: 'Du har 30 dagers returrett på alle varer. Produktet må være ubrukt og i original emballasje. Kontakt oss for returinstruksjoner.',
  },
  {
    title: 'Om produktet',
    content: 'Alle våre produkter er håndplukket for kvalitet. Ta kontakt hvis du har spørsmål om produktet.',
  },
]

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
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
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)

  // Find the selected variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null

    // If only one variant (no options), return it
    if (product.variants.length === 1) return product.variants[0]

    // Find variant matching all selected options
    return product.variants.find((variant) => {
      if (!variant.selectedOptions) return false
      return variant.selectedOptions.every(
        (opt) => selectedOptions[opt.name] === opt.value
      )
    }) || product.variants[0]
  }, [product.variants, selectedOptions])

  const hasOptions = product.options && product.options.length > 0 &&
    !(product.options.length === 1 && product.options[0].name === 'Title')

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }))
  }

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  const variantPrice = selectedVariant
    ? parseFloat(selectedVariant.price.amount)
    : product.price

  return (
    <div className={styles.productInfoSection}>
      <div className={styles.productInfoHeader}>
        <h1 className={styles.productInfoTitle}>{product.title}</h1>
        <p className={styles.productInfoPrice}>
          {variantPrice.toLocaleString('nb-NO')} {product.currencyCode}
        </p>
      </div>

      {product.description && (
        <div className={styles.productInfoDescription}>
          <p>{product.description}</p>
        </div>
      )}

      {/* Variant Options */}
      {hasOptions && (
        <div className={styles.productInfoOptions}>
          {product.options?.filter(opt => opt.name !== 'Title').map((option) => (
            <fieldset key={option.name} className={styles.productInfoOptionGroup}>
              <legend className={styles.productInfoOptionLabel}>{option.name}</legend>
              <div className={styles.productInfoOptionValues} role="radiogroup" aria-label={option.name}>
                {option.values.map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selectedOptions[option.name] === value}
                    className={`${styles.productInfoOptionButton} ${
                      selectedOptions[option.name] === value ? styles.productInfoOptionButtonActive : ''
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

      {/* Quantity Selector */}
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
            aria-label="Øk antall"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart */}
      {selectedVariant && (
        <AddToCartButton
          variantId={selectedVariant.id}
          available={selectedVariant.availableForSale}
          quantity={quantity}
        />
      )}

      {/* Accordion */}
      <div className={styles.productInfoAccordion}>
        {accordionItems.map((item, index) => (
          <div key={index} className={styles.productInfoAccordionItem}>
            <button
              type="button"
              className={styles.productInfoAccordionHeader}
              onClick={() => toggleAccordion(index)}
              aria-expanded={openAccordion === index}
            >
              <span>{item.title}</span>
              <svg
                className={`${styles.productInfoAccordionIcon} ${openAccordion === index ? styles.productInfoAccordionIconOpen : ''}`}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
            <div
              className={`${styles.productInfoAccordionContent} ${openAccordion === index ? styles.productInfoAccordionContentOpen : ''}`}
            >
              <p>{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
