'use client'

import Image from 'next/image'
import { useState } from 'react'
import styles from './ProductGallery.module.css'

interface ProductImage {
  url: string
  altText: string | null
  width?: number
  height?: number
}

interface ProductGalleryProps {
  images: ProductImage[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
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
          src={selectedImage.url}
          alt={selectedImage.altText || title}
          fill
          className={styles.productGalleryImage}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
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
                src={image.url}
                alt={image.altText || `${title} ${idx + 1}`}
                fill
                className={styles.productGalleryImage}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
