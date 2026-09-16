import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@/components/RichText'
import { SharedImage } from '@/components/SharedImage'
import { MaybeWatermark } from '@/components/Watermark'
import { localeHref } from '@/lib/i18n/href'
import { getTranslator } from '@/lib/i18n/server'
import { urlFor } from '@/lib/sanity/image'
import type { FeaturedSection } from '@/types/sanity'
import styles from './FeaturedSection.module.css'

interface FeaturedSectionComponentProps {
  data: FeaturedSection
  /** Server components cannot read the I18nProvider, so the caller passes it. */
  locale: string
}

export function FeaturedSectionComponent({ data, locale }: FeaturedSectionComponentProps) {
  const t = getTranslator(locale)
  const columns = data.columns ?? []

  /*
   * A view-transition-name has to be unique among mounted elements, and these
   * columns are editor-built — nothing stops two of them pointing at the same
   * page. Claim each slug once; a second column linking to the same place
   * still renders, it just doesn't take part in the morph.
   */
  const claimedSlugs = new Set<string>()

  if (columns.length === 0) {
    return null
  }

  return (
    <section className={styles.featuredSection}>
      <div className={styles.featuredContainer}>
        <div className={styles.featuredGrid}>
          {columns.map((column) => (
            <div key={column._key} className={styles.featuredColumn}>
              <div className={styles.featuredContent}>
                {column.heading && <h2 className={styles.featuredHeading}>{column.heading}</h2>}
                {column.description && (
                  <div className={styles.featuredDescription}>
                    {Array.isArray(column.description) ? (
                      <RichText value={column.description} />
                    ) : (
                      <p>{column.description}</p>
                    )}
                  </div>
                )}
                {column.link?.slug?.current && (
                  <Link
                    href={localeHref(`/${column.link.slug.current}`, locale)}
                    className={`${styles.featuredCta} site-button`}
                    aria-label={
                      column.heading ? `${t('Vis mer om')} ${column.heading}` : t('Vis mer')
                    }
                  >
                    {t('Vis mer')}
                  </Link>
                )}
              </div>
              {/* Use column image, or fallback to linked page's featured image */}
              {(() => {
                const displayImage = column.image?.asset ? column.image : column.link?.featuredImage
                if (!displayImage?.asset) return null

                const slug = column.link?.slug?.current
                const canShare = Boolean(slug) && !claimedSlugs.has(slug as string)
                if (canShare) claimedSlugs.add(slug as string)

                const image = (
                  <Image
                    src={urlFor(displayImage).width(700).height(1050).quality(92).fit('crop').url()}
                    alt={displayImage.alt || displayImage.assetAltText || column.heading || ''}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                )

                return (
                  <div className={styles.featuredImageWrap}>
                    {canShare ? (
                      <SharedImage name={`page-image-${slug}`}>{image}</SharedImage>
                    ) : (
                      image
                    )}
                    <MaybeWatermark image={displayImage} />
                  </div>
                )
              })()}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
