'use client'

import { useEffect, useState } from 'react'
import styles from './LanguageSwitcher.module.css'

const LANGS = ['no', 'en'] as const
type Lang = (typeof LANGS)[number]

/**
 * Subtle two-state language toggle for the header. Requires WeglotInit to have
 * loaded `window.Weglot`. While Weglot is still loading (or absent — e.g. when
 * `NEXT_PUBLIC_WEGLOT_API_KEY` is unset), the switcher renders nothing.
 */
export default function LanguageSwitcher() {
  const [lang, setLang] = useState<Lang>('no')

  // When Weglot finishes initializing, sync the current language and listen
  // for changes. If Weglot never loads (no API key, CDN blocked, bad key),
  // the button stays visible and defaults to NO; clicks are a no-op.
  useEffect(() => {
    let cancelled = false

    function attach() {
      const w = window.Weglot
      if (!w || !w.initialized) return false
      setLang((w.getCurrentLang() as Lang) ?? 'no')
      w.on('languageChanged', (next) => {
        if (typeof next === 'string') setLang(next as Lang)
      })
      return true
    }

    const interval = window.setInterval(() => {
      if (cancelled) return
      if (attach()) window.clearInterval(interval)
    }, 150)
    const timeout = window.setTimeout(() => window.clearInterval(interval), 10_000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [])

  const other: Lang = lang === 'no' ? 'en' : 'no'
  const label = other.toUpperCase()
  const aria = other === 'en' ? 'Switch to English' : 'Bytt til norsk'

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => window.Weglot?.switchTo(other)}
      translate="no"
      data-weglot-skip
      aria-label={aria}
      title={aria}
    >
      {label}
    </button>
  )
}
