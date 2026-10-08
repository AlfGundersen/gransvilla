import { type NextRequest, NextResponse } from 'next/server'
import { defaultLocale, locales } from '@/lib/i18n/config'
import { hiddenProductHandlesQuery } from '@/lib/sanity/queries'
import { siteUrl } from '@/lib/site-url'

/** A product page in the shop, with or without a locale prefix. */
const SHOP_PRODUCT = /^(\/(?:nb|en))?\/butikken\/([^/]+)\/?$/
/** Routes under /butikken that are not products. */
const SHOP_ROUTES = new Set(['checkout', 'takk'])

const HIDDEN_TTL_MS = 60_000
let hiddenCache: { at: number; handles: Set<string> } | undefined

/**
 * Handles of products kept out of the shop, straight from Sanity's CDN.
 *
 * Held in memory for a minute so a run of product requests costs one lookup.
 * Any failure answers with what was known last, or nothing: the page itself
 * still redirects, only slower, so this must never be what breaks a request.
 */
async function hiddenProductHandles(): Promise<Set<string>> {
  if (hiddenCache && Date.now() - hiddenCache.at < HIDDEN_TTL_MS) return hiddenCache.handles

  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
    const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
    const response = await fetch(
      `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(hiddenProductHandlesQuery)}`,
      { signal: AbortSignal.timeout(1500) },
    )
    const { result } = (await response.json()) as { result?: string[] | null }
    hiddenCache = { at: Date.now(), handles: new Set(result ?? []) }
  } catch {
    hiddenCache ??= { at: 0, handles: new Set() }
  }

  return hiddenCache.handles
}

/**
 * Three jobs.
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
 * 3. Send a product that is kept out of the shop to its own address.
 *    `/butikken/framdrift-lunsj` becomes `/framdrift-lunsj`. The page does this
 *    too, but it has a loading state, so by the time it knows, the skeleton has
 *    already been sent and all it can do is ask the browser to navigate again —
 *    a visible flash and a second full load. Answering here is a plain redirect.
 *
 * Next 16 renamed `middleware` to `proxy`; the export name matters, and the
 * file has to sit beside `app/`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Studio, the staff pages, API routes and metadata files are single-locale.
  // Anything with a file extension is a static asset.
  if (
    pathname.startsWith('/studio') ||
    pathname === '/deltakere' ||
    pathname.startsWith('/deltakere/') ||
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

  const [, localePrefix = '', handle] = pathname.match(SHOP_PRODUCT) ?? []
  if (handle && !SHOP_ROUTES.has(handle) && (await hiddenProductHandles()).has(handle)) {
    const target = request.nextUrl.clone()
    target.pathname = `${localePrefix === `/${defaultLocale}` ? '' : localePrefix}/${handle}`
    return NextResponse.redirect(target, 307)
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
