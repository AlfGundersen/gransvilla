'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import styles from './page.module.css'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, isLoading: cartLoading } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      router.push('/nettbutikk')
    }
  }, [cart, cartLoading, router])

  const handleCheckout = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const cartId = localStorage.getItem('gransvilla-cart-id')
      if (!cartId) {
        throw new Error('Ingen handlekurv funnet')
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Noe gikk galt')
      }

      window.location.href = data.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt')
      setIsSubmitting(false)
    }
  }

  if (cartLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Laster...</div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return null
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Bekreft bestilling</h1>
          <p className={styles.subtitle}>
            Se over bestillingen din før du går til betaling
          </p>
        </div>

        <div className={styles.items}>
          {cart.items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemImage}>
                {item.image && (
                  <Image
                    src={item.image.url}
                    alt={item.image.altText || item.title}
                    fill
                    sizes="100px"
                  />
                )}
              </div>
              <div className={styles.itemDetails}>
                <p className={styles.itemTitle}>{item.title}</p>
                {item.variantTitle !== 'Default Title' && (
                  <p className={styles.itemVariant}>{item.variantTitle}</p>
                )}
                <p className={styles.itemMeta}>
                  {item.quantity} stk × {item.price.toLocaleString('nb-NO')} {item.currencyCode}
                </p>
              </div>
              <p className={styles.itemTotal}>
                {(item.price * item.quantity).toLocaleString('nb-NO')} {item.currencyCode}
              </p>
            </div>
          ))}
        </div>

        <div className={styles.totals}>
          <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
            <span>Totalt</span>
            <span>{cart.totalAmount.toLocaleString('nb-NO')} {cart.currencyCode}</span>
          </div>
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <button
          type="button"
          className={styles.checkoutButton}
          onClick={handleCheckout}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Behandler...' : 'Gå til betaling'}
        </button>

        <p className={styles.secureNote}>
          Du blir sendt til en sikker betalingsside
        </p>
      </div>
    </div>
  )
}
