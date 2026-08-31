import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import type { Knapp, TekstSeksjon } from '@/types/sanity'
import styles from './TextSection.module.css'

interface TextSectionProps {
  data: TekstSeksjon
  dataSanity?: string
  /** Page-level CTA (text and/or button) shown in the left column */
  cta?: Knapp
}

export function TextSection({ data, dataSanity, cta }: TextSectionProps) {
  const ctaSlug = cta?.lenke?.slug?.current
  const hasCta = Boolean(cta?.beskrivelse?.length || (cta?.tekst && ctaSlug))

  return (
    <div className={styles.textSection} data-sanity={dataSanity}>
      {(data.overskrift || hasCta) && (
        <div className={styles.textCtaCol}>
          {data.overskrift && <h2 className={styles.textHeading}>{data.overskrift}</h2>}
          {cta?.beskrivelse && (
            <div className={styles.textCtaText}>
              <PortableText value={cta.beskrivelse} />
            </div>
          )}
          {cta?.tekst && ctaSlug && (
            <Link href={`/${ctaSlug}`} className={`${styles.textCtaButton} site-button`}>
              {cta.tekst}
            </Link>
          )}
        </div>
      )}
      {data.tekst && (
        <div className={styles.textBody}>
          <PortableText value={data.tekst} />
        </div>
      )}
    </div>
  )
}
