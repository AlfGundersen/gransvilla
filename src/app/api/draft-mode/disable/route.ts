import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  (await draftMode()).disable()
  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.searchParams.delete('_vercel_share')
  return NextResponse.redirect(url)
}
