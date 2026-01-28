import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, getSitePassword, getSessionToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const sitePassword = getSitePassword()

    // Hash both values so timingSafeEqual always compares equal-length buffers,
    // preventing password length leakage
    const inputHash = crypto
      .createHash('sha256')
      .update(String(password ?? ''))
      .digest()
    const expectedHash = crypto
      .createHash('sha256')
      .update(sitePassword)
      .digest()

    if (!crypto.timingSafeEqual(inputHash, expectedHash)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const sessionToken = await getSessionToken()

    cookieStore.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
