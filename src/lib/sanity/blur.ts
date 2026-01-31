import type { SanityImageSource } from '@sanity/image-url'
import { urlFor } from './image'

/**
 * Fetches a tiny version of a Sanity image and returns a base64 data URI
 * suitable for use as `blurDataURL` on Next.js Image components.
 */
export async function getBlurDataURL(
  image: SanityImageSource,
): Promise<string | undefined> {
  try {
    const url = urlFor(image).width(200).quality(70).url()
    const res = await fetch(url)
    if (!res.ok) return undefined
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const contentType = res.headers.get('content-type') || 'image/webp'
    return `data:${contentType};base64,${base64}`
  } catch {
    return undefined
  }
}
