import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'gransvilla-auth'
const COOKIE_VALUE = 'authenticated'

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/passord',
  '/api/auth',
  '/studio',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth check for public paths and static files
  if (
    PUBLIC_PATHS.some(path => pathname.startsWith(path)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') && !pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for auth cookie
  const authCookie = request.cookies.get(COOKIE_NAME)

  if (authCookie?.value === COOKIE_VALUE) {
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
