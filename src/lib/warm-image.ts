import { getImageProps, type ImageProps } from 'next/image'
import { shopifyImageUrl } from '@/lib/shopify/image'

/**
 * The big images a listing morphs into, described once so the page that shows
 * one and the listing that warms it up ask for exactly the same file.
 *
 * A card and the hero it becomes are different sizes, so they are different
 * files. Arriving at the hero with nothing in the cache meant the morph landed
 * on an empty box — black, briefly — before the image caught up.
 */

/** What <WarmImage> needs to fetch the file the hero will ask for. */
export interface WarmTarget {
  src: string
  srcSet?: string
  sizes?: string
}

/** The product gallery's main image. */
export function productHeroImage(url: string) {
  return {
    src: shopifyImageUrl(url, { width: 1200, crop: 'center' }),
    fill: true,
    sizes: '(max-width: 768px) 100vw, 50vw',
  } as const
}

/** The featured image at the top of a page or an event; `src` comes from Sanity. */
export function pageHeroImage(src: string) {
  return { src, width: 1200, height: 675 } as const
}

/**
 * Runs the hero's props through next/image, which is what decides the URLs,
 * so the warm-up and the real thing cannot drift apart.
 */
export function warmTarget(image: Omit<ImageProps, 'alt'>): WarmTarget {
  const { props } = getImageProps({ ...image, alt: '' })
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes }
}
