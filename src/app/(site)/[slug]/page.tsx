import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { EventProductsSection } from '@/components/sections/EventProductsSection'
import { PageSectionRenderer } from '@/components/sections/page/PageSectionRenderer'
import { SchemaGenerator } from '@/components/seo/SchemaGenerator'
import { MaybeWatermark } from '@/components/Watermark'
import { getBlurDataURL } from '@/lib/sanity/blur'
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import { sanityFetch } from '@/lib/sanity/live'
import { eventQuery, eventsQuery, pageQuery } from '@/lib/sanity/queries'
import styles from './page.module.css'

export const dynamicParams = true

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const [events, pages] = await Promise.all([
    client.fetch(eventsQuery),
    client.fetch<{ slug: { current: string } }[]>(`*[_type == "page"]{ slug }`),
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
  const ogImage = seo?.ogImage?.asset
    ? urlFor(seo.ogImage).width(1200).height(630).url()
    : content.featuredImage?.asset
      ? urlFor(content.featuredImage).width(1200).height(630).url()
      : undefined
  return {
    title: seo?.metaTitle || content.title,
    description: seo?.metaDescription || undefined,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title: seo?.metaTitle || content.title,
      description: seo?.metaDescription || undefined,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
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

  const hasEventProducts =
    content._type === 'event' && content.products && content.products.length > 0
  const sections = content.sections ?? []

  // Only split the grid into two when an EventProductsSection needs to be
  // injected after the first section. Otherwise, keep a single grid so the
  // existing section-divider borders work as before.
  const titleBlock = <h1 className={styles.eventTitle}>{content.title}</h1>

  const featuredBlock = content.featuredImage?.asset && (
    <div className={styles.featuredImage}>
      <div style={{ position: 'relative' }}>
        <Image
          src={urlFor(content.featuredImage).width(1600).quality(92).url()}
          alt={content.featuredImage.alt || content.featuredImage.assetAltText || content.title}
          width={1200}
          height={675}
          className={styles.featuredImageImg}
          priority
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
        />
        <MaybeWatermark image={content.featuredImage} />
      </div>
    </div>
  )

  return (
    <div className={styles.eventPage}>
      <SchemaGenerator seo={content.seo} document={content} />
      {hasEventProducts ? (
        <>
          <div className={styles.eventGrid}>
            {titleBlock}
            {featuredBlock}
            {sections[0] && (
              <PageSectionRenderer
                sections={[sections[0]]}
                documentId={content._id}
                documentType={content._type}
              />
            )}
          </div>
          <EventProductsSection products={content.products as string[]} />
          {sections.length > 1 && (
            <div className={styles.eventGrid}>
              <PageSectionRenderer
                sections={sections.slice(1)}
                documentId={content._id}
                documentType={content._type}
              />
            </div>
          )}
        </>
      ) : (
        <div className={styles.eventGrid}>
          {titleBlock}
          {featuredBlock}
          {sections.length > 0 && (
            <PageSectionRenderer
              sections={sections}
              documentId={content._id}
              documentType={content._type}
            />
          )}
        </div>
      )}
    </div>
  )
}
