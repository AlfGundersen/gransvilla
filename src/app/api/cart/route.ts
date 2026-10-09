import { type NextRequest, NextResponse } from 'next/server'
import { apiMessages } from '@/lib/api-messages'
import { isPastVariantDate, variantDateOrder } from '@/lib/i18n/variant-date'
import { rateLimit } from '@/lib/rate-limit'
import {
  ALLERGY_ATTRIBUTE,
  DATE_ATTRIBUTE,
  GUEST_OF_ATTRIBUTE,
  addLinesToCart,
  createCartWithLines,
  getCart,
  getVariantForCart,
  updateCartLines,
} from '@/lib/shopify'
import { changeLine, settleGuests } from '@/lib/shopify/guest-seats'
import type { Cart } from '@/lib/shopify/types'

const MAX_ALLERGIES_LENGTH = 100

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

/**
 * Takes out any guest left without a seat. Run after every change, since
 * Shopify can also cap a line to the stock that is left.
 */
async function withGuestsSettled(cart: Cart): Promise<Cart> {
  const updates = settleGuests(cart.items)
  return updates.length > 0 ? updateCartLines(cart.id, updates) : cart
}

/**
 * Sets one line's quantity, and whatever has to follow it: guests when their
 * seats go, the seat when its guest goes. Null where the change is not one the
 * cart makes.
 */
async function setLineQuantity(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart | null> {
  const before = await getCart(cartId)
  const updates = changeLine(before?.items ?? [], lineId, quantity)
  if (!updates) return null
  return withGuestsSettled(await updateCartLines(cartId, updates))
}

/** Far more than a month of lunches; enough to stop a request padding a cart */
const MAX_LINES = 40

// POST - Add to cart (create if needed)
//
// Takes one line as `{ variantId, quantity }`, or several as
// `{ lines: [{ variantId, quantity }] }`. Several are added in one go, so they
// either all land in the cart or none do. A guest surcharge also names the
// lunch variant the guest has a seat on, as `guestOf`.
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const limited = rateLimit(`cart:${ip}`, { limit: 30, windowMs: 60_000 })
  if (limited) return limited

  try {
    const body = await request.json()
    const { cartId, allergies } = body
    const requested: unknown[] = Array.isArray(body.lines)
      ? body.lines
      : [{ variantId: body.variantId, quantity: body.quantity ?? 1 }]

    if (requested.length === 0 || requested.length > MAX_LINES) {
      return NextResponse.json({ error: 'Between 1 and 40 lines are required' }, { status: 400 })
    }

    const wanted: { variantId: string; quantity: number; guestOf?: string }[] = []
    for (const line of requested) {
      const { variantId, quantity, guestOf } = (line ?? {}) as {
        variantId?: unknown
        quantity?: unknown
        guestOf?: unknown
      }

      if (!isNonEmptyString(variantId)) {
        return NextResponse.json({ error: 'Valid variantId is required' }, { status: 400 })
      }

      if (!isValidQuantity(quantity)) {
        return NextResponse.json(
          { error: 'Quantity must be an integer between 0 and 99' },
          { status: 400 },
        )
      }

      if (guestOf !== undefined && !isNonEmptyString(guestOf)) {
        return NextResponse.json({ error: 'Valid guestOf is required' }, { status: 400 })
      }

      wanted.push({ variantId, quantity, guestOf })
    }

    if (allergies !== undefined && typeof allergies !== 'string') {
      return NextResponse.json({ error: 'Allergies must be text' }, { status: 400 })
    }

    const variants = await Promise.all(wanted.map((line) => getVariantForCart(line.variantId)))
    if (variants.some((variant) => !variant)) {
      return NextResponse.json({ error: 'Valid variantId is required' }, { status: 400 })
    }

    // A page rendered before the date passed can still offer it
    // A guest surcharge is only taken for a dated lunch that says this is its
    // surcharge. The date written on the line is then the lunch's own, not
    // something the request made up.
    const lunches = await Promise.all(
      wanted.map((line) => (line.guestOf ? getVariantForCart(line.guestOf) : null)),
    )
    const badGuest = wanted.some(
      (line, i) =>
        line.guestOf &&
        (lunches[i]?.guestAddonVariantId !== line.variantId ||
          variantDateOrder(lunches[i]?.title ?? '') === null),
    )
    if (badGuest) {
      return NextResponse.json({ error: 'Valid guestOf is required' }, { status: 400 })
    }

    if ([...variants, ...lunches].some((variant) => variant && isPastVariantDate(variant.title))) {
      return NextResponse.json({ error: apiMessages.datePassed }, { status: 409 })
    }

    // Only kept for a product that asks for it, so the attribute cannot be
    // used to write arbitrary text onto any order line.
    const allergyText = (allergies ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_ALLERGIES_LENGTH)
    const lines = wanted.map(({ variantId, quantity, guestOf }, i) => ({
      variantId,
      quantity,
      attributes: [
        ...(guestOf && lunches[i]
          ? [
              { key: DATE_ATTRIBUTE, value: lunches[i].title },
              { key: GUEST_OF_ATTRIBUTE, value: guestOf },
            ]
          : []),
        ...(allergyText && variants[i]?.askAllergies
          ? [{ key: ALLERGY_ATTRIBUTE, value: allergyText }]
          : []),
      ],
    }))

    let cart

    if (cartId && isNonEmptyString(cartId)) {
      // Try to add to existing cart
      try {
        cart = await addLinesToCart(cartId, lines)
      } catch {
        // Cart might be expired, create new one
        cart = await createCartWithLines(lines)
      }
    } else {
      // Create new cart with the lines
      cart = await createCartWithLines(lines)
    }

    return NextResponse.json({ cart: await withGuestsSettled(cart) })
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

    const cart = await setLineQuantity(cartId, lineId, quantity)
    if (!cart) {
      return NextResponse.json(
        { error: 'A guest is added together with a seat, from the product' },
        { status: 400 },
      )
    }
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

    const cart = await setLineQuantity(cartId, lineId, 0)
    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Failed to remove from cart:', error)
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
  }
}
