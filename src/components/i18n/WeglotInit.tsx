'use client'

import { useEffect } from 'react'

// Module-level guard so React Strict Mode's double-mount doesn't try to
// initialize twice (Weglot would throw the second time).
let initialized = false

declare global {
  interface Window {
    Weglot?: {
      initialize: (opts: Record<string, unknown>) => void
      initialized?: boolean
      switchTo: (lang: string) => void
      getCurrentLang: () => string
      on: (event: string, cb: (...args: unknown[]) => void) => void
    }
  }
}

/**
 * Loads the Weglot CDN script and initializes it with this project's API key.
 * The default in-page switcher is hidden (`switchers: []`); we render our own
 * `<LanguageSwitcher>` in the header.
 *
 * Requires `NEXT_PUBLIC_WEGLOT_API_KEY` in env. If missing, the component is a
 * no-op so dev/preview environments without a key still build and render.
 */
export default function WeglotInit() {
  useEffect(() => {
    if (initialized) return
    const apiKey = process.env.NEXT_PUBLIC_WEGLOT_API_KEY
    if (!apiKey) return

    initialized = true

    const existing = document.querySelector('script[data-weglot]')
    if (existing) return

    const script = document.createElement('script')
    script.src = 'https://cdn.weglot.com/weglot.min.js'
    script.async = true
    script.dataset.weglot = 'true'
    script.onload = () => {
      window.Weglot?.initialize({
        api_key: apiKey,
        // TODO: re-enable `hide_switcher: true` after the Weglot dashboard
        // onboarding step is complete. Weglot's setup wizard requires the
        // default switcher to be visible to verify the install.
      })
    }
    document.head.appendChild(script)
  }, [])

  return null
}
