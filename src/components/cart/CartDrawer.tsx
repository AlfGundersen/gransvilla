'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { useCart } from '@/context/CartContext'
import styles from './CartDrawer.module.css'

export function CartDrawer() {
  const {
    cart,
    isOpen,
    isLoading,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useCart()

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeCart])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-label="Handlekurv"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Handlekurv</h2>
          <button
            className={styles.closeButton}
            onClick={closeCart}
            aria-label="Lukk handlekurv"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className={styles.empty}>
            <p>Handlekurven er tom</p>
            <Link href="/nettbutikk" className={styles.continueLink} onClick={closeCart}>
              Fortsett å handle
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {cart.items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImage}>
                    {item.image && (
                      <Image
                        src={item.image.url}
                        alt={item.image.altText || item.title}
                        fill
                        sizes="80px"
                      />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <Link
                      href={`/nettbutikk/${item.handle}`}
                      className={styles.itemTitle}
                      onClick={closeCart}
                    >
                      {item.title}
                    </Link>
                    {item.variantTitle !== 'Default Title' && (
                      <p className={styles.itemVariant}>{item.variantTitle}</p>
                    )}
                    <p className={styles.itemPrice}>
                      {item.price.toLocaleString('nb-NO')} {item.currencyCode}
                    </p>
                    <div className={styles.itemActions}>
                      <div className={styles.quantity}>
                        <button
                          className={styles.quantityButton}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isLoading || item.quantity <= 1}
                          aria-label="Reduser antall"
                        >
                          -
                        </button>
                        <span className={styles.quantityValue}>{item.quantity}</span>
                        <button
                          className={styles.quantityButton}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading}
                          aria-label="Øk antall"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className={styles.removeButton}
                        onClick={() => removeFromCart(item.id)}
                        disabled={isLoading}
                        aria-label="Fjern fra handlekurv"
                      >
                        Fjern
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.subtotal}>
                <span>Subtotal</span>
                <span>
                  {cart.totalAmount.toLocaleString('nb-NO')} {cart.currencyCode}
                </span>
              </div>
              <p className={styles.shippingNote}>
                Frakt beregnes ved utsjekking
              </p>
              <Link
                href="/nettbutikk/checkout"
                className={styles.checkoutButton}
                onClick={closeCart}
              >
                Gå til kassen
              </Link>
              <button
                className={styles.continueButton}
                onClick={closeCart}
              >
                Fortsett å handle
              </button>
            </div>
          </>
        )}

        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
          </div>
        )}
      </div>
    </>
  )
}
