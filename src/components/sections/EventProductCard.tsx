'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/lib/shopify/types'
import styles from './EventProductsSection.module.css'

interface EventProductCardProps {
  product: Product
}

export function EventProductCard({ product }: EventProductCardProps) {
  const { addToCart, isLoading: cartLoading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const isLoading = isAdding || cartLoading
  const defaultVariant = product.variants[0]
  const available = defaultVariant?.availableForSale ?? false
  const productImage = product.images[0]

  const handleAddToCart = async () => {
    if (!available || isLoading || !defaultVariant) return

    setIsAdding(true)
    try {
      await addToCart(defaultVariant.id, 1)
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
        {product.price.toLocaleString('nb-NO')} {product.currencyCode}
      </p>
      {product.description && (
        <p className={styles.eventProductDescription}>{product.description}</p>
      )}
      <button
        type="button"
        className={styles.eventProductButton}
        onClick={handleAddToCart}
        disabled={!available || isLoading}
      >
        {!available
          ? 'Utsolgt'
          : isAdding
            ? 'Legger til...'
            : added
              ? 'Lagt til!'
              : 'Legg i handlekurv'}
      </button>
    </div>
  )
}
