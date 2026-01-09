import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const SITE_PASSWORD = process.env.SITE_PASSWORD || 'gransvilla2024'
const COOKIE_NAME = 'gransvilla-auth'
const COOKIE_VALUE = 'authenticated'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === SITE_PASSWORD) {
      const cookieStore = await cookies()

      cookieStore.set(COOKIE_NAME, COOKIE_VALUE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
