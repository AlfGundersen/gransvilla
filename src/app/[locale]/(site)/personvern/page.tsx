import { PortableText } from '@portabletext/react'
import type { Metadata } from 'next'
import { categoryLabels, cookieInventory } from '@/lib/cookies'
import { sanityFetch } from '@/lib/sanity/live'
import { personvernQuery } from '@/lib/sanity/queries'
import type { Personvernerklaering } from '@/types/sanity'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Personvernerklæring',
  description: 'Personvernerklæring for Gransvilla',
  alternates: { canonical: '/personvern' },
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function PersonvernPage() {
  const { data } = (await sanityFetch({ query: personvernQuery })) as {
    data: Personvernerklaering | null
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Personvernerklæring</h1>
      {(data?.opprettet || data?.oppdatert) && (
        <div className={styles.dates}>
          {data.opprettet && <span>Opprettet: {formatDate(data.opprettet)}</span>}
          {data.oppdatert && <span>Sist oppdatert: {formatDate(data.oppdatert)}</span>}
        </div>
      )}

      {/* Behandlingsansvarlig section */}
      {data?.firmanavn && (
        <div className={styles.content}>
          <h2 className={styles.cookieHeading}>Behandlingsansvarlig</h2>
          <address className={styles.dataController}>
            <strong>{data.firmanavn}</strong>
            {data.orgnummer && <br />}
            {data.orgnummer && <>Org.nr: {data.orgnummer}</>}
            {data.adresse && <br />}
            {data.adresse && <span className={styles.addressText}>{data.adresse}</span>}
            {data.epost && <br />}
            {data.epost && (
              <>
                E-post: <a href={`mailto:${data.epost}`}>{data.epost}</a>
              </>
            )}
          </address>
        </div>
      )}

      {data?.innhold ? (
        <div className={styles.content}>
          <PortableText value={data.innhold} />
        </div>
      ) : (
        <p className={styles.content}>Ingen personvernerklæring er lagt til ennå.</p>
      )}

      <div className={styles.content}>
        <h2 className={styles.cookieHeading}>Informasjonskapsler (cookies)</h2>
        <p>
          Nedenfor finner du en oversikt over informasjonskapslene som brukes på dette nettstedet.
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.cookieTable}>
            <thead>
              <tr>
                <th>Navn</th>
                <th>Leverandør</th>
                <th>Formål</th>
                <th>Kategori</th>
                <th>Varighet</th>
              </tr>
            </thead>
            <tbody>
              {cookieInventory.map((cookie) => (
                <tr key={cookie.name}>
                  <td>
                    <code>{cookie.name}</code>
                  </td>
                  <td>{cookie.provider}</td>
                  <td>{cookie.purpose}</td>
                  <td>{categoryLabels[cookie.category]}</td>
                  <td>{cookie.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>Lokal lagring</h3>
        <p>
          I tillegg bruker vi nettleserens lokale lagring (localStorage) for å lagre handlekurv-ID
          fra Shopify. Denne inneholder ingen personopplysninger, men gjør det mulig å bevare
          handlekurven mellom sidebesøk.
        </p>
      </div>
    </div>
  )
}
