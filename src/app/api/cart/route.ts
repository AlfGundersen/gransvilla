import { NextRequest, NextResponse } from 'next/server'
import {
  createCart,
  addToCart,
  getCart,
  updateCartLine,
  removeFromCart,
} from '@/lib/shopify'

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length < 500
}

function isValidQuantity(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 99
  )
}

// GET - Fetch cart
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cartId = searchParams.get('cartId')

  if (!cartId || !isNonEmptyString(cartId)) {
    return NextResponse.json({ cart: null })
  }

  try {
    const cart = await getCart(cartId)
    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Failed to get cart:', error)
    return NextResponse.json({ cart: null })
  }
}

// POST - Add to cart (create if needed)
export async function POST(request: NextRequest) {
  try {
    const { cartId, variantId, quantity = 1 } = await request.json()

    if (!isNonEmptyString(variantId)) {
      return NextResponse.json(
        { error: 'Valid variantId is required' },
        { status: 400 },
      )
    }

    if (!isValidQuantity(quantity)) {
      return NextResponse.json(
        { error: 'Quantity must be an integer between 0 and 99' },
        { status: 400 },
      )
    }

    let cart

    if (cartId && isNonEmptyString(cartId)) {
      // Try to add to existing cart
      try {
        cart = await addToCart(cartId, variantId, quantity)
      } catch {
        // Cart might be expired, create new one
        cart = await createCart(variantId, quantity)
      }
    } else {
      // Create new cart with item
      cart = await createCart(variantId, quantity)
    }

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Failed to add to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 },
    )
  }
}

// PATCH - Update cart line quantity
export async function PATCH(request: NextRequest) {
  try {
    const { cartId, lineId, quantity } = await request.json()

    if (!isNonEmptyString(cartId) || !isNonEmptyString(lineId)) {
      return NextResponse.json(
        { error: 'Valid cartId and lineId are required' },
        { status: 400 },
      )
    }

    if (!isValidQuantity(quantity)) {
      return NextResponse.json(
        { error: 'Quantity must be an integer between 0 and 99' },
        { status: 400 },
      )
    }

    const cart = await updateCartLine(cartId, lineId, quantity)
    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Failed to update cart:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 },
    )
  }
}

// DELETE - Remove from cart
export async function DELETE(request: NextRequest) {
  try {
    const { cartId, lineId } = await request.json()

    if (!isNonEmptyString(cartId) || !isNonEmptyString(lineId)) {
      return NextResponse.json(
        { error: 'Valid cartId and lineId are required' },
        { status: 400 },
      )
    }

    const cart = await removeFromCart(cartId, lineId)
    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Failed to remove from cart:', error)
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 },
    )
  }
}
