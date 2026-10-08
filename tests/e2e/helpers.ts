import { expect, type Page } from '@playwright/test'

/** Products sold by date, most dates first. Whatever the shop holds today. */
const DATED_PRODUCTS = ['/framdrift-lunsj', '/butikken/kranseverksted']

/** The cookie banner sits over the page and takes the clicks meant for it. */
export async function dismissCookieBanner(page: Page) {
  const refuse = page.getByRole('button', { name: /Kun nødvendige|Avvis alle/ }).first()
  if (await refuse.isVisible().catch(() => false)) await refuse.click()
}

/** The date buttons on a product page that can still be chosen. */
export function availableDates(page: Page) {
  return page.locator('fieldset [role=group] button:not([aria-disabled=true])')
}

/**
 * Opens the first product that has at least `min` dates left to sell, or
 * returns false when the shop has none right now — the dates are real, and a
 * test should not fail because November is over.
 */
export async function openDatedProduct(page: Page, min: number): Promise<boolean> {
  for (const path of DATED_PRODUCTS) {
    const response = await page.goto(path)
    if (!response?.ok()) continue
    await dismissCookieBanner(page)
    if ((await availableDates(page).count()) >= min) return true
  }
  return false
}

export interface CartLine {
  variantTitle: string
  quantity: number
  allergies?: string
}

/** The cart as Shopify has it, read through the site's own route. */
export async function cartLines(page: Page): Promise<CartLine[]> {
  return page.evaluate(async () => {
    const id = localStorage.getItem('gransvilla-cart-id')
    if (!id) return []
    const response = await fetch(`/api/cart?cartId=${encodeURIComponent(id)}`)
    const { cart } = await response.json()
    return cart?.items ?? []
  })
}

/** Collects what a visitor would never see but a developer should. */
export function watchForErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    // A failed request is reported below, with the address the console leaves out
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
      errors.push(message.text())
    }
  })
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
  })
  return errors
}

export { expect }
