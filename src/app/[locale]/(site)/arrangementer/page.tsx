import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@/components/RichText'
import { MaybeWatermark } from '@/components/Watermark'
import { localeHref } from '@/lib/i18n/href'
import { alternatesFor } from '@/lib/i18n/metadata'
import { getTranslator, translateContent } from '@/lib/i18n/server'
import { getBlurDataURL } from '@/lib/sanity/blur'
import { urlFor } from '@/lib/sanity/image'
import { sanityFetch } from '@/lib/sanity/live'
import { arrangementerSettingsQuery, eventsQuery } from '@/lib/sanity/queries'
import type { ArrangementerSettings, Event } from '@/types/sanity'
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
    title: t('Arrangementer'),
    description: t('Se kommende arrangementer hos Gransvilla'),
    alternates: alternatesFor('/arrangementer', locale),
  }
}

export default async function ArrangementerPage({ params }: Params) {
  const { locale } = await params
  const t = getTranslator(locale)

  const [{ data: rawEvents }, { data: rawSettings }] = await Promise.all([
    sanityFetch({ query: eventsQuery }) as Promise<{ data: Event[] }>,
    sanityFetch({ query: arrangementerSettingsQuery }) as Promise<{
      data: ArrangementerSettings | null
    }>,
  ])
  const events = await translateContent(rawEvents, locale)
  const settings = await translateContent(rawSettings, locale)

  const heroLayout = settings?.heroLayout ?? '1-1-2'
  const heroImage = settings?.heroBilde ?? events[0]?.featuredImage
  const isWideImage = heroLayout === '1-3'

  const [heroBlur, ...cardBlurs] = await Promise.all([
    heroImage?.asset ? getBlurDataURL(heroImage) : undefined,
    ...events.map((e) => (e.featuredImage?.asset ? getBlurDataURL(e.featuredImage) : undefined)),
  ])

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {isWideImage ? (
          <div className={styles.heroTextCol}>
            <h1 className={styles.heading}>{t('Arrangementer')}</h1>
            {settings?.beskrivelse ? (
              <div className={styles.introInline}>
                <RichText value={settings.beskrivelse} />
              </div>
            ) : (
              <p className={styles.introInline}>
                {t(
                  'Gransvilla er rammen for uforglemmelige opplevelser. Enten det er bryllup, selskap, konserter eller søndagsfrokost — vi skaper arrangementer med sjel, god mat og vakre omgivelser.',
                )}
              </p>
            )}
          </div>
        ) : (
          <>
            <h1 className={styles.heading}>{t('Arrangementer')}</h1>
            {settings?.beskrivelse ? (
              <div className={styles.intro}>
                <RichText value={settings.beskrivelse} />
              </div>
            ) : (
              <p className={styles.intro}>
                {t(
                  'Gransvilla er rammen for uforglemmelige opplevelser. Enten det er bryllup, selskap, konserter eller søndagsfrokost — vi skaper arrangementer med sjel, god mat og vakre omgivelser.',
                )}
              </p>
            )}
          </>
        )}
        {heroImage?.asset && (
          <div
            className={isWideImage ? styles.heroImageWide : styles.heroImage}
            style={{ position: 'relative' }}
          >
            <Image
              src={urlFor(heroImage).width(1600).height(686).quality(92).fit('crop').url()}
              alt={heroImage.alt || heroImage.assetAltText || 'Arrangementer'}
              width={1600}
              height={686}
              priority
              placeholder={heroBlur ? 'blur' : 'empty'}
              blurDataURL={heroBlur}
              className={styles.heroImg}
            />
            <MaybeWatermark image={heroImage} />
          </div>
        )}

        {events.length > 0 ? (
          <div className={styles.cardsWrapper}>
            {events.map((event, i) => (
              <div key={event._id} className={styles.card}>
                {event.featuredImage?.asset && (
                  <div className={styles.imageWrapper} style={{ position: 'relative' }}>
                    <Image
                      src={urlFor(event.featuredImage)
                        .width(400)
                        .height(600)
                        .quality(92)
                        .fit('crop')
                        .url()}
                      alt={
                        event.featuredImage.alt || event.featuredImage.assetAltText || event.title
                      }
                      width={400}
                      height={600}
                      placeholder={cardBlurs[i] ? 'blur' : 'empty'}
                      blurDataURL={cardBlurs[i]}
                      className={styles.image}
                    />
                    <MaybeWatermark image={event.featuredImage} />
                  </div>
                )}
                <div className={styles.textCol}>
                  <h2 className={styles.title}>{event.title}</h2>
                  {event.description && (
                    <div className={styles.description}>
                      <RichText value={event.description} />
                    </div>
                  )}
                  <Link
                    href={localeHref(`/${event.slug.current}`, locale)}
                    className={`${styles.cta} site-button`}
                  >
                    {t('Les mer')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>{t('Ingen arrangementer for øyeblikket.')}</p>
        )}
      </div>
    </div>
  )
}
