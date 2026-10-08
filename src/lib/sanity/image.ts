// Re-export urlFor from client for cleaner imports
export { urlFor } from './client'

import { urlFor as buildUrl } from './client'

/**
 * The file behind the featured image at the top of a page or an event. In one
 * place so a listing can warm up exactly what the page will ask for.
 */
export function pageHeroSrc(image: Parameters<typeof buildUrl>[0]): string {
  return buildUrl(image).width(1600).quality(92).url()
}
