import { cache } from 'react'
import { groq } from 'next-sanity'
import { urlFor } from '@/lib/sanity/image'
import { sanityFetch } from '@/lib/sanity/live'
import type { SanityImage, WatermarkPosition } from '@/types/sanity'
import styles from './seo/Watermark.module.css'

/**
 * Resolves the S-logo URL from `siteSettings.favicon`. React-cached per request,
 * so calling this from multiple watermarks during the same render is one fetch.
 * Server-only.
 */
export const getWatermarkSrc = cache(async (): Promise<string | undefined> => {
  const { data } = await sanityFetch({
    query: groq`*[_type == "siteSettings"][0]{ favicon { asset } }`,
  }).catch(() => ({ data: null }))
  if (!data?.favicon?.asset) return undefined
  return urlFor(data.favicon).width(160).height(160).url()
})

interface WatermarkProps {
  position?: WatermarkPosition
}

/**
 * Server-side watermark overlay. Use inside server components.
 */
export async function Watermark({ position = 'bottom-right' }: WatermarkProps) {
  const src = await getWatermarkSrc()
  if (!src) return null
  return (
    <div className={`${styles.watermark} ${styles[position]}`} aria-hidden="true">
      <img src={src} alt="" />
    </div>
  )
}

/**
 * Convenience: takes a SanityImage and renders a watermark only when the editor
 * has turned it on for that image. Server-only.
 */
interface MaybeWatermarkProps {
  image?: Pick<SanityImage, 'watermark' | 'watermarkPosition'>
}

export async function MaybeWatermark({ image }: MaybeWatermarkProps) {
  if (!image?.watermark) return null
  return <Watermark position={image.watermarkPosition ?? 'bottom-right'} />
}
