export const COOKIE_NAME = 'gransvilla-auth'

export function getSitePassword(): string {
  const password = process.env.SITE_PASSWORD
  if (!password) {
    throw new Error('SITE_PASSWORD environment variable is required')
  }
  return password
}

export async function getSessionToken(): Promise<string> {
  const password = getSitePassword()
  const encoder = new TextEncoder()
  const data = encoder.encode(`gransvilla-session:${password}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
