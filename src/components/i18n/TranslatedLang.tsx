'use client'

import { useEffect } from 'react'

/**
 * Keeps lang="en" on <html> for the translated subdomain.
 *
 * Weglot's proxy sets lang="en", then React's hydration recovery renders the
 * layout's hardcoded lang="nb" and wipes it. Weglot's own observer is scoped
 * to the body, so it re-translates the text but never restores this, leaving
 * English content announced to screen readers as Norwegian.
 */
export default function TranslatedLang() {
  useEffect(() => {
    if (!window.location.hostname.startsWith('en.')) return
    if (window.location.pathname.startsWith('/studio')) return

    let destroyed = false
    const ensureLang = () => {
      if (!destroyed && document.documentElement.lang !== 'en') {
        document.documentElement.lang = 'en'
      }
    }

    const observer = new MutationObserver(ensureLang)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    })
    // Assert on mount too: a failed hydration remounts this component, and by
    // the time the observer reattaches React has already written lang="nb",
    // so no further mutation would ever fire.
    ensureLang()

    return () => {
      destroyed = true
      observer.disconnect()
    }
  }, [])

  return null
}
