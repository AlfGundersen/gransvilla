'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import styles from './AddToCartButton.module.css'

interface AddToCartButtonProps {
  variantId: string
  available: boolean
  quantity?: number
}

export function AddToCartButton({ variantId, available, quantity = 1 }: AddToCartButtonProps) {
  const { addToCart, isLoading: cartLoading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [stockNotice, setStockNotice] = useState<string | null>(null)

  const isLoading = isAdding || cartLoading

  const handleAddToCart = async () => {
    if (!available || isLoading) return

    setIsAdding(true)
    setStockNotice(null)

    try {
      const result = await addToCart(variantId, quantity)
      setAdded(true)

      if (result.actualQuantity < result.requestedQuantity) {
        if (result.actualQuantity === 0) {
          setStockNotice('Ikke flere på lager')
        } else {
          setStockNotice(
            `Kun ${result.actualQuantity} av ${result.requestedQuantity} ble lagt til – begrenset lager`
          )
        }
      }

      setTimeout(() => {
        setAdded(false)
        setStockNotice(null)
      }, 4000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  if (!available) {
    return (
      <button className={styles.button} disabled>
        Utsolgt
      </button>
    )
  }

  return (
    <>
      <button
        className={styles.button}
        onClick={handleAddToCart}
        disabled={isLoading}
        aria-busy={isAdding}
        aria-live="polite"
      >
        {isAdding ? 'Legger til...' : added ? 'Lagt til!' : 'Legg i handlekurv'}
      </button>
      {stockNotice && (
        <p className={styles.stockNotice} role="alert">
          {stockNotice}
        </p>
      )}
    </>
  )
}
