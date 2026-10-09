import { expect, test } from '@playwright/test'
import { changeLine, settleGuests } from '../../src/lib/shopify/guest-seats'

const LUNCH = 'lunch-monday'
const seat = (id: string, quantity: number) => ({ id, variantId: LUNCH, quantity })
const guest = (id: string, quantity: number) => ({
  id,
  variantId: 'surcharge',
  quantity,
  guestOf: LUNCH,
})

test('a cart with a seat for every guest is left alone', () => {
  expect(settleGuests([seat('s', 2), guest('g', 1)])).toEqual([])
})

test('a guest with no seat left is taken out', () => {
  expect(settleGuests([guest('g', 1)])).toEqual([{ id: 'g', quantity: 0 }])
  expect(settleGuests([seat('s', 1), guest('g', 3)])).toEqual([{ id: 'g', quantity: 1 }])
})

test('seats are counted across the lines a lunch sits on', () => {
  expect(settleGuests([seat('a', 1), seat('b', 1), guest('g', 2)])).toEqual([])
})

test('removing the lunch removes its guests', () => {
  expect(changeLine([seat('s', 2), guest('g', 1)], 's', 0)).toEqual([
    { id: 's', quantity: 0 },
    { id: 'g', quantity: 0 },
  ])
})

test('fewer seats than guests takes the guests down with them', () => {
  expect(changeLine([seat('s', 3), guest('g', 2)], 's', 1)).toEqual([
    { id: 's', quantity: 1 },
    { id: 'g', quantity: 1 },
  ])
})

test('a seat fewer that still leaves room changes nothing else', () => {
  expect(changeLine([seat('s', 3), guest('g', 1)], 's', 2)).toEqual([{ id: 's', quantity: 2 }])
})

test('removing a guest removes the seat the guest sat on', () => {
  expect(changeLine([seat('s', 2), guest('g', 1)], 'g', 0)).toEqual([
    { id: 'g', quantity: 0 },
    { id: 's', quantity: 1 },
  ])
})

test('a guest cannot be added from the cart', () => {
  expect(changeLine([seat('s', 2), guest('g', 1)], 'g', 2)).toBeNull()
})

test('a line that is neither is changed on its own', () => {
  const cup = { id: 'c', variantId: 'cup', quantity: 1 }
  expect(changeLine([cup, seat('s', 1), guest('g', 1)], 'c', 4)).toEqual([{ id: 'c', quantity: 4 }])
})
