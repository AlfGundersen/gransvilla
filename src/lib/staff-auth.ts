import 'server-only'
import crypto from 'crypto'

/**
 * The shared password that opens the staff pages.
 *
 * Those pages show customers' names and allergies, so with no password set
 * they stay shut rather than open.
 */
export const STAFF_COOKIE = 'gv_staff'
export const STAFF_SESSION_SECONDS = 60 * 60 * 24 * 7

function password(): string | undefined {
  return process.env.DELTAKERE_PASSWORD || undefined
}

export function isStaffAuthConfigured(): boolean {
  return Boolean(password())
}

function sign(expires: string, key: string): string {
  return crypto.createHmac('sha256', key).update(expires).digest('hex')
}

/** Compares in constant time; hashing first makes the lengths equal. */
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) => crypto.createHash('sha256').update(value).digest()
  return crypto.timingSafeEqual(digest(a), digest(b))
}

export function isStaffPassword(attempt: string): boolean {
  const key = password()
  return Boolean(key) && safeEqual(attempt, key!)
}

/**
 * A session is its expiry signed with the password, so changing the password
 * signs everyone out and nothing has to be stored.
 */
export function createStaffSession(): string {
  const expires = String(Date.now() + STAFF_SESSION_SECONDS * 1000)
  return `${expires}.${sign(expires, password()!)}`
}

export function isStaffSession(value: string | undefined): boolean {
  const key = password()
  if (!key || !value) return false

  const [expires, signature] = value.split('.')
  if (!expires || !signature || !safeEqual(signature, sign(expires, key))) return false

  return Number(expires) > Date.now()
}
