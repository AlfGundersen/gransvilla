import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME, getSessionToken } from '@/lib/auth'

// Paths that don't require authentication
const PUBLIC_PATHS = ['/passord', '/api/', '/studio']

// Only allow known static file extensions through without auth
const STATIC_EXT =
  /\.(ico|png|jpg|jpeg|gif|svg|webp|avif|css|js|woff|woff2|ttf|eot|map|txt|xml|json|webmanifest)$/

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth check for public paths and static files
  if (
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith('/_next') ||
    STATIC_EXT.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Verify auth cookie against derived session token
  const authCookie = request.cookies.get(COOKIE_NAME)

  try {
    const expectedToken = await getSessionToken()
    if (authCookie?.value === expectedToken) {
      return NextResponse.next()
    }
  } catch {
    // SITE_PASSWORD not configured — no password gate needed (e.g. production)
    return NextResponse.next()
  }

  // Redirect to password page
  const url = request.nextUrl.clone()
  url.pathname = '/passord'
  return NextResponse.redirect(url)
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
