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
  onCancel: () => void
  /** Called with the seats settled on for each date, in the order of `dates` */
  onConfirm: (quantities: number[]) => void
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
  const step = (index: number, by: number) =>
    setQuantities((current) => current.map((n, i) => (i === index ? n + by : n)))
  const total = dates.reduce((sum, date, i) => sum + date.price * quantities[i], 0)

  return (
    <>
      <ul className={styles.dates}>
        {dates.map((date, i) => {
          const title = formatVariantTitle(date.title, locale)
          return (
            <li key={date.title} className={styles.date}>
              <span className={styles.dateTitle}>{title}</span>
              <span className={styles.seats}>
                <span className={styles.stepper}>
                  <button
                    type="button"
                    className={styles.stepperButton}
                    onClick={() => step(i, -1)}
                    disabled={quantities[i] <= 1}
                    aria-label={`${t('Reduser antall')}: ${title}`}
                  >
                    -
                  </button>
                  <span className={styles.stepperValue} aria-live="polite">
                    {quantities[i]}
                  </span>
                  <button
                    type="button"
                    className={styles.stepperButton}
                    onClick={() => step(i, 1)}
                    disabled={quantities[i] >= Math.min(date.max ?? MAX_PER_LINE, MAX_PER_LINE)}
                    aria-label={`${t('Øk antall')}: ${title}`}
                  >
                    +
                  </button>
                </span>
                <span className={styles.price}>× {money(date.price)}</span>
              </span>
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
          {t('Allergier')}: {allergies}
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          {t('Avbryt')}
        </button>
        <button type="button" className={styles.confirm} onClick={() => onConfirm(quantities)}>
          {t('Legg i handlekurv')}
        </button>
      </div>
    </>
  )
}
