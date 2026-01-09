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
    <div className={styles.info}>
      <div className={styles.header}>
        <h1 className={styles.title}>{product.title}</h1>
        <p className={styles.price}>
          {variantPrice.toLocaleString('nb-NO')} {product.currencyCode}
        </p>
      </div>

      {product.description && (
        <div className={styles.description}>
          <p>{product.description}</p>
        </div>
      )}

      {/* Variant Options */}
      {hasOptions && (
        <div className={styles.options}>
          {product.options?.filter(opt => opt.name !== 'Title').map((option) => (
            <div key={option.name} className={styles.optionGroup}>
              <label className={styles.optionLabel}>{option.name}</label>
              <div className={styles.optionValues}>
                {option.values.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.optionButton} ${
                      selectedOptions[option.name] === value ? styles.optionButtonActive : ''
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

      {/* Quantity Selector */}
      <div className={styles.quantitySection}>
        <label className={styles.quantityLabel}>Antall</label>
        <div className={styles.quantity}>
          <button
            type="button"
            className={styles.quantityButton}
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            aria-label="Reduser antall"
          >
            -
          </button>
          <span className={styles.quantityValue}>{quantity}</span>
          <button
            type="button"
            className={styles.quantityButton}
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
      <div className={styles.accordion}>
        {accordionItems.map((item, index) => (
          <div key={index} className={styles.accordionItem}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => toggleAccordion(index)}
              aria-expanded={openAccordion === index}
            >
              <span>{item.title}</span>
              <svg
                className={`${styles.accordionIcon} ${openAccordion === index ? styles.accordionIconOpen : ''}`}
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
              className={`${styles.accordionContent} ${openAccordion === index ? styles.accordionContentOpen : ''}`}
            >
              <p>{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
