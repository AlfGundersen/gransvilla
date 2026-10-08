'use client'

import { useState } from 'react'
import type { AttendeeList } from '@/lib/shopify/admin'
import { Contact } from './Contact'
import styles from './page.module.css'

interface Filter {
  product?: string
  /** A day as the variant titles write it: `08.11.2026` */
  day?: string
  showPast: boolean
}

function listHref({ product, day, showPast }: Filter): string {
  const params = new URLSearchParams()
  if (product) params.set('produkt', product)
  if (day) params.set('dag', day)
  if (showPast) params.set('vis', 'alle')
  const query = params.toString()
  return query ? `/deltakere?${query}` : '/deltakere'
}

/** The day of a dated variant title, with or without a time after it. */
function dayOf(date: string): string {
  return date.slice(0, 10)
}

const DAY_LABEL = new Intl.DateTimeFormat('nb-NO', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

/** `08.11.2026` as `søn. 8. nov.` */
function dayLabel(day: string): string {
  const [date, month, year] = day.split('.').map(Number)
  return DAY_LABEL.format(Date.UTC(year, month - 1, date))
}

function EventList({ list }: { list: AttendeeList }) {
  const withAllergies = list.attendees.filter((attendee) => attendee.allergies)

  return (
    <section className={styles.event}>
      <header className={styles.eventHeader}>
        <h2 className={styles.eventTitle}>
          {list.product} <span className={styles.eventDate}>{list.date}</span>
        </h2>
        <p className={styles.eventCount}>
          {list.seats} {list.seats === 1 ? 'plass' : 'plasser'} · {list.attendees.length}{' '}
          {list.attendees.length === 1 ? 'bestilling' : 'bestillinger'}
        </p>
      </header>

      {withAllergies.length > 0 && (
        <div className={styles.allergies}>
          <h3 className={styles.allergiesTitle}>Allergier</h3>
          <ul className={styles.allergiesList}>
            {withAllergies.map((attendee) => (
              <li key={attendee.order}>
                <strong>{attendee.name}</strong> ({attendee.quantity}{' '}
                {attendee.quantity === 1 ? 'plass' : 'plasser'}): {attendee.allergies}
              </li>
            ))}
          </ul>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Navn</th>
            <th scope="col" className={styles.number}>
              Antall
            </th>
            <th scope="col">Allergier</th>
            <th scope="col">Kontakt</th>
            <th scope="col">Bestilling</th>
          </tr>
        </thead>
        <tbody>
          {list.attendees.map((attendee) => (
            <tr key={attendee.order}>
              <td>{attendee.name}</td>
              <td className={styles.number}>{attendee.quantity}</td>
              <td>{attendee.allergies}</td>
              <td>
                <Contact email={attendee.email} phone={attendee.phone} />
              </td>
              <td>{attendee.order}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

/**
 * The filters and the lists they choose between.
 *
 * Filtering happens here rather than on the server: every list is already in
 * the page, and asking Shopify again for each click made changing day take a
 * second. The address still follows the choice, so a reload or a shared link
 * shows the same thing.
 */
export function AttendeeLists({ lists, initial }: { lists: AttendeeList[]; initial: Filter }) {
  const [filter, setFilter] = useState(initial)

  function choose(next: Filter) {
    setFilter(next)
    window.history.replaceState(null, '', listHref(next))
  }

  const { showPast } = filter
  const products = [...new Set(lists.map((list) => list.product))].sort((a, b) =>
    a.localeCompare(b, 'nb'),
  )
  const product = filter.product && products.includes(filter.product) ? filter.product : undefined
  const inScope = lists.filter(
    (list) => (showPast || !list.past) && (!product || list.product === product),
  )

  // The lists arrive in date order, so the days come out in calendar order
  const days = new Set(inScope.map((list) => dayOf(list.date)))
  const day = filter.day && days.has(filter.day) ? filter.day : undefined
  const visible = day ? inScope.filter((list) => dayOf(list.date) === day) : inScope

  return (
    <>
      <div className={styles.filters}>
        <button
          type="button"
          className={styles.filter}
          aria-pressed={!product}
          onClick={() => choose({ day, showPast })}
        >
          Alle
        </button>
        {products.map((name) => (
          <button
            key={name}
            type="button"
            className={styles.filter}
            aria-pressed={product === name}
            onClick={() => choose({ product: name, day, showPast })}
          >
            {name}
          </button>
        ))}
        <button
          type="button"
          className={styles.toggle}
          onClick={() => choose({ product, showPast: !showPast })}
        >
          {showPast ? 'Skjul tidligere datoer' : 'Vis tidligere datoer'}
        </button>
      </div>

      {days.size > 0 && (
        <div className={styles.days}>
          <button
            type="button"
            className={styles.day}
            aria-pressed={!day}
            onClick={() => choose({ product, showPast })}
          >
            Alle datoer
          </button>
          {[...days].map((name) => (
            <button
              key={name}
              type="button"
              className={styles.day}
              aria-pressed={day === name}
              onClick={() => choose({ product, day: name, showPast })}
            >
              {dayLabel(name)}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p>Ingen bestillinger på kommende datoer.</p>
      ) : (
        visible.map((list) => <EventList key={`${list.product}\n${list.date}`} list={list} />)
      )}
    </>
  )
}
