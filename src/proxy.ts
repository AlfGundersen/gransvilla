import { type NextRequest, NextResponse } from 'next/server'
import { localeFromHost, locales } from '@/lib/i18n/config'

/**
 * Maps the request host onto the internal `[locale]` segment.
 *
 * `en.gransvilla.no/arrangementer` is served by `/en/arrangementer` and
 * `gransvilla.no/arrangementer` by `/nb/arrangementer`, without either prefix
 * ever appearing in the address bar. Doing this as a rewrite rather than
 * reading headers() in a Server Component is what keeps the site statically
 * prerenderable — headers() would opt every page into dynamic rendering.
 *
 * Next 16 renamed `middleware` to `proxy`; the export name matters.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Studio, API routes and metadata files are single-locale and must not be
  // rewritten. Anything with a file extension is a static asset.
  if (
    pathname.startsWith('/studio') ||
    pathname.startsWith('/api') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.webmanifest' ||
    /\.[^/]+$/.test(pathname)
  ) {
    return
  }

  // Already prefixed (internal redirects, direct hits during development).
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return
  }

  const locale = localeFromHost(request.headers.get('host'))
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`

  return NextResponse.rewrite(url)
}

export const config = {
  // Skip Next's own assets outright so the proxy never runs for them.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
