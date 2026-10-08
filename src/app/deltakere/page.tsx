import { cookies } from 'next/headers'
import Link from 'next/link'
import {
  type Attendee,
  type AttendeeList,
  getAttendeeLists,
  isAdminConfigured,
} from '@/lib/shopify/admin'
import { isStaffAuthConfigured, isStaffSession, STAFF_COOKIE } from '@/lib/staff-auth'
import { login, logout } from './actions'
import { PrintButton } from './PrintButton'
import styles from './page.module.css'

// Reads a cookie and shows live orders: never prerendered, never cached
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ produkt?: string; vis?: string; feil?: string }>
}

const LOGIN_ERRORS: Record<string, string> = {
  passord: 'Feil passord.',
  sperret: 'For mange forsøk. Vent ti minutter og prøv igjen.',
}

function listHref(product: string | undefined, showPast: boolean): string {
  const params = new URLSearchParams()
  if (product) params.set('produkt', product)
  if (showPast) params.set('vis', 'alle')
  const query = params.toString()
  return query ? `/deltakere?${query}` : '/deltakere'
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Deltakerlister</h1>
      <p>{children}</p>
    </main>
  )
}

/** Kept folded away: the list is read far more often than anyone is rung. */
function Contact({ attendee }: { attendee: Attendee }) {
  if (!attendee.email && !attendee.phone) return null

  return (
    <details className={styles.contact}>
      <summary className={styles.contactButton}>Vis kontakt</summary>
      {attendee.phone && <a href={`tel:${attendee.phone}`}>{attendee.phone}</a>}
      {attendee.email && <a href={`mailto:${attendee.email}`}>{attendee.email}</a>}
    </details>
  )
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
                <Contact attendee={attendee} />
              </td>
              <td>{attendee.order}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default async function DeltakerePage({ searchParams }: Props) {
  const { produkt, vis, feil } = await searchParams

  if (!isStaffAuthConfigured()) {
    return <Message>Siden er ikke satt opp ennå: DELTAKERE_PASSWORD mangler.</Message>
  }

  if (!isStaffSession((await cookies()).get(STAFF_COOKIE)?.value)) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>Deltakerlister</h1>
        <form action={login} className={styles.login}>
          <label htmlFor="passord">Passord</label>
          <input
            id="passord"
            name="passord"
            type="password"
            autoComplete="current-password"
            required
            className={styles.input}
          />
          {feil && LOGIN_ERRORS[feil] && (
            <p role="alert" className={styles.error}>
              {LOGIN_ERRORS[feil]}
            </p>
          )}
          <button type="submit" className={styles.button}>
            Logg inn
          </button>
        </form>
      </main>
    )
  }

  if (!isAdminConfigured()) {
    return (
      <Message>Siden er ikke koblet til Shopify ennå: SHOPIFY_ADMIN_ACCESS_TOKEN mangler.</Message>
    )
  }

  let lists: AttendeeList[]
  try {
    lists = await getAttendeeLists()
  } catch (error) {
    console.error('Could not load attendee lists:', error)
    return <Message>Kunne ikke hente bestillingene fra Shopify. Prøv igjen om litt.</Message>
  }

  const showPast = vis === 'alle'
  const products = [...new Set(lists.map((list) => list.product))].sort((a, b) =>
    a.localeCompare(b, 'nb'),
  )
  const product = produkt && products.includes(produkt) ? produkt : undefined
  const visible = lists.filter(
    (list) => (showPast || !list.past) && (!product || list.product === product),
  )

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <h1 className={styles.title}>Deltakerlister</h1>
        <div className={styles.actions}>
          <PrintButton className={styles.button} />
          <form action={logout}>
            <button type="submit" className={styles.buttonQuiet}>
              Logg ut
            </button>
          </form>
        </div>
      </div>

      <nav className={styles.filters} aria-label="Filter">
        <Link
          href={listHref(undefined, showPast)}
          className={styles.filter}
          aria-current={product ? undefined : 'page'}
        >
          Alle
        </Link>
        {products.map((name) => (
          <Link
            key={name}
            href={listHref(name, showPast)}
            className={styles.filter}
            aria-current={product === name ? 'page' : undefined}
          >
            {name}
          </Link>
        ))}
        <Link href={listHref(product, !showPast)} className={styles.toggle}>
          {showPast ? 'Skjul tidligere datoer' : 'Vis tidligere datoer'}
        </Link>
      </nav>

      {visible.length === 0 ? (
        <p>Ingen bestillinger på kommende datoer.</p>
      ) : (
        visible.map((list) => <EventList key={`${list.product}\n${list.date}`} list={list} />)
      )}
    </main>
  )
}
