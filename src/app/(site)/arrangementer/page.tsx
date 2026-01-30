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
    <div className={styles.arrangementerPage}>
      <h1 className={styles.heading}>Arrangementer</h1>
      {events.length > 0 ? (
        <div className={styles.grid}>
          {events.map((event) => (
            <Link
              key={event._id}
              href={`/${event.slug.current}`}
              className={styles.card}
            >
              {event.featuredImage?.asset && (
                <div className={styles.imageWrap}>
                  <Image
                    src={urlFor(event.featuredImage).width(800).height(600).quality(80).fit('crop').url()}
                    alt={event.featuredImage.alt || event.featuredImage.assetAltText || event.title}
                    width={800}
                    height={600}
                    className={styles.image}
                  />
                </div>
              )}
              <h2 className={styles.cardTitle}>{event.title}</h2>
            </Link>
          ))}
        </div>
      ) : (
        <p>Ingen arrangementer for øyeblikket.</p>
      )}
    </div>
  )
}
