'use client'

import { useEffect, useState } from 'react'
import styles from './LanguageSwitcher.module.css'

declare global {
  interface Window {
    Weglot?: {
      switchTo: (lang: string) => void
      getCurrentLang: () => string
      on: (event: string, callback: (...args: unknown[]) => void) => void
      off: (event: string, callback: (...args: unknown[]) => void) => boolean
      options?: { versions?: { translation?: number } }
    }
  }
}

/**
 * Subtle single-button language toggle for the header. Shows the language
 * you can switch TO (so when on Norwegian it reads "EN"; on English, "NO").
 *
 * Weglot loads synchronously in the root layout <head>, so it is initialized
 * before hydration. Clicks are a no-op if `Weglot.switchTo` isn't available.
 */
export default function LanguageSwitcher() {
  const [isEnglish, setIsEnglish] = useState(false)

  useEffect(() => {
    const sync = () => {
      const w = window.Weglot
      if (w?.getCurrentLang) setIsEnglish(w.getCurrentLang() === 'en')
    }

    sync()
    window.Weglot?.on?.('languageChanged', sync)

    return () => {
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
