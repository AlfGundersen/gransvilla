'use client'

import { useEffect } from 'react'

/**
 * The `?v=` is what makes a deploy reach returning visitors.
 *
 * A new script URL is what tells the browser to fetch the worker again rather
 * than reuse the installed one, and sw.js reads the same value back out of its
 * own URL to build its cache name — so activate sees a name it doesn't
 * recognise and clears everything from the previous deploy.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const version = process.env.NEXT_PUBLIC_SW_VERSION ?? 'v3'
      navigator.serviceWorker.register(`/sw.js?v=${version}`).catch((error) => {
        console.error('Service worker registration failed:', error)
      })
    }
  }, [])

  return null
}
