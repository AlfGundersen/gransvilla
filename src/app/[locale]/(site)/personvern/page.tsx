import { PortableText } from '@portabletext/react'
import type { Metadata } from 'next'
import { categoryLabels, cookieInventory } from '@/lib/cookies'
import { alternatesFor } from '@/lib/i18n/metadata'
import { getTranslator, translateContent } from '@/lib/i18n/server'
import { sanityFetch } from '@/lib/sanity/live'
import { personvernQuery } from '@/lib/sanity/queries'
import type { Personvernerklaering } from '@/types/sanity'
import styles from './page.module.css'

type Params = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const t = getTranslator(locale)

  return {
    title: t('Personvernerklæring'),
    description: t('Personvernerklæring for Gransvilla'),
    alternates: alternatesFor('/personvern', locale),
  }
}

function formatDate(dateString: string, locale: string) {
  return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-GB' : 'nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function PersonvernPage({ params }: Params) {
  const { locale } = await params
  const t = getTranslator(locale)

  const { data: raw } = (await sanityFetch({ query: personvernQuery })) as {
    data: Personvernerklaering | null
  }
  const data = translateContent(raw, locale)

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>{t('Personvernerklæring')}</h1>
      {(data?.opprettet || data?.oppdatert) && (
        <div className={styles.dates}>
          {data.opprettet && (
            <span>
              {t('Opprettet')}: {formatDate(data.opprettet, locale)}
            </span>
          )}
          {data.oppdatert && (
            <span>
              {t('Sist oppdatert')}: {formatDate(data.oppdatert, locale)}
            </span>
          )}
        </div>
      )}

      {/* Behandlingsansvarlig section */}
      {data?.firmanavn && (
        <div className={styles.content}>
          <h2 className={styles.cookieHeading}>{t('Behandlingsansvarlig')}</h2>
          <address className={styles.dataController}>
            <strong>{data.firmanavn}</strong>
            {data.orgnummer && <br />}
            {data.orgnummer && (
              <>
                {t('Org.nr')}: {data.orgnummer}
              </>
            )}
            {data.adresse && <br />}
            {data.adresse && <span className={styles.addressText}>{data.adresse}</span>}
            {data.epost && <br />}
            {data.epost && (
              <>
                {t('E-post')}: <a href={`mailto:${data.epost}`}>{data.epost}</a>
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
        <p className={styles.content}>{t('Ingen personvernerklæring er lagt til ennå.')}</p>
      )}

      <div className={styles.content}>
        <h2 className={styles.cookieHeading}>{t('Informasjonskapsler (cookies)')}</h2>
        <p>
          {t(
            'Nedenfor finner du en oversikt over informasjonskapslene som brukes på dette nettstedet.',
          )}
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.cookieTable}>
            <thead>
              <tr>
                <th>{t('Navn')}</th>
                <th>{t('Leverandør')}</th>
                <th>{t('Formål')}</th>
                <th>{t('Kategori')}</th>
                <th>{t('Varighet')}</th>
              </tr>
            </thead>
            <tbody>
              {cookieInventory.map((cookie) => (
                <tr key={cookie.name}>
                  <td>
                    <code>{cookie.name}</code>
                  </td>
                  <td>{cookie.provider}</td>
                  <td>{t(cookie.purpose)}</td>
                  <td>{t(categoryLabels[cookie.category])}</td>
                  <td>{t(cookie.duration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>{t('Lokal lagring')}</h3>
        <p>
          {t(
            'I tillegg bruker vi nettleserens lokale lagring (localStorage) for å lagre handlekurv-ID fra Shopify. Denne inneholder ingen personopplysninger, men gjør det mulig å bevare handlekurven mellom sidebesøk.',
          )}
        </p>
      </div>
    </div>
  )
}
