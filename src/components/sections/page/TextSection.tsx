import Image from 'next/image'
import Link from 'next/link'
import { NewsletterButton } from '@/components/newsletter/NewsletterButton'
import { RichText } from '@/components/RichText'
import { sectionAnchor } from '@/lib/anchor'
import { localeHref } from '@/lib/i18n/href'
import { NEWSLETTER_HREF } from '@/lib/newsletter'
import { getBlurDataURL } from '@/lib/sanity/blur'
import { urlFor } from '@/lib/sanity/image'
import { placeholderImage } from '@/lib/section-placeholder'
import type { Knapp, TekstSeksjon } from '@/types/sanity'
import styles from './TextSection.module.css'

interface TextSectionProps {
  data: TekstSeksjon
  /** Page-level CTA: text in the left column, button under the body text */
  cta?: Knapp
  locale: string
}

export async function TextSection({ data, cta, locale }: TextSectionProps) {
  const ctaSlug = cta?.lenke?.slug?.current
  const rawHref = ctaSlug ? `/${ctaSlug}` : cta?.internLenke
  const ctaHref = rawHref ? localeHref(rawHref, locale) : undefined
  // The newsletter is a modal, not a page, so that choice opens the signup
  // rather than navigating anywhere.
  const isNewsletter = rawHref === NEWSLETTER_HREF

  // The button follows the body text rather than sitting beside it, so a
  // reader meets it where the reading ends.
  const button =
    cta?.tekst && ctaHref ? (
      isNewsletter ? (
        <NewsletterButton label={cta.tekst} className={`${styles.textCtaButton} site-button`} />
      ) : (
        <Link href={ctaHref} className={`${styles.textCtaButton} site-button`}>
          {cta.tekst}
        </Link>
      )
    ) : null

  // The left column is for the heading and the CTA's own text. With the button
  // moved out, a section with neither would leave a third of its width blank,
  // so a picture stands in until the section can carry one of its own.
  const hasSideCol = Boolean(data.overskrift || cta?.beskrivelse?.length)
  const placeholder = hasSideCol ? null : placeholderImage(data._key)
  const placeholderBlur = placeholder ? await getBlurDataURL(placeholder) : undefined

  return (
    <div id={sectionAnchor(data._key, data.overskrift)} className={styles.textSection}>
      {hasSideCol ? (
        <div className={styles.textCtaCol}>
          {data.overskrift && <h2 className={styles.textHeading}>{data.overskrift}</h2>}
          {cta?.beskrivelse && (
            <div className={styles.textCtaText}>
              <RichText value={cta.beskrivelse} />
            </div>
          )}
        </div>
      ) : (
        placeholder && (
          <div className={`${styles.textCtaCol} ${styles.textPlaceholderCol}`}>
            <Image
              src={urlFor(placeholder).width(600).height(900).fit('crop').quality(85).url()}
              alt=""
              aria-hidden="true"
              width={600}
              height={900}
              className={styles.textPlaceholderImg}
              sizes="(max-width: 767px) 0px, 25vw"
              placeholder={placeholderBlur ? 'blur' : 'empty'}
              blurDataURL={placeholderBlur}
            />
          </div>
        )
      )}
      {(data.tekst || button) && (
        <div className={styles.textBody}>
          {data.tekst && <RichText value={data.tekst} />}
          {button && <div className={styles.textCtaWrap}>{button}</div>}
        </div>
      )}
    </div>
  )
}
