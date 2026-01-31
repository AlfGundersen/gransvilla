import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { sanityFetch } from '@/lib/sanity/live'
import { urlFor } from '@/lib/sanity/image'
import { getBlurDataURL } from '@/lib/sanity/blur'
import { eventQuery, eventsQuery, pageQuery } from '@/lib/sanity/queries'
import { PageSectionRenderer } from '@/components/sections/page/PageSectionRenderer'
import type { Event, Page } from '@/types/sanity'
import styles from './page.module.css'

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
  const [{ data: event }, { data: page }] = await Promise.all([
    sanityFetch({ query: eventQuery, params: { slug } }),
    sanityFetch({ query: pageQuery, params: { slug } }),
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
    description: seo?.metaDescription || undefined,
  }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const content = await fetchContent(slug)

  if (!content) {
    notFound()
  }

  const blurDataURL = content.featuredImage?.asset
    ? await getBlurDataURL(content.featuredImage)
    : undefined

  return (
    <div className={styles.eventPage}>
      <div className={styles.eventGrid}>
        <h1 className={styles.eventTitle}>{content.title}</h1>
        {content.featuredImage?.asset && (
          <div className={styles.featuredImage}>
            <Image
              src={urlFor(content.featuredImage).width(2400).quality(100).url()}
              alt={content.featuredImage.alt || content.featuredImage.assetAltText || content.title}
              width={1200}
              height={675}
              className={styles.featuredImageImg}
              priority
              placeholder={blurDataURL ? 'blur' : 'empty'}
              blurDataURL={blurDataURL}
            />
          </div>
        )}
        {content.sections && content.sections.length > 0 && (
          <PageSectionRenderer
            sections={content.sections}
            documentId={content._id}
            documentType={content._type}
          />
        )}
      </div>
    </div>
  )
}
