import type { SanityImageSource } from '@sanity/image-url'
import { urlFor } from './image'

/**
 * Fetches a tiny version of a Sanity image and returns a base64 data URI
 * suitable for use as `blurDataURL` on Next.js Image components.
 *
 * The size here is the placeholder's, not the picture's. It is stretched to fill
 * the frame and blurred, so detail in it is thrown away; what it costs is paid
 * twice on every page — once in the markup, once again in the RSC payload — and
 * base64 adds a third on top. Asking for 200px of a PNG was costing 145kB a
 * placeholder, because Sanity keeps PNG lossless and ignores the quality hint;
 * `fm=webp` is what makes the quality hint bite.
 */
export async function getBlurDataURL(image: SanityImageSource): Promise<string | undefined> {
  try {
    const url = urlFor(image).width(24).quality(40).format('webp').url()
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
