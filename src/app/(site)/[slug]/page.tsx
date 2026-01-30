import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import { eventQuery, eventsQuery } from '@/lib/sanity/queries'
import { PageSectionRenderer } from '@/components/sections/page/PageSectionRenderer'
import type { Event } from '@/types/sanity'
import styles from './page.module.css'

export const revalidate = 60
export const dynamicParams = true

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const events = await client.fetch(eventsQuery)
  return events.map((event: { slug: { current: string } }) => ({
    slug: event.slug.current,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event: Event | null = await client.fetch(eventQuery, { slug })

  if (!event) {
    return { title: 'Side ikke funnet' }
  }

  return {
    title: event.title,
    description: event.description,
  }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const event: Event | null = await client.fetch(eventQuery, { slug })

  if (!event) {
    notFound()
  }

  return (
    <div className={styles.eventPage}>
      <div className={styles.eventGrid}>
        <h1 className={styles.eventTitle}>{event.title}</h1>
        {event.featuredImage?.asset && (
          <div className={styles.featuredImage}>
            <Image
              src={urlFor(event.featuredImage).width(1200).quality(80).url()}
              alt={event.featuredImage.alt || event.featuredImage.assetAltText || event.title}
              width={1200}
              height={675}
              className={styles.featuredImageImg}
              priority
            />
          </div>
        )}
        {event.sections && event.sections.length > 0 && (
          <PageSectionRenderer sections={event.sections} />
        )}
      </div>
    </div>
  )
}
