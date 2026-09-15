import Link from 'next/link'
import { NewsletterButton } from '@/components/newsletter/NewsletterButton'
import { RichText } from '@/components/RichText'
import { sectionAnchor } from '@/lib/anchor'
import { localeHref } from '@/lib/i18n/href'
import { NEWSLETTER_HREF } from '@/lib/newsletter'
import type { Knapp, TekstSeksjon } from '@/types/sanity'
import styles from './TextSection.module.css'

interface TextSectionProps {
  data: TekstSeksjon
  /** Page-level CTA (text and/or button) shown in the left column */
  cta?: Knapp
  locale: string
}

export function TextSection({ data, cta, locale }: TextSectionProps) {
  const ctaSlug = cta?.lenke?.slug?.current
  const rawHref = ctaSlug ? `/${ctaSlug}` : cta?.internLenke
  const ctaHref = rawHref ? localeHref(rawHref, locale) : undefined
  // The newsletter is a modal, not a page, so that choice opens the signup
  // rather than navigating anywhere.
  const isNewsletter = rawHref === NEWSLETTER_HREF
  const hasCta = Boolean(cta?.beskrivelse?.length || (cta?.tekst && ctaHref))

  return (
    <div id={sectionAnchor(data._key, data.overskrift)} className={styles.textSection}>
      {(data.overskrift || hasCta) && (
        <div className={styles.textCtaCol}>
          {data.overskrift && <h2 className={styles.textHeading}>{data.overskrift}</h2>}
          {cta?.beskrivelse && (
            <div className={styles.textCtaText}>
              <RichText value={cta.beskrivelse} />
            </div>
          )}
          {cta?.tekst &&
            ctaHref &&
            (isNewsletter ? (
              <NewsletterButton
                label={cta.tekst}
                className={`${styles.textCtaButton} site-button`}
              />
            ) : (
              <Link href={ctaHref} className={`${styles.textCtaButton} site-button`}>
                {cta.tekst}
              </Link>
            ))}
        </div>
      )}
      {data.tekst && (
        <div className={styles.textBody}>
          <RichText value={data.tekst} />
        </div>
      )}
    </div>
  )
}
