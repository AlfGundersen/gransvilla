import { PortableText } from '@portabletext/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/image'
import { getBlurDataURL } from '@/lib/sanity/blur'
import { sanityFetch } from '@/lib/sanity/live'
import { arrangementerSettingsQuery, eventsQuery } from '@/lib/sanity/queries'
import type { ArrangementerSettings, Event } from '@/types/sanity'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Arrangementer',
  description: 'Se kommende arrangementer hos Gransvilla',
}

export default async function ArrangementerPage() {
  const [{ data: events }, { data: settings }] = await Promise.all([
    sanityFetch({ query: eventsQuery }) as Promise<{ data: Event[] }>,
    sanityFetch({ query: arrangementerSettingsQuery }) as Promise<{ data: ArrangementerSettings | null }>,
  ])

  const heroLayout = settings?.heroLayout ?? '1-1-2'
  const heroImage = settings?.heroBilde ?? events[0]?.featuredImage
  const isWideImage = heroLayout === '1-3'

  const [heroBlur, ...cardBlurs] = await Promise.all([
    heroImage?.asset ? getBlurDataURL(heroImage) : undefined,
    ...events.map((e) => e.featuredImage?.asset ? getBlurDataURL(e.featuredImage) : undefined),
  ])

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {isWideImage ? (
          <div className={styles.heroTextCol}>
            <h1 className={styles.heading}>Arrangementer</h1>
            {settings?.beskrivelse ? (
              <div className={styles.introInline}>
                <PortableText value={settings.beskrivelse} />
              </div>
            ) : (
              <p className={styles.introInline}>
                Gransvilla er rammen for uforglemmelige opplevelser. Enten det er bryllup, selskap, konserter eller søndagsfrokost — vi skaper arrangementer med sjel, god mat og vakre omgivelser.
              </p>
            )}
          </div>
        ) : (
          <>
            <h1 className={styles.heading}>Arrangementer</h1>
            {settings?.beskrivelse ? (
              <div className={styles.intro}>
                <PortableText value={settings.beskrivelse} />
              </div>
            ) : (
              <p className={styles.intro}>
                Gransvilla er rammen for uforglemmelige opplevelser. Enten det er bryllup, selskap, konserter eller søndagsfrokost — vi skaper arrangementer med sjel, god mat og vakre omgivelser.
              </p>
            )}
          </>
        )}
        {heroImage?.asset && (
          <div className={isWideImage ? styles.heroImageWide : styles.heroImage}>
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
          </div>
        )}

        {events.length > 0 ? (
          events.map((event, i) => (
            <div key={event._id} className={styles.card}>
              {event.featuredImage?.asset && (
                <Link href={`/${event.slug.current}`} className={styles.imageLink}>
                  <Image
                    src={urlFor(event.featuredImage).width(800).height(600).quality(92).fit('crop').url()}
                    alt={event.featuredImage.alt || event.featuredImage.assetAltText || event.title}
                    width={800}
                    height={600}
                    placeholder={cardBlurs[i] ? 'blur' : 'empty'}
                    blurDataURL={cardBlurs[i]}
                    className={styles.image}
                  />
                </Link>
              )}
              <div className={styles.textCol}>
                <h2 className={styles.title}>{event.title}</h2>
                {event.description && (
                  <div className={styles.description}>
                    <PortableText value={event.description} />
                  </div>
                )}
                <Link href={`/${event.slug.current}`} className={styles.cta}>
                  Les mer
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p>Ingen arrangementer for øyeblikket.</p>
        )}
      </div>
    </div>
  )
}
