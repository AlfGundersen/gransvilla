import { NextRequest, NextResponse } from 'next/server'
import { getCart } from '@/lib/shopify'

function isValidShopifyCheckoutUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname.endsWith('.myshopify.com') ||
        parsed.hostname.endsWith('.shopify.com'))
    )
  } catch {
    return false
  }
}

// POST - Get checkout URL
export async function POST(request: NextRequest) {
  try {
    const { cartId } = await request.json()

    if (!cartId || typeof cartId !== 'string') {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 },
      )
    }

    // Verify cart exists
    const cart = await getCart(cartId)
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    // Validate checkout URL points to Shopify
    if (!cart.checkoutUrl || !isValidShopifyCheckoutUrl(cart.checkoutUrl)) {
      console.error('Invalid checkout URL received:', cart.checkoutUrl)
      return NextResponse.json(
        { error: 'Invalid checkout URL' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      checkoutUrl: cart.checkoutUrl,
      cart,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 },
    )
  }
}
