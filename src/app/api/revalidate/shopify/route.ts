import crypto from 'crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { removeCollection, syncCollection } from '@/lib/sanity/sync'

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET

// Verify Shopify webhook signature
function verifyShopifyWebhook(body: string, signature: string | null): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET || !signature) {
    return false
  }

  const hmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64')

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-shopify-hmac-sha256')

  // Verify webhook authenticity
  if (!verifyShopifyWebhook(body, signature)) {
    console.error('Invalid Shopify webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const topic = request.headers.get('x-shopify-topic')

  try {
    // Revalidate based on the webhook topic
    switch (topic) {
      case 'products/create':
      case 'products/update':
      case 'products/delete':
        await revalidateTag('shopify-products', { expire: 0 })
        await revalidatePath('/', 'layout')
        await revalidatePath('/butikken', 'layout')
        break

      case 'inventory_levels/update':
        await revalidateTag('shopify-products', { expire: 0 })
        await revalidatePath('/', 'layout')
        await revalidatePath('/butikken', 'layout')
        break

      case 'collections/create':
      case 'collections/update': {
        const payload = JSON.parse(body)
        await syncCollection({
          id: payload.id,
          title: payload.title,
          handle: payload.handle,
        })
        await revalidateTag('shopify-products', { expire: 0 })
        await revalidatePath('/butikken', 'layout')
        break
      }

      case 'collections/delete': {
        const payload = JSON.parse(body)
        await removeCollection(payload.id)
        await revalidateTag('shopify-products', { expire: 0 })
        await revalidatePath('/butikken', 'layout')
        break
      }

      default:
        // Revalidate everything for unknown topics
        await revalidatePath('/', 'layout')
    }

    console.log(`Shopify webhook received: ${topic}`)
    return NextResponse.json({ revalidated: true, topic })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
