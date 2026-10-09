'use client'

import Image from 'next/image'
import { useState } from 'react'
import { focalPosition, shopifyImageUrl } from '@/lib/shopify/image'
import { productHeroImage } from '@/lib/warm-image'
import styles from './ProductGallery.module.css'

interface ProductImage {
  url: string
  altText: string | null
  width?: number
  height?: number
  focalPoint?: { x: number; y: number }
}

interface ProductGalleryProps {
  images: ProductImage[]
  title: string
  /** Pairs the hero with the matching card image in the shop grid. */
  handle: string
}

export function ProductGallery({ images, title, handle }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className={styles.productGallery}>
        <div className={styles.productGalleryMainImage}>
          <div className={styles.productGalleryPlaceholder}>Ingen bilde</div>
        </div>
      </div>
    )
  }

  const selectedImage = images[selectedIndex]

  return (
    <div className={styles.productGallery}>
      <div className={styles.productGalleryMainImage}>
        <Image
          {...productHeroImage(selectedImage.url)}
          alt={selectedImage.altText || title}
          className={styles.productGalleryImage}
          style={{ objectPosition: focalPosition(selectedImage) }}
          priority
        />
      </div>

      {images.length > 1 && (
        <div className={styles.productGalleryThumbnails}>
          {images.map((image, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.productGalleryThumbnail} ${idx === selectedIndex ? styles.productGalleryThumbnailActive : ''}`}
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Vis bilde ${idx + 1}`}
              aria-current={idx === selectedIndex ? 'true' : undefined}
            >
              <Image
                src={shopifyImageUrl(image.url, { width: 160, crop: 'center' })}
                alt={image.altText || `${title} ${idx + 1}`}
                fill
                className={styles.productGalleryImage}
                style={{ objectPosition: focalPosition(image) }}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
