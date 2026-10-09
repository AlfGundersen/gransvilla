/**
 * Transform Shopify CDN image URL with size and crop parameters.
 *
 * The CDN knows nothing of the focal point set in the admin: asked to crop, it
 * crops around the middle. The focal point is applied where the image is
 * shown, with `focalPosition` below.
 */
export function shopifyImageUrl(
  url: string,
  options?: {
    width?: number
    height?: number
    crop?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  },
): string {
  if (!url || !url.includes('cdn.shopify.com')) {
    return url
  }

  const { width, height, crop = 'center' } = options ?? {}

  // Parse the URL
  const urlObj = new URL(url)

  // Build size string (e.g., "800x600_crop_center")
  const parts: string[] = []

  if (width) parts.push(`width=${width}`)
  if (height) parts.push(`height=${height}`)
  if (width || height) parts.push(`crop=${crop}`)

  // Add parameters to URL
  parts.forEach((part) => {
    const [key, value] = part.split('=')
    urlObj.searchParams.set(key, value)
  })

  return urlObj.toString()
}

/**
 * Where to hold an image when its box crops it, as a CSS `object-position`:
 * the focal point set on it in the Shopify admin, or nothing — and so the
 * middle — where none has been.
 */
export function focalPosition(image?: {
  focalPoint?: { x: number; y: number }
}): string | undefined {
  if (!image?.focalPoint) return undefined
  const percent = (value: number) => `${Math.round(Math.min(1, Math.max(0, value)) * 1000) / 10}%`
  return `${percent(image.focalPoint.x)} ${percent(image.focalPoint.y)}`
}

/**
 * Get optimized Shopify image URL for Next.js Image component.
 */
export function getShopifyImageProps(
  image: { url: string; altText?: string | null; width?: number; height?: number },
  options?: { width?: number; height?: number },
) {
  const { width = 800, height } = options ?? {}

  return {
    src: shopifyImageUrl(image.url, { width, height, crop: 'center' }),
    alt: image.altText || '',
    width: image.width || width,
    height: image.height || width * 0.75, // Default 4:3 aspect ratio
  }
}
