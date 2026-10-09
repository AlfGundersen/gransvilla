import { availableDates, cartLines, dismissCookieBanner, expect, watchForErrors } from './helpers'
import { test } from '@playwright/test'

/**
 * A guest at the lunch is one more seat plus a surcharge that says which date
 * it is for. Skipped when the lunch has no guest surcharge linked in Shopify
 * or too few dates left, since both are the shop's to decide.
 */
const LUNCH = '/framdrift-lunsj'

test.describe('bringing a guest', () => {
  test('a guest on one of two dates is a seat and a surcharge for that date', async ({ page }) => {
    const errors = watchForErrors(page)
    const response = await page.goto(LUNCH)
    test.skip(!response?.ok(), 'the lunch is not for sale')
    await dismissCookieBanner(page)

    const addGuest = page.getByRole('button', { name: /Legg til gjest/ })
    const dates = availableDates(page)
    test.skip(
      !(await addGuest.isVisible().catch(() => false)) || (await dates.count()) < 2,
      'no guest surcharge linked, or fewer than two dates left',
    )

    const chosen: string[] = []
    for (const index of [0, 1]) {
      chosen.push(((await dates.nth(index).textContent()) ?? '').trim())
      await dates.nth(index).click()
    }
    await addGuest.click()
    await page.getByRole('button', { name: /Legg i handlekurv \(2/ }).click()

    const dialog = page.getByRole('dialog').filter({ hasText: 'Bekreft datoer' })
    await expect(dialog).toBeVisible()
    // The second date goes without its guest
    await dialog.getByRole('button', { name: `Reduser antall: Gjest ${chosen[1]}` }).click()

    await Promise.all([
      page.waitForResponse((r) => r.url().endsWith('/api/cart') && r.request().method() === 'POST'),
      dialog.getByRole('button', { name: 'Legg i handlekurv' }).click(),
    ])

    const lines = (await cartLines(page)) as {
      variantTitle: string
      quantity: number
      date?: string
      price: number
    }[]
    const seats = Object.fromEntries(
      lines.filter((line) => !line.date).map((line) => [line.variantTitle, line.quantity]),
    )
    const surcharges = lines.filter((line) => line.date)

    // The member and the guest share the first date's line; the second has one seat
    expect(seats).toEqual({ [chosen[0]]: 2, [chosen[1]]: 1 })
    expect(surcharges).toHaveLength(1)
    expect(surcharges[0]).toMatchObject({ date: chosen[0], quantity: 1 })
    expect(errors).toEqual([])
  })

  test('a date taken out in the summary is not added', async ({ page }) => {
    const response = await page.goto(LUNCH)
    test.skip(!response?.ok(), 'the lunch is not for sale')
    await dismissCookieBanner(page)

    const dates = availableDates(page)
    test.skip((await dates.count()) < 3, 'fewer than three dates left')

    const chosen: string[] = []
    for (const index of [0, 1, 2]) {
      chosen.push(((await dates.nth(index).textContent()) ?? '').trim())
      await dates.nth(index).click()
    }
    await page.getByRole('button', { name: /Legg i handlekurv \(3/ }).click()

    const dialog = page.getByRole('dialog').filter({ hasText: 'Bekreft datoer' })
    await dialog.getByRole('button', { name: `Fjern: ${chosen[1]}` }).click()
    await Promise.all([
      page.waitForResponse((r) => r.url().endsWith('/api/cart') && r.request().method() === 'POST'),
      dialog.getByRole('button', { name: 'Legg i handlekurv' }).click(),
    ])

    const titles = (await cartLines(page)).map((line) => line.variantTitle).sort()
    expect(titles).toEqual([chosen[0], chosen[2]].sort())
  })

  test('a surcharge is only taken for a lunch that says it is its surcharge', async ({ page }) => {
    const refused = await page.request.post('/api/cart', {
      data: {
        cartId: null,
        lines: [
          {
            variantId: 'gid://shopify/ProductVariant/1',
            quantity: 1,
            guestOf: 'gid://shopify/ProductVariant/2',
          },
        ],
      },
    })
    expect(refused.status()).toBe(400)
  })

  test('in the cart, a guest and the seat go together', async ({ page }) => {
    const response = await page.goto(LUNCH)
    test.skip(!response?.ok(), 'the lunch is not for sale')
    await dismissCookieBanner(page)

    const addGuest = page.getByRole('button', { name: /Legg til gjest/ })
    const dates = availableDates(page)
    test.skip(
      !(await addGuest.isVisible().catch(() => false)) || (await dates.count()) < 2,
      'no guest surcharge linked, or fewer than two dates left',
    )

    // A member and a guest on each of two dates
    await dates.nth(0).click()
    await dates.nth(1).click()
    await addGuest.click()
    await page.getByRole('button', { name: /Legg i handlekurv \(2/ }).click()
    const dialog = page.getByRole('dialog').filter({ hasText: 'Bekreft datoer' })
    await Promise.all([
      page.waitForResponse((r) => r.url().endsWith('/api/cart') && r.request().method() === 'POST'),
      dialog.getByRole('button', { name: 'Legg i handlekurv' }).click(),
    ])

    type Line = { id: string; variantId: string; quantity: number; guestOf?: string }
    const change = (method: 'PATCH' | 'DELETE', lineId: string, quantity?: number) =>
      page.evaluate(
        async ({ method, lineId, quantity }) => {
          const cartId = localStorage.getItem('gransvilla-cart-id')
          const response = await fetch('/api/cart', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cartId, lineId, quantity }),
          })
          return { status: response.status, items: (await response.json()).cart?.items as Line[] }
        },
        { method, lineId, quantity },
      )

    const start = (await cartLines(page)) as unknown as Line[]
    const [firstGuest, secondGuest] = start.filter((line) => line.guestOf)
    expect(start.filter((line) => line.guestOf)).toHaveLength(2)
    const seatOf = (lines: Line[], guest: Line) =>
      lines.find((line) => line.variantId === guest.guestOf)

    // A guest cannot be added from the cart
    expect((await change('PATCH', firstGuest.id, 2)).status).toBe(400)

    // Removing the lunch removes its guest
    const firstSeat = seatOf(start, firstGuest)
    if (!firstSeat) throw new Error('the first guest has no seat')
    const afterLunch = await change('DELETE', firstSeat.id)
    expect(afterLunch.items.some((line) => line.id === firstGuest.id)).toBe(false)
    expect(afterLunch.items.some((line) => line.id === secondGuest.id)).toBe(true)

    // Removing the guest takes the guest's seat, and leaves the member's
    const afterGuest = await change('DELETE', secondGuest.id)
    expect(afterGuest.items.filter((line) => line.guestOf)).toHaveLength(0)
    expect(seatOf(afterGuest.items, secondGuest)?.quantity).toBe(1)
  })

  test('the week ahead is shown first, and the rest on request', async ({ page }) => {
    const response = await page.goto(LUNCH)
    test.skip(!response?.ok(), 'the lunch is not for sale')
    await dismissCookieBanner(page)

    const more = page.getByRole('button', { name: 'Vis flere datoer' })
    test.skip(!(await more.isVisible().catch(() => false)), 'a week or less of dates left')

    const before = await availableDates(page).count()
    expect(before).toBeLessThanOrEqual(7)
    await more.click()
    expect(await availableDates(page).count()).toBeGreaterThan(before)
    await expect(more).toBeHidden()
  })
})
