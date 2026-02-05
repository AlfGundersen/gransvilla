/**
 * Transform Shopify CDN image URL with size and crop parameters.
 * When a focal point is set in Shopify admin, the crop will respect it.
 */
export function shopifyImageUrl(
  url: string,
  options?: {
    width?: number
    height?: number
    crop?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  }
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
 * Get optimized Shopify image URL for Next.js Image component.
 * Uses Shopify's CDN transformation with focal point support.
 */
export function getShopifyImageProps(
  image: { url: string; altText?: string | null; width?: number; height?: number },
  options?: { width?: number; height?: number }
) {
  const { width = 800, height } = options ?? {}

  return {
    src: shopifyImageUrl(image.url, { width, height, crop: 'center' }),
    alt: image.altText || '',
    width: image.width || width,
    height: image.height || (width * 0.75), // Default 4:3 aspect ratio
  }
}
