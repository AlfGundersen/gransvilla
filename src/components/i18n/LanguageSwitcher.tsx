'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { defaultLocale, originFor, publicPath } from '@/lib/i18n/config'
import { useLocale } from '@/lib/i18n/provider'
import styles from './LanguageSwitcher.module.css'

/**
 * Subtle single-button language toggle for the header. Shows the language you
 * can switch TO (so on Norwegian it reads "EN"; on English, "NO").
 *
 * The label comes from the route, so it is correct in the server-rendered HTML
 * and never flips on hydration.
 *
 * The link is path-based by default (`/en/...`), which is valid on any host:
 * proxy.ts serves those paths everywhere, so the switcher works on deploy
 * previews and localhost. Only on the production domain, where the hostname is
 * what carries the language, does it switch to the subdomain instead — decided
 * after mount, since the server cannot read the host without opting every page
 * into dynamic rendering.
 */
export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = publicPath(usePathname() || '/')

  const isEnglish = locale === 'en'
  const target = isEnglish ? defaultLocale : 'en'
  const pathHref = target === 'en' ? `/en${pathname === '/' ? '' : pathname}` : pathname

  const [href, setHref] = useState(pathHref)

  useEffect(() => {
    const siteHost = new URL(originFor(defaultLocale)).hostname
    const { hostname, protocol } = window.location
    // localhost never has a working en. subdomain, so keep paths in dev.
    const isLocal = /^(localhost|127\.|\[?::1)/.test(hostname)

    if (!isLocal && (hostname === siteHost || hostname === `en.${siteHost}`)) {
      const targetHost = target === 'en' ? `en.${siteHost}` : siteHost
      setHref(`${protocol}//${targetHost}${pathname}`)
    } else {
      setHref(pathHref)
    }
  }, [target, pathname, pathHref])

  return (
    <a
      href={href}
      className={`${styles.button} language-switcher-button`}
      aria-label={isEnglish ? 'Norsk versjon' : 'English version'}
      hrefLang={target}
    >
      {isEnglish ? 'NO' : 'EN'}
    </a>
  )
}
