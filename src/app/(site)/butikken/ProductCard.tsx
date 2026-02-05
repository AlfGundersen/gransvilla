'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { shopifyImageUrl } from '@/lib/shopify/image'
import { VariantModal } from './VariantModal'
import styles from './page.module.css'

type Variant = {
  id: string
  title: string
  availableForSale: boolean
  price: { amount: string; currencyCode: string }
}

type ProductCardProps = {
  product: {
    id: string
    title: string
    handle: string
    description: string
    price: number
    currencyCode: string
    images: { url: string; altText: string | null }[]
    variants: Variant[]
    comingSoon?: boolean
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sanitize and truncate description
  const sanitizedDescription = product.description.replace(/\n+/g, ' ').trim()
  const truncatedDescription =
    sanitizedDescription.length > 200
      ? sanitizedDescription.slice(0, 200).trim() + '...'
      : sanitizedDescription

  const isSoldOut = !product.variants.some((v) => v.availableForSale)
  const isComingSoon = product.comingSoon ?? false
  const isUnavailable = isSoldOut || isComingSoon

  // Check if product has real variants (not just "Default Title")
  const hasMultipleVariants =
    product.variants.length > 1 ||
    (product.variants.length === 1 && product.variants[0].title !== 'Default Title')

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // If product has variants, open modal instead
    if (hasMultipleVariants) {
      setIsModalOpen(true)
      return
    }

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
        {!isComingSoon && (
          <p className={styles.shopPrice}>
            {product.price.toLocaleString('nb-NO')} {product.currencyCode}
          </p>
        )}
      </div>

      <div className={styles.shopImageWrapper}>
        {product.images[0] && (
          <Image
            src={shopifyImageUrl(product.images[0].url, { width: 800, crop: 'center' })}
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
          <p className={styles.shopProductDescription}>{truncatedDescription}</p>
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
          {!isComingSoon && (
            <p className={styles.shopPrice}>
              {product.price.toLocaleString('nb-NO')} {product.currencyCode}
            </p>
          )}
        </div>
        <p className={styles.shopMobileDescription}>{truncatedDescription}</p>
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

      {/* Variant selection modal */}
      {hasMultipleVariants && (
        <VariantModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productTitle={product.title}
          variants={product.variants}
          currencyCode={product.currencyCode}
        />
      )}
    </div>
  )
}
