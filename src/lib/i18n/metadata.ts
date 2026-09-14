import type { Metadata } from 'next'
import { defaultLocale, isLocale, type Locale, locales, originFor } from './config'

/**
 * Canonical + hreflang for one page.
 *
 * Both locales serve the same paths — only the host differs — so the alternates
 * are the same path on each origin. Previously these lived only on the root
 * layout and always pointed at the two front pages, which told crawlers every
 * English page's Norwegian counterpart was the home page.
 */
export function alternatesFor(path: string, locale: string): Metadata['alternates'] {
  const resolved: Locale = isLocale(locale) ? locale : defaultLocale
  const clean = path === '/' ? '' : path.replace(/\/+$/, '')

  return {
    canonical: `${originFor(resolved)}${clean || '/'}`,
    languages: Object.fromEntries(locales.map((l) => [l, `${originFor(l)}${clean || '/'}`])),
  }
}

/** OpenGraph locale tag for the active language. */
export function openGraphLocale(locale: string): string {
  return isLocale(locale) && locale === 'en' ? 'en_US' : 'nb_NO'
}
