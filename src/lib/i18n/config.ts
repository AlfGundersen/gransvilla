import { siteUrl } from '@/lib/site-url'

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

/**
 * Absolute base for a locale, used for canonicals, hreflang and sitemaps.
 *
 * Both languages live on one host; English is the `/en` path prefix. The
 * subdomain was dropped because it was six days old, had been broken the whole
 * time, and keeping it would have made every deploy wait on a DNS change.
 */
export function originFor(locale: Locale): string {
  const origin = siteUrl()
  return locale === defaultLocale ? origin : `${origin}/${locale}`
}

/**
 * Strips the `/nb` or `/en` prefix from a pathname, so links built from
 * usePathname() do not accumulate it.
 */
export function publicPath(pathname: string): string {
  const stripped = pathname.replace(/^\/(?:nb|en)(?=\/|$)/, '')
  return stripped || '/'
}
