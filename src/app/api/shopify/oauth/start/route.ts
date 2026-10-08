import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { isAdminConfigured } from '@/lib/shopify/admin'
import {
  OAUTH_STATE_COOKIE,
  oauthCredentials,
  oauthRedirectUri,
  SHOP_DOMAIN,
} from '@/lib/shopify/oauth'

/**
 * Sends a shop admin to Shopify to approve the app. Shopify answers at
 * /api/shopify/oauth/callback.
 *
 * Shut once a token is in place: the handshake is only for getting the first
 * one, and there is no reason to leave a way to mint more lying around.
 */
export async function GET() {
  const credentials = oauthCredentials()
  if (!credentials || isAdminConfigured()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const state = crypto.randomBytes(16).toString('hex')
  const authorize = new URL(`https://${SHOP_DOMAIN}/admin/oauth/authorize`)
  authorize.searchParams.set('client_id', credentials.clientId)
  authorize.searchParams.set('redirect_uri', oauthRedirectUri())
  authorize.searchParams.set('state', state)

  const response = NextResponse.redirect(authorize)
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/shopify/oauth',
    maxAge: 600,
  })
  return response
}
