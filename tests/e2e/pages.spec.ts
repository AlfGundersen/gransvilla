import { test } from '@playwright/test'
import { expect, watchForErrors } from './helpers'

const PAGES = ['/', '/butikken', '/arrangementer', '/kontakt', '/framdrift', '/personvern']

for (const path of PAGES) {
  test(`${path} renders cleanly`, async ({ page }) => {
    const errors = watchForErrors(page)
    const response = await page.goto(path)

    expect(response?.status()).toBe(200)
    await expect(page.locator('main h1').first()).toBeVisible()

    // Code that leaked onto the page as text, as `opensModal && ()` once did
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/&&\s*\(|\[object Object\]|\bundefined\b|\bNaN\b/)

    expect(errors).toEqual([])
  })
}

test('a product page is rendered on the server, dates and all', async ({ request }) => {
  const products: { handle: string }[] = await (await request.get('/api/shopify/products')).json()
  test.skip(products.length === 0, 'no products')

  const html = await (await request.get(`/butikken/${products[0].handle}`)).text()
  // The add-to-cart area is in the HTML, not filled in later by the browser
  expect(html).toMatch(/Legg i handlekurv|Velg en dato|Utsolgt|Kommer snart/)
})

test('changing page is one fade, with no placeholder page in between', async ({ page }) => {
  await page.goto('/arrangementer')
  const link = page.locator('main [class*=card] a').first()
  test.skip((await link.count()) === 0, 'no events to follow')
  const href = await link.getAttribute('href')

  // Every frame from the click on: was a skeleton or a blurred image ever shown?
  await page.evaluate(() => {
    const seen = { bones: 0, blurred: 0 }
    Object.assign(window, { __seen: seen })
    const tick = () => {
      if (document.querySelector('main [class*=bone]')) seen.bones++
      for (const image of document.querySelectorAll('main img')) {
        if (getComputedStyle(image).backgroundImage !== 'none') seen.blurred++
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await link.click()
  await page.waitForURL(`**${href}`)
  await page.waitForTimeout(1500)

  const seen = await page.evaluate(
    () => (window as unknown as { __seen: { bones: number; blurred: number } }).__seen,
  )
  expect(seen).toEqual({ bones: 0, blurred: 0 })
})
