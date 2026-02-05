import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/lib/sanity/live'
import { siteSettingsQuery } from '@/lib/sanity/queries'
import { ContactForm } from './ContactForm'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Ta kontakt med Grans Villa',
  alternates: { canonical: '/kontakt' },
}

export default async function KontaktPage() {
  const { data: settings } = await sanityFetch({ query: siteSettingsQuery })
  const contactInfo = settings?.contactInfo

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Title column */}
        <div className={styles.titleColumn}>
          <h1 className={styles.title}>Kontakt</h1>
        </div>

        {/* Form column */}
        <div className={styles.formColumn}>
          <ContactForm />
        </div>

        {/* Contact info column */}
        <div className={styles.infoColumn}>
          {contactInfo?.phone && (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoHeading}>Ring oss</h2>
              <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className={styles.infoText}>
                {contactInfo.phone}
              </a>
            </div>
          )}

          {contactInfo?.email && (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoHeading}>Skriv til oss</h2>
              <a href={`mailto:${contactInfo.email}`} className={styles.infoText}>
                {contactInfo.email}
              </a>
            </div>
          )}

          {contactInfo?.address && (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoHeading}>Besøk oss</h2>
              <div className={styles.infoText}>
                <PortableText value={contactInfo.address} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
