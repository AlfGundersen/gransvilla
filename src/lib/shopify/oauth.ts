import 'server-only'
import crypto from 'crypto'
import { siteUrl } from '@/lib/site-url'

/**
 * The one-time handshake that gives this site an Admin API token.
 *
 * The app lives in the agency's Shopify organisation and the shop in the
 * client's, and across that line Shopify only hands out a token through the
 * authorization code grant: send a shop admin to Shopify, get a code back,
 * swap it for the token. A custom app's token does not expire, so this runs
 * once and the token is then kept in SHOPIFY_ADMIN_ACCESS_TOKEN.
 */
export const SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!
export const OAUTH_STATE_COOKIE = 'gv_shopify_oauth'

export function oauthCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET
  return clientId && clientSecret ? { clientId, clientSecret } : null
}

/** Must match the redirect URL registered on the app, character for character. */
export function oauthRedirectUri(): string {
  return `${siteUrl()}/api/shopify/oauth/callback`
}

/**
 * Shopify signs the callback's query with the client secret: every parameter
 * but `hmac`, sorted and joined as a query string.
 */
export function isShopifySignature(params: URLSearchParams, clientSecret: string): boolean {
  const hmac = params.get('hmac')
  if (!hmac) return false

  const message = [...params.entries()]
    .filter(([key]) => key !== 'hmac')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const expected = crypto.createHmac('sha256', clientSecret).update(message).digest('hex')
  const given = Buffer.from(hmac)
  const wanted = Buffer.from(expected)
  return given.length === wanted.length && crypto.timingSafeEqual(given, wanted)
}
