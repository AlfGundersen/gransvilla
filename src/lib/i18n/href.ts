import { defaultLocale, isLocale, type Locale, locales } from './config'

const SITE_HOSTS = /^https?:\/\/(?:www\.|en\.)?gransvilla\.no(?=\/|$)/i

/**
 * Prefixes an internal link with the active locale.
 *
 * English lives at `/en/...` on the same host, so a link written as `/kontakt`
 * has to become `/en/kontakt` to keep an English visitor in English. Without
 * this, clicking the logo on an English page drops back to Norwegian.
 *
 * Leaves external links, anchors, mailto/tel and already-prefixed paths alone.
 * Absolute links back to the site itself — editors write these in Sanity — are
 * normalised to a path first, so they follow the locale like any other.
 */
export function localeHref(href: string, locale: string): string {
  if (!href) return href

  const resolved: Locale = isLocale(locale) ? locale : defaultLocale
  let path = href

  if (SITE_HOSTS.test(href)) {
    path = href.replace(SITE_HOSTS, '') || '/'
  } else if (!href.startsWith('/')) {
    // #anchor, mailto:, tel:, or an external origin
    return href
  }

  if (resolved === defaultLocale) return path
  if (locales.some((l) => path === `/${l}` || path.startsWith(`/${l}/`))) return path

  return path === '/' ? `/${resolved}` : `/${resolved}${path}`
}
