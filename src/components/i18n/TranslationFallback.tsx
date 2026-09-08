'use client'

import { useEffect } from 'react'

const KEY = process.env.NEXT_PUBLIC_WEGLOT_API_KEY

/**
 * Client-side re-translation for the translated subdomain (en.*).
 *
 * Weglot's proxy serves the page already translated, but Next.js embeds an
 * RSC payload alongside the HTML that the proxy only partially rewrites. React
 * hydration recovery then repaints the DOM from that payload, leaving a mix of
 * Norwegian and English on screen. This re-translates whatever React put back.
 *
 * Uses Weglot's documented Weglot.translate() method rather than calling their
 * CDN endpoint directly, so we stay on a supported API.
 */
export default function TranslationFallback() {
  useEffect(() => {
    if (!KEY) return
    if (!window.location.hostname.startsWith('en.')) return
    if (window.location.pathname.startsWith('/studio')) return

    const applied = new WeakMap<Text, string>()
    let timer: ReturnType<typeof setTimeout> | undefined
    let destroyed = false

    // Weglot's proxy sets lang="en" on <html>, then React's hydration recovery
    // renders lang="nb" from the layout and wipes it. Weglot's own observer is
    // scoped to the body, so it re-translates the text but never restores this,
    // leaving English content announced to screen readers as Norwegian.
    // Watch the attribute directly and put it back; the guard stops our own
    // write from retriggering the observer.
    const langObserver = new MutationObserver(() => {
      if (!destroyed && document.documentElement.lang !== 'en') {
        document.documentElement.lang = 'en'
      }
    })
    langObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    })

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

    // Weglot.translate's callback shape is documented only by example, so
    // accept both a bare array of strings and the {to_words: [...]} envelope.
    const readWords = (data: unknown): (string | null)[] => {
      if (Array.isArray(data)) return data as (string | null)[]
      if (data && typeof data === 'object' && 'to_words' in data) {
        const w = (data as { to_words?: unknown }).to_words
        if (Array.isArray(w)) return w as (string | null)[]
      }
      return []
    }

    const translate = () => {
      const wg = window.Weglot
      // Weglot.translate needs the project config, so wait for initialization.
      if (!wg?.translate || !wg.initialized || destroyed) return
      const nodes = collect()
      if (nodes.length === 0) return

      // On failure Weglot calls back with (null, error) AND returns a rejecting
      // promise — catch it so a network blip isn't an unhandled rejection.
      wg.translate(
        { words: nodes.map((n) => ({ t: 1, w: n.textContent ?? '' })), languageTo: 'en' },
        (data) => {
          if (destroyed) return
          const words = readWords(data)
          nodes.forEach((n, i) => {
            const w = words[i]
            if (w) {
              n.textContent = w
              applied.set(n, w)
            }
          })
        },
      )?.catch(() => {
        // Leave the text as-is; the next mutation reschedules a retry.
      })
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
      langObserver.disconnect()
      window.removeEventListener('load', onReady)
    }
  }, [])

  return null
}
