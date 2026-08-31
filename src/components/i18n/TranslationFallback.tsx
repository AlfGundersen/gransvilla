'use client'

import { useEffect } from 'react'

const KEY = process.env.NEXT_PUBLIC_WEGLOT_API_KEY

/**
 * Client-side re-translation for translated subdomains (en.*).
 *
 * Weglot's proxy serves the page fully translated, but React hydration
 * recovery repaints the DOM from the untranslated RSC payload, erasing
 * the translation. Weglot's own script refuses to translate client-side
 * on proxy subdomains, so we call their translate API directly (verified
 * working from this origin) and swap the text back to English.
 */
export default function TranslationFallback() {
  useEffect(() => {
    if (!KEY) return
    if (!window.location.hostname.startsWith('en.')) return
    if (window.location.pathname.startsWith('/studio')) return

    const applied = new WeakMap<Text, string>()
    let timer: ReturnType<typeof setTimeout> | undefined
    let destroyed = false

    const collect = (): Text[] => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          const p = n.parentElement
          if (!p || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE'].includes(p.tagName)) {
            return NodeFilter.FILTER_REJECT
          }
          if (p.closest('.language-switcher-button')) return NodeFilter.FILTER_REJECT
          const text = n.textContent ?? ''
          if (text.trim().length < 2) return NodeFilter.FILTER_REJECT
          // Skip nodes whose current text is what we already applied
          if (applied.get(n as Text) === text) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        },
      })
      const nodes: Text[] = []
      while (walker.nextNode()) nodes.push(walker.currentNode as Text)
      return nodes
    }

    const translate = async () => {
      const nodes = collect()
      if (nodes.length === 0) return
      const words = nodes.map((n) => ({ t: 1, w: n.textContent ?? '' }))
      const version = window.Weglot?.options?.versions?.translation ?? Date.now()
      try {
        const res = await fetch(
          `https://cdn-api-weglot.com/translate?api_key=${KEY}&v=${version}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify({
              l_from: 'nb',
              l_to: 'en',
              request_url: `https://gransvilla.no${window.location.pathname}`,
              words,
            }),
          },
        )
        if (!res.ok || destroyed) return
        const data: { to_words?: (string | null)[] } = await res.json()
        nodes.forEach((n, i) => {
          const w = data.to_words?.[i]
          if (w) {
            n.textContent = w
            applied.set(n, w)
          }
        })
      } catch {
        // Network failure: leave the text as-is; next mutation retries.
      }
    }

    // Debounce so React's repaint storm results in one batched request.
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(translate, 300)
    }

    const observer = new MutationObserver(schedule)

    // Mutating text nodes while React is still hydrating/recovering crashes
    // the render (error boundary). Wait until the page has fully loaded and
    // the browser is idle before touching the DOM.
    const start = () => {
      if (destroyed) return
      schedule()
      // Our own textContent writes retrigger the observer, but the
      // applied-map guard makes the follow-up collect() a no-op.
      observer.observe(document.body, { childList: true, characterData: true, subtree: true })
    }
    const onReady = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => setTimeout(start, 200), { timeout: 2000 })
      } else {
        setTimeout(start, 700)
      }
    }
    if (document.readyState === 'complete') {
      onReady()
    } else {
      window.addEventListener('load', onReady, { once: true })
    }

    return () => {
      destroyed = true
      clearTimeout(timer)
      observer.disconnect()
      window.removeEventListener('load', onReady)
    }
  }, [])

  return null
}
