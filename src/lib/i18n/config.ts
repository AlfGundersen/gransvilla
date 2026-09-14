export const locales = ['nb', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'nb'

/**
 * Which locale a hostname serves.
 *
 * English lives on the `en.` subdomain rather than a path prefix so the URLs
 * Weglot's proxy already exposed keep working after the cutover. The locale is
 * a route segment internally (`/en/...`), rewritten from the host in proxy.ts,
 * so both languages can still be prerendered.
 */
export function localeFromHost(host: string | null | undefined): Locale {
  const hostname = (host ?? '').split(':')[0].toLowerCase()
  return hostname.startsWith('en.') ? 'en' : defaultLocale
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Absolute origin for a locale, used for canonicals, hreflang and sitemaps. */
export function originFor(locale: Locale): string {
  return locale === 'en' ? 'https://en.gransvilla.no' : 'https://gransvilla.no'
}
