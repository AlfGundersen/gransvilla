'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, ViewTransition } from 'react'
import { useCart } from '@/context/CartContext'
import { localeHref } from '@/lib/i18n/href'
import { useLocale, useT } from '@/lib/i18n/provider'
import { shopifyImageUrl } from '@/lib/shopify/image'
import styles from './page.module.css'
import { VariantModal } from './VariantModal'

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
  const locale = useLocale()
  const numberLocale = locale === 'en' ? 'en-GB' : 'nb-NO'
  const t = useT()
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Collapse newlines only. How much fits is a layout question, so the card
  // clamps in CSS rather than cutting at a character count — a fixed 200 left
  // visible empty space below the text.
  const description = product.description.replace(/\n+/g, ' ').trim()

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
            {product.price.toLocaleString(numberLocale)} {product.currencyCode}
          </p>
        )}
      </div>

      <div className={styles.shopImageWrapper}>
        {product.images[0] && (
          /*
           * Paired with the same name in ProductGallery, so the card image
           * morphs into the product page hero instead of cross-fading.
           * `default="none"` keeps it to that one case — without it, the
           * hover overlay and badge would animate on every re-render.
           *
           * enter/exit matter more here than anywhere: a named element drops
           * out of its parent's snapshot, so leaving the shop for anything
           * but a product left every card in the grid popping out at once.
           */
          <ViewTransition
            name={`product-image-${product.handle}`}
            default="none"
            share="product-image"
            enter="page-content"
            exit="page-content"
          >
            <Image
              src={shopifyImageUrl(product.images[0].url, { width: 800, crop: 'center' })}
              alt={product.images[0].altText || product.title}
              fill
              className={styles.shopImage}
              sizes="(max-width: 767px) 100vw, 33vw"
            />
          </ViewTransition>
        )}

        {/* Status badge */}
        {isComingSoon && <div className={styles.shopComingSoonBadge}>{t('Kommer snart')}</div>}
        {isSoldOut && !isComingSoon && (
          <div className={styles.shopSoldOutBadge}>{t('Utsolgt')}</div>
        )}

        {/* Hover overlay with description and buttons (desktop) */}
        <div className={styles.shopProductOverlay}>
          <p className={styles.shopProductDescription}>{description}</p>
          <div className={styles.shopProductActions}>
            <button
              type="button"
              className={`${styles.shopAddToCartButton} site-button`}
              onClick={handleAddToCart}
              disabled={isAdding || isUnavailable}
            >
              {isComingSoon
                ? t('Kommer snart')
                : isSoldOut
                  ? t('Utsolgt')
                  : isAdding
                    ? t('Legger til...')
                    : t('Legg i handlekurv')}
            </button>
            <Link
              href={localeHref(`/butikken/${product.handle}`, locale)}
              className={`${styles.shopReadMoreButton} site-button`}
            >
              {t('Les mer')}
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
              {product.price.toLocaleString(numberLocale)} {product.currencyCode}
            </p>
          )}
        </div>
        <p className={styles.shopMobileDescription}>{description}</p>
        <div className={styles.shopMobileActions}>
          <button
            type="button"
            className={`${styles.shopAddToCartButton} site-button`}
            onClick={handleAddToCart}
            disabled={isAdding || isUnavailable}
          >
            {isComingSoon
              ? t('Kommer snart')
              : isSoldOut
                ? t('Utsolgt')
                : isAdding
                  ? t('Legger til...')
                  : t('Legg i handlekurv')}
          </button>
          <Link
            href={localeHref(`/butikken/${product.handle}`, locale)}
            className={`${styles.shopReadMoreButton} site-button`}
          >
            {t('Les mer')}
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
