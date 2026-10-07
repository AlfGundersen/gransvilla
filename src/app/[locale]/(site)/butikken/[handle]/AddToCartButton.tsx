'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useT } from '@/lib/i18n/provider'
import styles from './AddToCartButton.module.css'

interface AddToCartButtonProps {
  variantId: string
  available: boolean
  quantity?: number
  allergies?: string
  onAdded?: () => void
}

export function AddToCartButton({
  variantId,
  available,
  quantity = 1,
  allergies,
  onAdded,
}: AddToCartButtonProps) {
  const t = useT()
  const { addToCart, isLoading: cartLoading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const isLoading = isAdding || cartLoading

  const handleAddToCart = async () => {
    if (!available || isLoading) return

    setIsAdding(true)

    try {
      await addToCart(variantId, quantity, allergies)
      setAdded(true)
      onAdded?.()
      setTimeout(() => setAdded(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  if (!available) {
    return (
      <button className={`${styles.button} site-button`} disabled>
        Utsolgt
      </button>
    )
  }

  return (
    <button
      className={`${styles.button} site-button`}
      onClick={handleAddToCart}
      disabled={isLoading}
      aria-busy={isAdding}
      aria-live="polite"
    >
      {isAdding ? t('Legger til...') : added ? t('Lagt til!') : t('Legg i handlekurv')}
    </button>
  )
}
