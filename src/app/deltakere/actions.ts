'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { rateLimit } from '@/lib/rate-limit'
import {
  createStaffSession,
  isStaffPassword,
  STAFF_COOKIE,
  STAFF_SESSION_SECONDS,
} from '@/lib/staff-auth'

const COOKIE_PATH = '/deltakere'

export async function login(formData: FormData) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimit(`deltakere:${ip}`, { limit: 5, windowMs: 10 * 60_000 })) {
    redirect('/deltakere?feil=sperret')
  }

  const attempt = formData.get('passord')
  if (typeof attempt !== 'string' || !isStaffPassword(attempt)) {
    redirect('/deltakere?feil=passord')
  }

  ;(await cookies()).set(STAFF_COOKIE, createStaffSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: COOKIE_PATH,
    maxAge: STAFF_SESSION_SECONDS,
  })
  redirect('/deltakere')
}

export async function logout() {
  ;(await cookies()).delete({ name: STAFF_COOKIE, path: COOKIE_PATH })
  redirect('/deltakere')
}
