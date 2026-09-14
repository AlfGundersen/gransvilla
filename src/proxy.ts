import { type NextRequest, NextResponse } from 'next/server'
import { defaultLocale, locales } from '@/lib/i18n/config'
import { siteUrl } from '@/lib/site-url'

/**
 * Two jobs.
 *
 * 1. Redirect the retired English subdomain. `en.gransvilla.no/arrangementer`
 *    becomes `gransvilla.no/en/arrangementer` permanently, so the old URLs keep
 *    working instead of serving the same content on a second hostname. This is
 *    inert until DNS for `en.` is pointed at Netlify — today it still resolves
 *    to Weglot's proxy, which never reaches this code.
 *
 * 2. Put unprefixed paths on the default locale. `/kontakt` is served by
 *    `/nb/kontakt` without the prefix appearing in the address bar. A rewrite
 *    rather than reading headers() in a Server Component, which is what keeps
 *    the site statically prerenderable — headers() would opt every page into
 *    dynamic rendering.
 *
 * Next 16 renamed `middleware` to `proxy`; the export name matters, and the
 * file has to sit beside `app/`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Studio, API routes and metadata files are single-locale. Anything with a
  // file extension is a static asset.
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

  const host = (request.headers.get('host') ?? '').split(':')[0].toLowerCase()

  if (host.startsWith('en.')) {
    const target = new URL(siteUrl())
    const alreadyPrefixed = pathname === '/en' || pathname.startsWith('/en/')
    target.pathname = alreadyPrefixed ? pathname : `/en${pathname === '/' ? '' : pathname}`
    target.search = request.nextUrl.search
    return NextResponse.redirect(target, 301)
  }

  // Already prefixed: a direct hit on /en/... or /nb/...
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`

  return NextResponse.rewrite(url)
}

export const config = {
  // Skip Next's own assets outright so the proxy never runs for them.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
