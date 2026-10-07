import { type NextRequest, NextResponse } from 'next/server'
import { apiMessages } from '@/lib/api-messages'
import { isPastVariantDate } from '@/lib/i18n/variant-date'
import { rateLimit } from '@/lib/rate-limit'
import {
  ALLERGY_ATTRIBUTE,
  addToCart,
  createCart,
  getCart,
  getVariantForCart,
  removeFromCart,
  updateCartLine,
} from '@/lib/shopify'

const MAX_ALLERGIES_LENGTH = 300

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length < 500
}

function isValidQuantity(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 99
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
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const limited = rateLimit(`cart:${ip}`, { limit: 30, windowMs: 60_000 })
  if (limited) return limited

  try {
    const { cartId, variantId, quantity = 1, allergies } = await request.json()

    if (!isNonEmptyString(variantId)) {
      return NextResponse.json({ error: 'Valid variantId is required' }, { status: 400 })
    }

    if (!isValidQuantity(quantity)) {
      return NextResponse.json(
        { error: 'Quantity must be an integer between 0 and 99' },
        { status: 400 },
      )
    }

    if (allergies !== undefined && typeof allergies !== 'string') {
      return NextResponse.json({ error: 'Allergies must be text' }, { status: 400 })
    }

    const variant = await getVariantForCart(variantId)
    if (!variant) {
      return NextResponse.json({ error: 'Valid variantId is required' }, { status: 400 })
    }

    // A page rendered before the date passed can still offer it
    if (isPastVariantDate(variant.title)) {
      return NextResponse.json({ error: apiMessages.datePassed }, { status: 409 })
    }

    // Only kept for a product that asks for it, so the attribute cannot be
    // used to write arbitrary text onto any order line.
    const allergyText = variant.askAllergies
      ? (allergies ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_ALLERGIES_LENGTH)
      : ''
    const attributes = allergyText ? [{ key: ALLERGY_ATTRIBUTE, value: allergyText }] : []

    let cart

    if (cartId && isNonEmptyString(cartId)) {
      // Try to add to existing cart
      try {
        cart = await addToCart(cartId, variantId, quantity, attributes)
      } catch {
        // Cart might be expired, create new one
        cart = await createCart(variantId, quantity, attributes)
      }
    } else {
      // Create new cart with item
      cart = await createCart(variantId, quantity, attributes)
    }

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Failed to add to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

// PATCH - Update cart line quantity
export async function PATCH(request: NextRequest) {
  try {
    const { cartId, lineId, quantity } = await request.json()

    if (!isNonEmptyString(cartId) || !isNonEmptyString(lineId)) {
      return NextResponse.json({ error: 'Valid cartId and lineId are required' }, { status: 400 })
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
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}

// DELETE - Remove from cart
export async function DELETE(request: NextRequest) {
  try {
    const { cartId, lineId } = await request.json()

    if (!isNonEmptyString(cartId) || !isNonEmptyString(lineId)) {
      return NextResponse.json({ error: 'Valid cartId and lineId are required' }, { status: 400 })
    }

    const cart = await removeFromCart(cartId, lineId)
    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Failed to remove from cart:', error)
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
  }
}
