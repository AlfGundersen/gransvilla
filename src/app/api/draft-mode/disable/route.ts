import { draftMode } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  ;(await draftMode()).disable()

  const referer = request.headers.get('referer')
  let redirectUrl = '/'

  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const requestUrl = new URL(request.url)
      if (refererUrl.origin === requestUrl.origin) {
        redirectUrl = refererUrl.pathname + refererUrl.search
      }
    } catch {
      // Invalid referer URL, fall back to /
    }
  }

  return NextResponse.redirect(new URL(redirectUrl, request.url), { status: 307 })
}
