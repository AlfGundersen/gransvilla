'use client'

import { useState } from 'react'
import Image from 'next/image'
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
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          <div className={styles.placeholder}>Ingen bilde</div>
        </div>
      </div>
    )
  }

  const selectedImage = images[selectedIndex]

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <Image
          src={selectedImage.url}
          alt={selectedImage.altText || title}
          fill
          className={styles.image}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.thumbnail} ${idx === selectedIndex ? styles.thumbnailActive : ''}`}
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Vis bilde ${idx + 1}`}
            >
              <Image
                src={image.url}
                alt={image.altText || `${title} ${idx + 1}`}
                fill
                className={styles.image}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
