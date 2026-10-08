import { expect, test } from '@playwright/test'
import { isPastVariantDate, variantDateOrder } from '@/lib/i18n/variant-date'

const at = (iso: string) => new Date(iso).getTime()

test.describe('when a dated variant stops being for sale', () => {
  // [title, now (UTC), past?]
  const cases: [string, string, boolean][] = [
    // The lunch: a date with no time ends at 13:00 Norwegian time
    ['08.10.2026', '2026-10-08T10:59:00Z', false], // 12:59, summer time
    ['08.10.2026', '2026-10-08T11:00:00Z', true], // 13:00
    ['08.10.2026', '2026-10-07T21:00:00Z', false], // the evening before
    ['02.11.2026', '2026-11-02T11:59:00Z', false], // 12:59, winter time
    ['02.11.2026', '2026-11-02T12:00:00Z', true], // 13:00
    // A date with a time ends at that time
    ['08.11.2026 kl. 12:00', '2026-11-08T10:59:00Z', false],
    ['08.11.2026 kl. 12:00', '2026-11-08T11:00:00Z', true],
    ['08.11.2026 kl 14:00', '2026-11-08T12:30:00Z', false],
    // A cart line joins options with " / "
    ['Stor / 08.10.2026', '2026-10-08T11:00:00Z', true],
    // Anything that is not a date is never past
    ['Default Title', '2030-01-01T00:00:00Z', false],
  ]

  for (const [title, now, past] of cases) {
    test(`${title} at ${now} is ${past ? 'past' : 'for sale'}`, () => {
      expect(isPastVariantDate(title, at(now))).toBe(past)
    })
  }
})

test('dates sort in calendar order, and non-dates do not sort at all', () => {
  const titles = ['15.11.2026 kl. 14:00', '08.10.2026', '15.11.2026 kl. 12:00', '09.10.2026']
  const sorted = [...titles].sort((a, b) => (variantDateOrder(a) ?? 0) - (variantDateOrder(b) ?? 0))

  expect(sorted).toEqual(['08.10.2026', '09.10.2026', '15.11.2026 kl. 12:00', '15.11.2026 kl. 14:00'])
  expect(variantDateOrder('Default Title')).toBeNull()
})
