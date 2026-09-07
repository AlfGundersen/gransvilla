'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Pages stream in via Suspense, so the browser's native anchor scroll
 * fires before the target exists — on first load and on client-side
 * navigation. Watch the DOM briefly and scroll once the element appears.
 */
export function AnchorScroll() {
  const pathname = usePathname()

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return

    const target = () => document.getElementById(decodeURIComponent(hash))

    const el = target()
    if (el) {
      el.scrollIntoView()
      return
    }

    const observer = new MutationObserver(() => {
      const found = target()
      if (found) {
        observer.disconnect()
        clearTimeout(timeout)
        found.scrollIntoView()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const timeout = setTimeout(() => observer.disconnect(), 10000)

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }
  }, [pathname])

  return null
}
