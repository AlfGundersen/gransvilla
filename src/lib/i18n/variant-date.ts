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

/** Minutes Europe/Oslo is ahead of UTC at the given instant: 60 in winter, 120 in summer. */
function osloOffsetMinutes(utcMs: number): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(utcMs))
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const wallClock = Date.UTC(
    part('year'),
    part('month') - 1,
    part('day'),
    part('hour'),
    part('minute'),
  )
  return Math.round((wallClock - utcMs) / 60_000)
}

/** A date with no time of day, as the Framdrift lunch is sold: `08.10.2026` */
const VARIANT_DAY = /^(\d{2})\.(\d{2})\.(\d{4})$/

/**
 * True when a dated variant title names a moment that has already been.
 *
 * Shopify has no idea these titles are dates, so a lunch that was served last
 * week stays for sale until someone deletes the variant. The date is read as
 * Norwegian time whatever the server's own clock is set to — Netlify runs in
 * UTC, which would keep a 12:00 lunch on sale until 13:00 or 14:00.
 *
 * A title with a time is past from that time. One with only a date says
 * nothing about when in the day, so it lasts the day out and is past from
 * midnight.
 *
 * A cart line's title joins several options as `A / B`, so each part is tried.
 * Anything that is not a dated title is never past.
 */
export function isPastVariantDate(title: string, now: number = Date.now()): boolean {
  return title.split(' / ').some((part) => {
    const timed = part.trim().match(VARIANT_DATE)
    const dayOnly = timed ? null : part.trim().match(VARIANT_DAY)
    if (!timed && !dayOnly) return false

    const [, day, month, year, hour = 0, minute = 0] = (timed ?? dayOnly ?? []).map(Number)
    const wallClock = Date.UTC(year, month - 1, timed ? day : day + 1, hour, minute)
    return wallClock - osloOffsetMinutes(wallClock) * 60_000 <= now
  })
}
