import { defaultLocale, isLocale } from './config'
import { VARIANT_DATE } from './walk'

/**
 * Shopify variant titles for dated events, written in Sanity as
 * `08.11.2026 kl. 12:00` (the dot after `kl` is sometimes missing).
 *
 * These are structured data, not prose. Sending them through a machine
 * translator produced "November 8, 2026, at 12:00 p.m." — correct English, but
 * a 12-hour clock nobody here uses, and a new entry to curate every time a date
 * is added. Formatting them ourselves keeps the clock consistent and costs no
 * quota.
 */
const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * Formats a dated variant title for the locale, on a 24-hour clock.
 *
 *   nb  08.11.2026 kl. 14:00   (unchanged)
 *   en  8 November 2026, 14:00
 *
 * Anything that is not a dated title is returned untouched.
 */
export function formatVariantTitle(title: string, locale: string): string {
  const match = title.trim().match(VARIANT_DATE)
  if (!match) return title

  const resolved = isLocale(locale) ? locale : defaultLocale
  if (resolved === defaultLocale) return title

  const [, day, month, year, hour, minute] = match
  const monthName = MONTHS_EN[Number(month) - 1]
  if (!monthName) return title

  return `${Number(day)} ${monthName} ${year}, ${hour.padStart(2, '0')}:${minute}`
}
