'use client'

import { useEffect, useState } from 'react'
import styles from './LanguageSwitcher.module.css'

/**
 * Subtle single-button language toggle for the header. Shows the language
 * you can switch TO (so when on Norwegian it reads "EN"; on English, "NO").
 *
 * Wired to Weglot via the `weglot:ready` event dispatched in WeglotInit.
 * Until Weglot loads, the button still renders (defaults to Norwegian);
 * clicks are a no-op if `Weglot.switchTo` isn't available yet.
 */
export default function LanguageSwitcher() {
  const [isEnglish, setIsEnglish] = useState(false)

  useEffect(() => {
    const sync = () => {
      const w = window.Weglot
      if (w?.getCurrentLang) setIsEnglish(w.getCurrentLang() === 'en')
    }

    const onReady = () => {
      sync()
      window.Weglot?.on?.('languageChanged', sync)
    }

    // If Weglot already initialized before this component mounted
    if (window.Weglot?.getCurrentLang) {
      onReady()
    } else {
      window.addEventListener('weglot:ready', onReady)
    }

    return () => {
      window.removeEventListener('weglot:ready', onReady)
      window.Weglot?.off?.('languageChanged', sync)
    }
  }, [])

  // Weglot project's source language is "nb" (Bokmål), not "no" — using
  // the wrong code makes `switchTo` a silent no-op.
  const target = isEnglish ? 'nb' : 'en'
  const label = isEnglish ? 'NO' : 'EN'
  const ariaLabel = isEnglish ? 'Norsk versjon' : 'English version'

  return (
    <button
      type="button"
      className={`${styles.button} language-switcher-button`}
      aria-label={ariaLabel}
      onClick={() => {
        const w = typeof window !== 'undefined' ? window.Weglot : undefined
        if (!w || typeof w.switchTo !== 'function') return
        try {
          w.switchTo(target)
          setIsEnglish(!isEnglish)
        } catch {
          /* don't flip label if switch failed */
        }
      }}
    >
      {label}
    </button>
  )
}
