import { PortableText } from '@portabletext/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/image'
import { sanityFetch } from '@/lib/sanity/live'
import { eventsQuery } from '@/lib/sanity/queries'
import type { Event } from '@/types/sanity'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Arrangementer',
  description: 'Se kommende arrangementer hos Gransvilla',
}

export default async function ArrangementerPage() {
  const { data: events } = await sanityFetch({ query: eventsQuery }) as { data: Event[] }

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <h1 className={styles.heading}>Arrangementer</h1>

        {events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className={styles.row}>
              {event.featuredImage?.asset && (
                <div className={styles.imageCol}>
                  <Link href={`/${event.slug.current}`} className={styles.imageLink}>
                    <Image
                      src={urlFor(event.featuredImage).width(1200).height(900).quality(80).fit('crop').url()}
                      alt={event.featuredImage.alt || event.featuredImage.assetAltText || event.title}
                      width={1200}
                      height={900}
                      className={styles.image}
                    />
                  </Link>
                </div>
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
