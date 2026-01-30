import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import { eventQuery, eventsQuery, pageQuery } from '@/lib/sanity/queries'
import { PageSectionRenderer } from '@/components/sections/page/PageSectionRenderer'
import type { Event, Page } from '@/types/sanity'
import styles from './page.module.css'

export const revalidate = 60
export const dynamicParams = true

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const [events, pages] = await Promise.all([
    client.fetch(eventsQuery),
    client.fetch<{ slug: { current: string } }[]>(
      `*[_type == "page"]{ slug }`
    ),
  ])
  return [
    ...events.map((event: { slug: { current: string } }) => ({
      slug: event.slug.current,
    })),
    ...pages.map((page) => ({
      slug: page.slug.current,
    })),
  ]
}

async function fetchContent(slug: string) {
  const [event, page] = await Promise.all([
    client.fetch<Event | null>(eventQuery, { slug }),
    client.fetch<Page | null>(pageQuery, { slug }),
  ])
  return event || page
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const content = await fetchContent(slug)

  if (!content) {
    return { title: 'Side ikke funnet' }
  }

  const seo = 'seo' in content ? content.seo : undefined
  return {
    title: seo?.metaTitle || content.title,
    description: seo?.metaDescription || ('description' in content ? content.description : undefined),
  }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const content = await fetchContent(slug)

  if (!content) {
    notFound()
  }

  const isEvent = 'featuredImage' in content

  return (
    <div className={styles.eventPage}>
      <div className={styles.eventGrid}>
        <h1 className={styles.eventTitle}>{content.title}</h1>
        {isEvent && (content as Event).featuredImage?.asset && (
          <div className={styles.featuredImage}>
            <Image
              src={urlFor((content as Event).featuredImage!).width(1200).quality(80).url()}
              alt={(content as Event).featuredImage!.alt || (content as Event).featuredImage!.assetAltText || content.title}
              width={1200}
              height={675}
              className={styles.featuredImageImg}
              priority
            />
          </div>
        )}
        {content.sections && content.sections.length > 0 && (
          <PageSectionRenderer sections={content.sections} />
        )}
      </div>
    </div>
  )
}
