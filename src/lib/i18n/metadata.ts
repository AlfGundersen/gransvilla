import type { Metadata } from 'next'
import { defaultLocale, isLocale, type Locale, locales, originFor } from './config'

/**
 * Canonical + hreflang for one page.
 *
 * Both locales serve the same paths under a different prefix, so the alternates
 * are the same path on each locale base. Previously these lived only on the
 * root layout and always pointed at the two front pages, which told crawlers
 * every English page's Norwegian counterpart was the home page.
 */
export function alternatesFor(path: string, locale: string): Metadata['alternates'] {
  const resolved: Locale = isLocale(locale) ? locale : defaultLocale
  const clean = path === '/' ? '' : path.replace(/\/+$/, '')

  // originFor already carries the locale prefix, so the root must not append a
  // trailing slash — /en/ redirects to /en, and a canonical must not point at a
  // redirect.
  const join = (l: Locale) => (clean ? `${originFor(l)}${clean}` : originFor(l))

  return {
    canonical: join(resolved),
    languages: Object.fromEntries(locales.map((l) => [l, join(l)])),
  }
}

/** OpenGraph locale tag for the active language. */
export function openGraphLocale(locale: string): string {
  return isLocale(locale) && locale === 'en' ? 'en_US' : 'nb_NO'
}
