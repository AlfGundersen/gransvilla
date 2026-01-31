'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import styles from './FeaturedProductSection.module.css'

interface FeaturedProductAddToCartProps {
  variantId: string
  available: boolean
}

export function FeaturedProductAddToCart({ variantId, available }: FeaturedProductAddToCartProps) {
  const { addToCart, isLoading: cartLoading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const isLoading = isAdding || cartLoading

  const handleAddToCart = async () => {
    if (!available || isLoading) return

    setIsAdding(true)
    try {
      await addToCart(variantId, 1)
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
      <button type="button" className={styles.featProductBtnPrimary} disabled>
        Utsolgt
      </button>
    )
  }

  return (
    <button
      type="button"
      className={styles.featProductBtnPrimary}
      onClick={handleAddToCart}
      disabled={isLoading}
      aria-busy={isAdding}
      aria-live="polite"
    >
      {isAdding ? 'Legger til...' : added ? 'Lagt til!' : 'Legg i handlekurv'}
    </button>
  )
}
