'use client'

import { usePathname } from 'next/navigation'
import { defaultLocale, publicPath } from '@/lib/i18n/config'
import { localeHref } from '@/lib/i18n/href'
import { useLocale } from '@/lib/i18n/provider'
import styles from './LanguageSwitcher.module.css'

/**
 * Subtle single-button language toggle for the header. Shows the language you
 * can switch TO (so on Norwegian it reads "EN"; on English, "NO").
 *
 * Both the label and the link come from the route, so the server-rendered HTML
 * is already correct and nothing flips on hydration.
 */
export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = publicPath(usePathname() || '/')

  const isEnglish = locale === 'en'
  const target = isEnglish ? defaultLocale : 'en'

  return (
    <a
      href={localeHref(pathname, target)}
      className={`${styles.button} language-switcher-button`}
      aria-label={isEnglish ? 'Norsk versjon' : 'English version'}
      hrefLang={target}
    >
      {isEnglish ? 'NO' : 'EN'}
    </a>
  )
}
