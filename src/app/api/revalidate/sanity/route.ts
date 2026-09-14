import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

/**
 * Invalidates cached pages when content is published in Sanity.
 *
 * Shopify already had this; Sanity did not. Without it, published content
 * reached visitors only because SanityLive patches the page in the browser —
 * the HTML Netlify served stayed on whatever the last build produced, so a page
 * edited after a deploy looked stale to anything that does not run JavaScript,
 * and to the first paint.
 *
 * Configure in Sanity: Manage → API → Webhooks, pointing at
 * https://gransvilla.no/api/revalidate/sanity, on create/update/delete, with
 * the secret below. `parseBody` waits for Content Lake propagation so the
 * revalidated render sees the new document rather than racing it.
 */

type WebhookPayload = {
  _type?: string
  slug?: { current?: string }
}

/** Documents that appear on every page, via the header and footer. */
const GLOBAL_TYPES = new Set(['siteSettings', 'frontpage'])

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    console.error('SANITY_REVALIDATE_SECRET is not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let isValidSignature: boolean | null
  let body: WebhookPayload | null

  try {
    ;({ isValidSignature, body } = await parseBody<WebhookPayload>(request, secret, true))
  } catch (error) {
    console.error('Could not parse Sanity webhook', error)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  if (!isValidSignature) {
    console.error('Invalid Sanity webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (!body?._type) {
    return NextResponse.json({ error: 'No document type in payload' }, { status: 400 })
  }

  const revalidated: string[] = []

  // Tag-based first, so a query that opts into tags is invalidated precisely.
  // Next 16 requires the profile argument; expire:0 drops the entry outright,
  // matching what the Shopify webhook already does.
  revalidateTag(body._type, { expire: 0 })
  revalidated.push(`tag:${body._type}`)

  // defineLive's fetches are not tagged, so the route caches have to be cleared
  // by path as well. A document that feeds the chrome affects every page.
  const slug = body.slug?.current
  if (GLOBAL_TYPES.has(body._type) || !slug) {
    revalidatePath('/', 'layout')
    revalidated.push('path:/ (layout)')
  } else {
    for (const prefix of ['', '/en']) {
      revalidatePath(`${prefix}/${slug}`)
      revalidated.push(`path:${prefix}/${slug}`)
    }
    // Listings that show this document.
    revalidatePath('/', 'layout')
    revalidated.push('path:/ (layout)')
  }

  console.log(`Sanity webhook: ${body._type} → ${revalidated.join(', ')}`)
  return NextResponse.json({ revalidated, type: body._type, slug: slug ?? null })
}
