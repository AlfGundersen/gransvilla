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
 * Absolute origin for a locale, used for canonicals, hreflang and sitemaps.
 *
 * Derived from NEXT_PUBLIC_SITE_URL so preview deployments and local runs do
 * not emit production URLs. The English origin is the same host with an `en.`
 * label, which is what the DNS and the Netlify domain alias are set up for.
 */
export function originFor(locale: Locale): string {
  const origin = siteUrl()
  if (locale !== 'en') return origin

  const url = new URL(origin)
  url.hostname = url.hostname.startsWith('en.') ? url.hostname : `en.${url.hostname}`
  return url.toString().replace(/\/+$/, '')
}

/**
 * Strips the internal `/nb` or `/en` prefix that proxy.ts rewrites onto the
 * path, so links built from usePathname() point at the public URL rather than
 * leaking the segment onto the other host.
 */
export function publicPath(pathname: string): string {
  const stripped = pathname.replace(/^\/(?:nb|en)(?=\/|$)/, '')
  return stripped || '/'
}
