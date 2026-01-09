import { NextRequest, NextResponse } from 'next/server'
import { getCart } from '@/lib/shopify'

// POST - Get checkout URL with customer info in note
export async function POST(request: NextRequest) {
  try {
    const { cartId, customerInfo } = await request.json()

    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      )
    }

    // Verify cart exists
    const cart = await getCart(cartId)
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    // Build checkout URL with customer info as query params
    // This pre-fills the Shopify checkout form
    const checkoutUrl = new URL(cart.checkoutUrl)
    checkoutUrl.searchParams.set('checkout[email]', customerInfo.email)
    checkoutUrl.searchParams.set('checkout[shipping_address][first_name]', customerInfo.firstName)
    checkoutUrl.searchParams.set('checkout[shipping_address][last_name]', customerInfo.lastName)
    checkoutUrl.searchParams.set('checkout[shipping_address][phone]', customerInfo.phone)

    return NextResponse.json({
      checkoutUrl: checkoutUrl.toString(),
      cart,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
