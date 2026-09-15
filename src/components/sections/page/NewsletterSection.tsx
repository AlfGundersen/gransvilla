import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { RichText } from '@/components/RichText'
import { sectionAnchor } from '@/lib/anchor'
import type { NyhetsbrevSeksjon } from '@/types/sanity'
import styles from './NewsletterSection.module.css'

interface NewsletterSectionProps {
  data: NyhetsbrevSeksjon
}

/**
 * Newsletter signup placed anywhere in a page or event's section list.
 *
 * Shares the text section's two-part layout — heading left, content right —
 * and reuses the footer's form, so a page can only ever show one sign-up
 * behaviour. The _key is what keeps the input ids unique when the footer form
 * is on the same page.
 */
export function NewsletterSection({ data }: NewsletterSectionProps) {
  return (
    <div
      id={sectionAnchor(data._key, data.overskrift)}
      className={styles.newsletterSection}
      data-newsletter
    >
      {data.overskrift && (
        <div className={styles.newsletterHeadingCol}>
          <h2 className={styles.newsletterHeading}>{data.overskrift}</h2>
        </div>
      )}
      <div className={styles.newsletterBody}>
        {data.tekst && (
          <div className={styles.newsletterText}>
            <RichText value={data.tekst} />
          </div>
        )}
        <NewsletterForm idPrefix={`nyhetsbrev-${data._key}`} />
      </div>
    </div>
  )
}
