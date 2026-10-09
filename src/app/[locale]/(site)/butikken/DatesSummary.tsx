'use client'

import { useState } from 'react'
import { useLocale, useT } from '@/lib/i18n/provider'
import { formatVariantTitle } from '@/lib/i18n/variant-date'
import styles from './DatesSummary.module.css'

interface DatesSummaryProps {
  /** The dates about to be added, in calendar order; `max` is the seats left */
  dates: { title: string; price: number; max?: number | null }[]
  /** Seats each date starts with */
  quantity: number
  currencyCode: string
  allergies?: string
  /**
   * Where a guest can come along: what one pays on top of the date's own
   * price, and how many each date starts with
   */
  guest?: { surcharge: number; quantity: number }
  onCancel: () => void
  /**
   * Called with the seats settled on for each date, in the order of `dates`,
   * and the guests among them where guests can be brought
   */
  onConfirm: (quantities: number[], guests: number[]) => void
}

const MAX_PER_LINE = 99

/**
 * What is about to go into the cart when several dates are added at once:
 * each date, the seats and the price, the total, and the two ways out. The
 * seats can still be changed date by date: four on Monday, one on Thursday.
 *
 * Shared by the product page's confirmation and the date picker a card opens,
 * so the last look before paying is the same wherever the dates were chosen.
 */
export function DatesSummary({
  dates,
  quantity,
  currencyCode,
  allergies,
  guest,
  onCancel,
  onConfirm,
}: DatesSummaryProps) {
  const t = useT()
  const locale = useLocale()
  const numberLocale = locale === 'en' ? 'en-GB' : 'nb-NO'
  const money = (amount: number) => `${amount.toLocaleString(numberLocale)} ${currencyCode}`

  // Mounted afresh each time the summary is shown, so this starts from what
  // was chosen on the way in
  const [quantities, setQuantities] = useState(() => dates.map(() => quantity))
  const [guests, setGuests] = useState(() => dates.map(() => guest?.quantity ?? 0))
  const step = (index: number, by: number) =>
    setQuantities((current) => current.map((n, i) => (i === index ? n + by : n)))
  const stepGuests = (index: number, by: number) =>
    setGuests((current) => current.map((n, i) => (i === index ? n + by : n)))
  // A date taken out again here, without going back to the picker. It stays
  // in the list the caller counts by, with nobody on it
  const [removed, setRemoved] = useState<number[]>([])
  const kept = (values: number[]) => values.map((n, i) => (removed.includes(i) ? 0 : n))
  const total = dates.reduce(
    (sum, date, i) =>
      removed.includes(i)
        ? sum
        : sum + date.price * quantities[i] + (guest ? date.price + guest.surcharge : 0) * guests[i],
    0,
  )

  // One row of seats for a date, or two where a guest can come along. A date
  // keeps at least one person on it, whichever kind
  const rows = (i: number) => [
    {
      label: t('Medlem'),
      value: quantities[i],
      min: guests[i] > 0 ? 0 : 1,
      price: dates[i].price,
      step: (by: number) => step(i, by),
    },
    ...(guest
      ? [
          {
            label: t('Gjest'),
            value: guests[i],
            min: quantities[i] > 0 ? 0 : 1,
            price: dates[i].price + guest.surcharge,
            step: (by: number) => stepGuests(i, by),
          },
        ]
      : []),
  ]

  return (
    <>
      <ul className={styles.dates}>
        {dates.map((date, i) => {
          if (removed.includes(i)) return null
          const title = formatVariantTitle(date.title, locale)
          return (
            <li key={date.title} className={`${styles.date} ${guest ? styles.dateStacked : ''}`}>
              <span className={styles.dateTitle}>{title}</span>
              <span className={styles.rows}>
                {rows(i).map((row) => (
                  <span key={row.label} className={styles.seats}>
                    {guest && <span className={styles.rowLabel}>{row.label}</span>}
                    <span className={styles.stepper}>
                      <button
                        type="button"
                        className={styles.stepperButton}
                        onClick={() => row.step(-1)}
                        disabled={row.value <= row.min}
                        aria-label={`${t('Reduser antall')}: ${row.label} ${title}`}
                      >
                        -
                      </button>
                      <span className={styles.stepperValue} aria-live="polite">
                        {row.value}
                      </span>
                      <button
                        type="button"
                        className={styles.stepperButton}
                        onClick={() => row.step(1)}
                        disabled={
                          quantities[i] + guests[i] >=
                          Math.min(date.max ?? MAX_PER_LINE, MAX_PER_LINE)
                        }
                        aria-label={`${t('Øk antall')}: ${row.label} ${title}`}
                      >
                        +
                      </button>
                    </span>
                    <span className={styles.price}>× {money(row.price)}</span>
                  </span>
                ))}
              </span>
              {dates.length - removed.length > 1 && (
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => setRemoved((current) => [...current, i])}
                  aria-label={`${t('Fjern')}: ${title}`}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
                  </svg>
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <p className={styles.total}>
        <span>{t('Totalt')}</span>
        <span>{money(total)}</span>
      </p>

      {allergies && (
        <p className={styles.allergies}>
          {t('Mathensyn')}: {allergies}
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          {t('Avbryt')}
        </button>
        <button
          type="button"
          className={styles.confirm}
          onClick={() => onConfirm(kept(quantities), kept(guests))}
        >
          {t('Legg i handlekurv')}
        </button>
      </div>
    </>
  )
}
