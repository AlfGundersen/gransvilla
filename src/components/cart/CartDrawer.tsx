'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef } from 'react'
import { useCart } from '@/context/CartContext'
import styles from './CartDrawer.module.css'

export function CartDrawer() {
  const { cart, isOpen, isLoading, stockNotice, closeCart, updateQuantity, removeFromCart } =
    useCart()

  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Lock body scroll when open + manage focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      // Move focus into drawer
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    } else {
      document.body.style.overflow = ''
      // Restore focus to trigger element
      previousFocusRef.current?.focus()
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

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !drawerRef.current) return

    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

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
        ref={drawerRef}
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-labelledby="cart-drawer-title"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        <div className={styles.header}>
          <h2 id="cart-drawer-title" className={styles.title}>
            Handlekurv
          </h2>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            onClick={closeCart}
            aria-label="Lukk handlekurv"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className={styles.empty}>
            <p>Handlekurven er tom</p>
            <Link href="/butikken" className={styles.continueLink} onClick={closeCart}>
              Fortsett å handle
            </Link>
          </div>
        ) : (
          <>
            {stockNotice && (
              <div className={styles.stockNotice} role="alert">
                {stockNotice}
              </div>
            )}
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
                      href={`/butikken/${item.handle}`}
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
                <span>Total sum</span>
                <span>
                  {cart.totalAmount.toLocaleString('nb-NO')} {cart.currencyCode}
                </span>
              </div>
              <Link
                href="/butikken/checkout"
                className={`${styles.checkoutButton} site-button`}
                onClick={closeCart}
              >
                Gå til kassen
              </Link>
              <button className={`${styles.continueButton} site-button`} onClick={closeCart}>
                Fortsett å handle
              </button>
            </div>
          </>
        )}

        {isLoading && (
          <div className={styles.loadingOverlay} role="status" aria-label="Laster">
            <div className={styles.spinner} />
          </div>
        )}
      </div>
    </>
  )
}
