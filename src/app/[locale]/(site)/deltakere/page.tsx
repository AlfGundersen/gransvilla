import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { defaultLocale } from '@/lib/i18n/config'
import { type AttendeeList, getAttendeeLists, isAdminConfigured } from '@/lib/shopify/admin'
import { isStaffAuthConfigured, isStaffSession, STAFF_COOKIE } from '@/lib/staff-auth'
import { AttendeeLists } from './AttendeeLists'
import { login, logout } from './actions'
import { LoginButton } from './LoginButton'
import { PrintButton } from './PrintButton'
import styles from './page.module.css'

/**
 * Staff only. It borrows the site's header and footer, but nothing else about
 * it is public: Norwegian only, kept out of search engines, and never cached.
 */
export const metadata: Metadata = {
  title: 'Deltakerlister',
  robots: { index: false, follow: false },
}

// Reads a cookie and shows live orders: never prerendered, never cached. The
// orders are fetched once per load; the filters then work on them in the browser.
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ produkt?: string; dag?: string; vis?: string; feil?: string }>
}

const LOGIN_ERRORS: Record<string, string> = {
  passord: 'Feil passord.',
  sperret: 'For mange forsøk. Vent ti minutter og prøv igjen.',
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Deltakerlister</h1>
      <p>{children}</p>
    </div>
  )
}

export default async function DeltakerePage({ params, searchParams }: Props) {
  // The session cookie only travels to /deltakere, so there is one address
  if ((await params).locale !== defaultLocale) redirect('/deltakere')

  const { produkt, dag, vis, feil } = await searchParams

  if (!isStaffAuthConfigured()) {
    return <Message>Siden er ikke satt opp ennå: DELTAKERE_PASSWORD mangler.</Message>
  }

  if (!isStaffSession((await cookies()).get(STAFF_COOKIE)?.value)) {
    const error = feil ? LOGIN_ERRORS[feil] : undefined

    return (
      <div className={styles.loginPage}>
        <form action={login} className={styles.login}>
          <h1 className={styles.loginTitle}>Deltakerlister</h1>
          <p className={styles.loginIntro}>For ansatte ved Grans Villa.</p>
          <label htmlFor="passord" className={styles.label}>
            Passord
          </label>
          <input
            id="passord"
            name="passord"
            type="password"
            autoComplete="current-password"
            required
            // biome-ignore lint/a11y/noAutofocus: the page has this one field and nothing else to do
            autoFocus
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'passord-feil' : undefined}
            className={styles.input}
          />
          {error && (
            <p id="passord-feil" role="alert" className={styles.error}>
              {error}
            </p>
          )}
          <LoginButton className={styles.loginButton} />
        </form>
      </div>
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

  return (
    <div className={styles.page}>
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

      <AttendeeLists
        lists={lists}
        initial={{ product: produkt, day: dag, showPast: vis === 'alle' }}
      />
    </div>
  )
}
