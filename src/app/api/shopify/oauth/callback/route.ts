import { type NextRequest, NextResponse } from 'next/server'
import { isAdminConfigured } from '@/lib/shopify/admin'
import {
  isShopifySignature,
  OAUTH_STATE_COOKIE,
  oauthCredentials,
  SHOP_DOMAIN,
} from '@/lib/shopify/oauth'

function page(title: string, body: string, status = 200): NextResponse {
  const html = `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>
body { font: 16px/1.5 system-ui, sans-serif; max-width: 40rem; margin: 4rem auto; padding: 0 1.5rem; }
code { display: block; padding: 1rem; background: #f2f2f2; word-break: break-all; }
</style>
</head>
<body>
<h1>${title}</h1>
${body}
</body>
</html>`

  const response = new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
  response.cookies.delete({ name: OAUTH_STATE_COOKIE, path: '/api/shopify/oauth' })
  return response
}

/**
 * Shopify's answer to /api/shopify/oauth/start: swaps the code for the Admin
 * API token and shows it once, to be saved as SHOPIFY_ADMIN_ACCESS_TOKEN.
 *
 * A function cannot write its own environment, so the token has to pass
 * through a person. Three things must hold before it is shown: Shopify signed
 * the request, it is for our shop, and it finishes a handshake this browser
 * started.
 */
export async function GET(request: NextRequest) {
  const credentials = oauthCredentials()
  if (!credentials || isAdminConfigured()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const params = request.nextUrl.searchParams
  const code = params.get('code')
  const state = params.get('state')
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value

  if (
    !code ||
    !state ||
    state !== expectedState ||
    params.get('shop') !== SHOP_DOMAIN ||
    !isShopifySignature(params, credentials.clientSecret)
  ) {
    return page(
      'Kunne ikke bekrefte forespørselen',
      '<p>Start på nytt fra <a href="/api/shopify/oauth/start">/api/shopify/oauth/start</a>.</p>',
      400,
    )
  }

  try {
    const response = await fetch(`https://${SHOP_DOMAIN}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        code,
      }),
      cache: 'no-store',
    })
    const json: { access_token?: string; scope?: string } = await response.json()
    if (!response.ok || !json.access_token) {
      throw new Error(`Shopify answered ${response.status}`)
    }

    return page(
      'Tilgang gitt',
      `<p>Lagre denne som <strong>SHOPIFY_ADMIN_ACCESS_TOKEN</strong> i Netlify og i <strong>.env.local</strong>. Den vises bare nå.</p>
<code>${json.access_token}</code>
<p>Tilganger: ${json.scope ?? 'ukjent'}</p>`,
    )
  } catch (error) {
    console.error('Shopify OAuth token exchange failed:', error)
    return page(
      'Shopify ga ingen nøkkel',
      '<p>Start på nytt fra <a href="/api/shopify/oauth/start">/api/shopify/oauth/start</a>.</p>',
      502,
    )
  }
}
