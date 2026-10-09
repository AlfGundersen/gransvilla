/**
 * A guest in the cart is two lines: the seat, on the lunch's own variant, and
 * the surcharge, which names that variant in `guestOf`. Left to themselves the
 * two can drift apart — a seat removed and its surcharge still paid for, or
 * the surcharge removed and the guest eating at the member's price.
 *
 * These keep them in step whenever the cart changes. They only work out what
 * to change; the cart route does the changing.
 */

type Line = {
  id: string
  variantId: string
  quantity: number
  /** The lunch variant this surcharge line is a guest of */
  guestOf?: string
}

export type LineUpdate = { id: string; quantity: number }

/**
 * The changes that leave no more guests than there are seats for them.
 *
 * A lunch may sit on several lines (one with allergies, one without), so the
 * seats are counted across them.
 */
export function settleGuests(items: Line[]): LineUpdate[] {
  const seatsLeft = new Map<string, number>()
  const updates: LineUpdate[] = []

  for (const line of items) {
    if (!line.guestOf) continue
    if (!seatsLeft.has(line.guestOf)) {
      seatsLeft.set(
        line.guestOf,
        items
          .filter((item) => item.variantId === line.guestOf)
          .reduce((sum, item) => sum + item.quantity, 0),
      )
    }
    const seats = seatsLeft.get(line.guestOf) ?? 0
    const allowed = Math.min(line.quantity, seats)
    seatsLeft.set(line.guestOf, seats - allowed)
    if (allowed !== line.quantity) updates.push({ id: line.id, quantity: allowed })
  }

  return updates
}

/**
 * Everything that has to change for one line to be set to `quantity`.
 *
 * Fewer seats can leave guests with nowhere to sit, so those go too. Fewer
 * guests take their seats with them: the seat was the guest's. More guests is
 * not a change the cart makes — a guest is added from the product, together
 * with a seat — so that returns null.
 */
export function changeLine(items: Line[], lineId: string, quantity: number): LineUpdate[] | null {
  const line = items.find((item) => item.id === lineId)
  if (!line) return [{ id: lineId, quantity }]

  if (!line.guestOf) {
    const after = items.map((item) => (item.id === lineId ? { ...item, quantity } : item))
    return [{ id: lineId, quantity }, ...settleGuests(after)]
  }

  if (quantity > line.quantity) return null

  const updates: LineUpdate[] = [{ id: lineId, quantity }]
  let leaving = line.quantity - quantity
  for (const seat of items) {
    if (leaving === 0) break
    if (seat.variantId !== line.guestOf) continue
    const taken = Math.min(seat.quantity, leaving)
    updates.push({ id: seat.id, quantity: seat.quantity - taken })
    leaving -= taken
  }
  return updates
}
