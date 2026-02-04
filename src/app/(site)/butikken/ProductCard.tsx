'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import styles from './page.module.css'

type ProductCardProps = {
  product: {
    id: string
    title: string
    handle: string
    description: string
    price: number
    currencyCode: string
    images: { url: string; altText: string | null }[]
    variants: { id: string; title: string; availableForSale: boolean }[]
    comingSoon?: boolean
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const isSoldOut = !product.variants.some((v) => v.availableForSale)
  const isComingSoon = product.comingSoon ?? false
  const isUnavailable = isSoldOut || isComingSoon

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const defaultVariant = product.variants[0]
    if (defaultVariant && !isAdding) {
      setIsAdding(true)
      try {
        await addToCart(defaultVariant.id, 1)
      } finally {
        setIsAdding(false)
      }
    }
  }

  return (
    <div className={styles.shopProduct}>
      <div className={styles.shopProductInfo}>
        <h3 className={styles.shopProductTitle}>{product.title}</h3>
        <p className={styles.shopPrice}>
          {product.price.toLocaleString('nb-NO')} {product.currencyCode}
        </p>
      </div>

      <div className={styles.shopImageWrapper}>
        {product.images[0] && (
          <Image
            src={product.images[0].url}
            alt={product.images[0].altText || product.title}
            fill
            className={`${styles.shopImage} ${isUnavailable ? styles.shopImageSoldOut : ''}`}
            sizes="(max-width: 767px) 100vw, 33vw"
          />
        )}

        {/* Status badge */}
        {isComingSoon && <div className={styles.shopComingSoonBadge}>Kommer snart</div>}
        {isSoldOut && !isComingSoon && <div className={styles.shopSoldOutBadge}>Utsolgt</div>}

        {/* Hover overlay with description and buttons (desktop) */}
        <div className={styles.shopProductOverlay}>
          <p className={styles.shopProductDescription}>{product.description}</p>
          <div className={styles.shopProductActions}>
            <button
              type="button"
              className={`${styles.shopAddToCartButton} site-button`}
              onClick={handleAddToCart}
              disabled={isAdding || isUnavailable}
            >
              {isComingSoon ? 'Kommer snart' : isSoldOut ? 'Utsolgt' : isAdding ? 'Legger til...' : 'Legg i handlekurv'}
            </button>
            <Link
              href={`/butikken/${product.handle}`}
              className={`${styles.shopReadMoreButton} site-button`}
            >
              Les mer
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile-only details section */}
      <div className={styles.shopMobileDetails}>
        <div className={styles.shopMobileHeader}>
          <h3 className={styles.shopProductTitle}>{product.title}</h3>
          <p className={styles.shopPrice}>
            {product.price.toLocaleString('nb-NO')} {product.currencyCode}
          </p>
        </div>
        <p className={styles.shopMobileDescription}>{product.description}</p>
        <div className={styles.shopMobileActions}>
          <button
            type="button"
            className={`${styles.shopAddToCartButton} site-button`}
            onClick={handleAddToCart}
            disabled={isAdding || isUnavailable}
          >
            {isComingSoon ? 'Kommer snart' : isSoldOut ? 'Utsolgt' : isAdding ? 'Legger til...' : 'Legg i handlekurv'}
          </button>
          <Link
            href={`/butikken/${product.handle}`}
            className={`${styles.shopReadMoreButton} site-button`}
          >
            Les mer
          </Link>
        </div>
      </div>
    </div>
  )
}
