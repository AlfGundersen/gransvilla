import type { Metadata } from 'next'
import { RichText } from '@/components/RichText'
import { alternatesFor } from '@/lib/i18n/metadata'
import { getTranslator, translateContent } from '@/lib/i18n/server'
import { sanityFetch } from '@/lib/sanity/live'
import { siteSettingsQuery } from '@/lib/sanity/queries'
import { ContactForm } from './ContactForm'
import styles from './page.module.css'

/**
 * Published Sanity content should not wait for the next deploy. Only the shop
 * pages revalidated, so an edit made after a build stayed invisible until
 * something else triggered one.
 */
export const revalidate = 60

type Params = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const t = getTranslator(locale)

  return {
    title: t('Kontakt'),
    description: t('Ta kontakt med Grans Villa'),
    alternates: alternatesFor('/kontakt', locale),
  }
}

export default async function KontaktPage({ params }: Params) {
  const { locale } = await params
  const t = getTranslator(locale)

  const { data } = await sanityFetch({ query: siteSettingsQuery })
  const settings = await translateContent(data, locale)
  const contactInfo = settings?.contactInfo

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Title column */}
        <div className={styles.titleColumn}>
          <h1 className={styles.title}>{t('Kontakt')}</h1>
        </div>

        {/* Form column */}
        <div className={styles.formColumn}>
          <ContactForm />
        </div>

        {/* Contact info column */}
        <div className={styles.infoColumn}>
          {contactInfo?.phone && (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoHeading}>{t('Ring oss')}</h2>
              <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className={styles.infoText}>
                {contactInfo.phone}
              </a>
            </div>
          )}

          {contactInfo?.email && (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoHeading}>{t('Skriv til oss')}</h2>
              <a href={`mailto:${contactInfo.email}`} className={styles.infoText}>
                {contactInfo.email}
              </a>
            </div>
          )}

          {contactInfo?.address && (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoHeading}>{t('Besøk oss')}</h2>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Jahnebakken+6%2C+5007+Bergen"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.infoText}
                aria-label={t('Vis adressen i Google Maps (åpnes i nytt vindu)')}
              >
                <RichText value={contactInfo.address} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
