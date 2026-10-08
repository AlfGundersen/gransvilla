import { test } from '@playwright/test'
import { expect } from './helpers'

const password = process.env.DELTAKERE_PASSWORD

test.describe('the staff attendee lists', () => {
  test('are closed to anyone without the password', async ({ page }) => {
    await page.goto('/deltakere')

    await expect(page.getByLabel('Passord')).toBeVisible()
    await expect(page.locator('main table')).toHaveCount(0)
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/)

    await page.getByLabel('Passord').fill('ikke-passordet')
    await page.getByRole('button', { name: 'Logg inn' }).click()
    await expect(page.getByText('Feil passord.')).toBeVisible()
    await expect(page.locator('main table')).toHaveCount(0)
  })

  test('a forged session cookie opens nothing', async ({ page, baseURL }) => {
    await page.context().addCookies([
      { name: 'gv_staff', value: `9999999999999.${'a'.repeat(64)}`, url: `${baseURL}/deltakere` },
    ])
    await page.goto('/deltakere')

    await expect(page.getByLabel('Passord')).toBeVisible()
  })

  test('open with the password, and show lists or say why not', async ({ page }) => {
    test.skip(!password, 'DELTAKERE_PASSWORD is not set')

    await page.goto('/deltakere')
    await page.getByLabel('Passord').fill(password as string)
    await page.getByRole('button', { name: 'Logg inn' }).click()

    await expect(page.getByRole('button', { name: 'Logg ut' })).toBeVisible()
    // Lists when there are bookings; a plain sentence when there are none
    await expect(
      page.locator('main table').first().or(page.getByText('Ingen bestillinger')),
    ).toBeVisible()
  })
})
