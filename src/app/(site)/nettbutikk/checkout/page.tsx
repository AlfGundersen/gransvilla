'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import styles from './page.module.css'

interface FormData {
  email: string
  phone: string
  firstName: string
  lastName: string
}

const initialFormData: FormData = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, isLoading: cartLoading } = useCart()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      router.push('/nettbutikk')
    }
  }, [cart, cartLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        body: JSON.stringify({
          cartId,
          customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Noe gikk galt')
      }

      // Redirect to Shopify checkout
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
      <div className={styles.header}>
        <Link href="/nettbutikk" className={styles.backLink}>
          ← Tilbake til butikken
        </Link>
        <h1 className={styles.title}>Kasse</h1>
      </div>

      <div className={styles.container}>
        <div className={styles.formSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Dine opplysninger</h2>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="firstName" className={styles.label}>
                    Fornavn <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="lastName" className={styles.label}>
                    Etternavn <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                  E-post <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                  placeholder="din@epost.no"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="phone" className={styles.label}>
                  Telefon <span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                  placeholder="+47 000 00 000"
                />
              </div>
            </section>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Behandler...' : 'Fortsett til betaling'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Ordresammendrag</h2>

          <div className={styles.items}>
            {cart.items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.image && (
                    <Image
                      src={item.image.url}
                      alt={item.image.altText || item.title}
                      fill
                      sizes="120px"
                    />
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemTitle}>
                    {item.quantity} x {item.title}
                  </p>
                  {item.variantTitle !== 'Default Title' && (
                    <p className={styles.itemVariant}>{item.variantTitle}</p>
                  )}
                  <p className={styles.itemPrice}>
                    {item.quantity} x {item.price.toLocaleString('nb-NO')} {item.currencyCode} = {(item.price * item.quantity).toLocaleString('nb-NO')} {item.currencyCode}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.totals}>
            <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
              <span>Total</span>
              <span>{cart.totalAmount.toLocaleString('nb-NO')} {cart.currencyCode}</span>
            </div>
            <p className={styles.shippingNote}>
              Frakt og avgifter beregnes ved betaling
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
