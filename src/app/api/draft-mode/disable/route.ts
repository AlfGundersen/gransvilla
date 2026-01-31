import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  (await draftMode()).disable()
  const referer = request.headers.get('referer')
  return NextResponse.redirect(referer || '/', { status: 307 })
}
