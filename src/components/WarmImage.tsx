'use client'

import { useEffect } from 'react'
import type { WarmTarget } from '@/lib/warm-image'

/** Files already asked for, so a card that remounts does not ask again. */
const warmed = new Set<string>()
/** A long listing should not pull down every hero behind it. */
const MAX_PER_PAGE = 6
let page = ''
let countOnPage = 0

/**
 * Fetches the image a listing is about to morph into, once the page is idle.
 *
 * Renders nothing. Handing the browser the hero's own srcset and sizes lets it
 * pick the same file the hero will, so by the time someone follows the link it
 * is already in the cache and the morph has something to land on.
 */
export function WarmImage({ src, srcSet, sizes }: WarmTarget) {
  useEffect(() => {
    const key = srcSet || src
    if (warmed.has(key)) return

    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection
    if (connection?.saveData || connection?.effectiveType?.includes('2g')) return

    if (page !== window.location.pathname) {
      page = window.location.pathname
      countOnPage = 0
    }
    if (countOnPage >= MAX_PER_PAGE) return
    countOnPage++

    const warm = () => {
      warmed.add(key)
      const image = new window.Image()
      image.decoding = 'async'
      image.fetchPriority = 'low'
      if (sizes) image.sizes = sizes
      if (srcSet) image.srcset = srcSet
      image.src = src
    }

    // Safari has no requestIdleCallback
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(warm, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(warm, 300)
    return () => window.clearTimeout(id)
  }, [src, srcSet, sizes])

  return null
}
