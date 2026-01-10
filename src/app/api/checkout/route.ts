import { NextRequest, NextResponse } from 'next/server'
import { getCart } from '@/lib/shopify'

// POST - Get checkout URL
export async function POST(request: NextRequest) {
  try {
    const { cartId } = await request.json()

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

    return NextResponse.json({
      checkoutUrl: cart.checkoutUrl,
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
