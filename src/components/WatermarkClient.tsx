'use client'

import type { SanityImage, WatermarkPosition } from '@/types/sanity'
import styles from './seo/Watermark.module.css'

interface WatermarkClientProps {
  src?: string
  position?: WatermarkPosition
  image?: Pick<SanityImage, 'watermark' | 'watermarkPosition'>
}

/**
 * Client-side watermark overlay. Use inside `'use client'` components.
 * Pass `src` from a server parent that fetched it via `getWatermarkSrc()`.
 * If `image` is provided, the watermark only renders when `image.watermark === true`.
 */
export function WatermarkClient({ src, position, image }: WatermarkClientProps) {
  if (!src) return null
  if (image && !image.watermark) return null
  const resolvedPosition = position ?? image?.watermarkPosition ?? 'bottom-right'
  return (
    <div className={`${styles.watermark} ${styles[resolvedPosition]}`} aria-hidden="true">
      <img src={src} alt="" />
    </div>
  )
}
