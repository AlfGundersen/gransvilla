'use client'

import { usePathname } from 'next/navigation'
import { defaultLocale, originFor, publicPath } from '@/lib/i18n/config'
import { useLocale } from '@/lib/i18n/provider'
import styles from './LanguageSwitcher.module.css'

/**
 * Subtle single-button language toggle for the header. Shows the language you
 * can switch TO (so on Norwegian it reads "EN"; on English, "NO").
 *
 * The locale comes from the route rather than from sniffing the hostname after
 * mount, so the button renders with the right label on the server and never
 * flips on hydration. A plain link, since it is a cross-origin navigation.
 */
export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  const isEnglish = locale === 'en'
  const target = isEnglish ? defaultLocale : 'en'

  return (
    <a
      href={`${originFor(target)}${publicPath(pathname || '/')}`}
      className={`${styles.button} language-switcher-button`}
      aria-label={isEnglish ? 'Norsk versjon' : 'English version'}
      hrefLang={target}
    >
      {isEnglish ? 'NO' : 'EN'}
    </a>
  )
}
