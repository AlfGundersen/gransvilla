'use client'

import { usePathname } from 'next/navigation'
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
 * Navigates directly to the same path on the other domain instead of
 * Weglot.switchTo — Weglot captures the URL at initial page load, so after
 * client-side navigation switchTo sends visitors to the wrong page.
 */
export default function LanguageSwitcher() {
  const [isEnglish, setIsEnglish] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsEnglish(window.location.hostname.startsWith('en.'))
  }, [])

  const label = isEnglish ? 'NO' : 'EN'
  const ariaLabel = isEnglish ? 'Norsk versjon' : 'English version'

  return (
    <button
      type="button"
      className={`${styles.button} language-switcher-button`}
      aria-label={ariaLabel}
      onClick={() => {
        const targetHost = isEnglish ? 'gransvilla.no' : 'en.gransvilla.no'
        const path = pathname || window.location.pathname
        window.location.href = `https://${targetHost}${path}${window.location.search}${window.location.hash}`
      }}
    >
      {label}
    </button>
  )
}
