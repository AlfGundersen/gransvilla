import { test } from '@playwright/test'
import {
  availableDates,
  cartLines,
  expect,
  openDatedProduct,
  watchForErrors,
} from './helpers'

type Request = import('@playwright/test').APIRequestContext

/** Every variant id the shop's product pages mention. */
async function variantIds(request: Request): Promise<string[]> {
  const products: { handle: string }[] = await (await request.get('/api/shopify/products')).json()
  const ids = new Set<string>()
  for (const { handle } of products) {
    const html = await (await request.get(`/butikken/${handle}`, { maxRedirects: 5 })).text()
    for (const id of html.match(/gid:\/\/shopify\/ProductVariant\/\d+/g) ?? []) ids.add(id)
  }
  return [...ids]
}

/**
 * A variant with at least `seats` left, or null. Found by asking for that many
 * in a fresh cart: Shopify quietly adds only what stock allows.
 */
async function variantWithStock(request: Request, seats: number): Promise<string | null> {
  for (const variantId of await variantIds(request)) {
    const response = await request.post('/api/cart', {
      data: { cartId: null, variantId, quantity: seats },
    })
    if (!response.ok()) continue
    const { cart } = await response.json()
    if (cart.items[0]?.quantity === seats) return variantId
  }
  return null
}

test.describe('the cart route', () => {
  test('two visitors never get the same cart', async ({ page }) => {
    const variantId = await variantWithStock(page.request, 1)
    test.skip(!variantId, 'nothing in stock to add')

    // Identical requests, a moment apart: this once returned one cart for both
    const body = { cartId: null, variantId, quantity: 1 }
    const first = await (await page.request.post('/api/cart', { data: body })).json()
    const second = await (await page.request.post('/api/cart', { data: body })).json()

    expect(first.cart.id).toBeTruthy()
    expect(second.cart.id).not.toBe(first.cart.id)
  })

  test('adding the same thing twice adds it twice', async ({ page }) => {
    const variantId = await variantWithStock(page.request, 3)
    test.skip(!variantId, 'nothing with three in stock')

    const created = await (
      await page.request.post('/api/cart', { data: { cartId: null, variantId, quantity: 1 } })
    ).json()
    const add = { cartId: created.cart.id, variantId, quantity: 1 }
    await page.request.post('/api/cart', { data: add })
    const again = await (await page.request.post('/api/cart', { data: add })).json()

    const total = again.cart.items.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0,
    )
    expect(total).toBe(3)
  })

  test('a request with nothing valid in it is refused', async ({ page }) => {
    const empty = await page.request.post('/api/cart', { data: { cartId: null, lines: [] } })
    const bogus = await page.request.post('/api/cart', {
      data: { cartId: null, variantId: 'gid://shopify/ProductVariant/1', quantity: 1 },
    })

    expect(empty.status()).toBe(400)
    expect(bogus.status()).toBe(400)
  })
})

test.describe('booking dates on a product page', () => {
  test('one date goes straight into the cart', async ({ page }) => {
    const errors = watchForErrors(page)
    test.skip(!(await openDatedProduct(page, 1)), 'no dates for sale right now')

    const date = availableDates(page).first()
    const title = (await date.textContent())?.trim()
    await date.click()
    await page.locator('main button.site-button').first().click()

    await expect.poll(() => cartLines(page)).toHaveLength(1)
    const [line] = await cartLines(page)
    expect(line.variantTitle).toBe(title)
    expect(line.quantity).toBe(1)
    expect(errors).toEqual([])
  })

  test('several dates are confirmed, then added together with their own seats', async ({
    page,
  }) => {
    const errors = watchForErrors(page)
    test.skip(!(await openDatedProduct(page, 3)), 'fewer than three dates for sale right now')

    let posts = 0
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().endsWith('/api/cart')) posts++
    })

    const dates = availableDates(page)
    const chosen: string[] = []
    for (const index of [0, 1, 2]) {
      chosen.push(((await dates.nth(index).textContent()) ?? '').trim())
      await dates.nth(index).click()
    }
    await expect(page.getByText('3 datoer valgt')).toBeVisible()

    // More than one date asks first
    await page.locator('main button.site-button').first().click()
    const dialog = page.getByRole('dialog').filter({ hasText: 'Bekreft datoer' })
    await expect(dialog).toBeVisible()
    for (const title of chosen) await expect(dialog.getByText(title)).toBeVisible()

    // Seats can differ per date: 2 on the first, 1 on the others
    await dialog.getByRole('button', { name: /Øk antall/ }).first().click()
    await dialog.getByRole('button', { name: 'Legg i handlekurv' }).click()

    await expect.poll(() => cartLines(page)).toHaveLength(3)
    const lines = await cartLines(page)
    const seats = Object.fromEntries(lines.map((line) => [line.variantTitle, line.quantity]))
    expect(seats).toEqual({ [chosen[0]]: 2, [chosen[1]]: 1, [chosen[2]]: 1 })

    // All three in one request, so they land together
    expect(posts).toBe(1)
    expect(errors).toEqual([])
  })
})
