import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { COOKIE_NAME, getSessionToken } from '@/lib/auth'

// Paths that don't require authentication
const PUBLIC_PATHS = ['/passord', '/api/', '/studio', '/personvern']

// Only allow known static file extensions through without auth
const STATIC_EXT =
  /\.(ico|png|jpg|jpeg|gif|svg|webp|avif|css|js|woff|woff2|ttf|eot|map|txt|xml|json|webmanifest)$/

function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com`,
    "style-src 'self' 'unsafe-inline' https://use.typekit.net https://p.typekit.net",
    "font-src 'self' https://use.typekit.net https://p.typekit.net",
    "img-src 'self' data: blob: https://cdn.sanity.io https://cdn.shopify.com",
    "connect-src 'self' https://*.sanity.io https://www.googletagmanager.com https://www.google-analytics.com",
    "media-src 'self' https://cdn.sanity.io",
    "object-src 'none'",
    "frame-ancestors 'self' https://*.sanity.build",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self'",
  ].join('; ')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip for static files and _next
  if (pathname.startsWith('/_next') || STATIC_EXT.test(pathname)) {
    return NextResponse.next()
  }

  // Generate nonce for CSP
  const nonce = generateNonce()
  const csp = buildCsp(nonce)

  // Handle auth for protected paths
  if (!PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    const authCookie = request.cookies.get(COOKIE_NAME)

    try {
      const expectedToken = await getSessionToken()
      if (authCookie?.value !== expectedToken) {
        const url = request.nextUrl.clone()
        const intendedPath = pathname + request.nextUrl.search
        url.pathname = '/passord'
        if (intendedPath !== '/') {
          url.searchParams.set('from', intendedPath)
        }
        return NextResponse.redirect(url)
      }
    } catch {
      // SITE_PASSWORD not configured — no password gate needed (e.g. production)
    }
  }

  // Pass nonce to server components via request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Set CSP on response
  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
