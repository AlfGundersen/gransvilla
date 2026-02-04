import { createDataAttribute } from 'next-sanity'
import { getBlurDataURL } from '@/lib/sanity/blur'
import type { EventPageSection } from '@/types/sanity'
import { GallerySection } from './GallerySection'
import { ImageSection } from './ImageSection'
import { ImageTextSection } from './ImageTextSection'
import { TextSection } from './TextSection'

interface PageSectionRendererProps {
  sections: EventPageSection[]
  documentId?: string
  documentType?: string
}

export async function PageSectionRenderer({
  sections,
  documentId,
  documentType,
}: PageSectionRendererProps) {
  const blurMap = new Map<string, string | undefined>()

  const imageSections = sections.filter(
    (s) =>
      (s._type === 'bildeSeksjon' && s.bilde?.asset) ||
      (s._type === 'bildeTekstSeksjon' && s.bilde?.asset),
  )

  const blurResults = await Promise.all(
    imageSections.map((s) => {
      const bilde = 'bilde' in s ? s.bilde : undefined
      return bilde?.asset ? getBlurDataURL(bilde) : undefined
    }),
  )

  imageSections.forEach((s, i) => {
    blurMap.set(s._key, blurResults[i])
  })

  return (
    <>
      {sections.map((section, index) => {
        const dataSanity =
          documentId && documentType
            ? createDataAttribute({
                id: documentId,
                type: documentType,
                path: `sections[_key=="${section._key}"]`,
              }).toString()
            : undefined

        const isFirst = index === 0

        switch (section._type) {
          case 'tekstSeksjon':
            return <TextSection key={section._key} data={section} dataSanity={dataSanity} />
          case 'bildeSeksjon':
            return (
              <ImageSection
                key={section._key}
                data={section}
                dataSanity={dataSanity}
                eager={isFirst}
                blurDataURL={blurMap.get(section._key)}
              />
            )
          case 'bildeTekstSeksjon':
            return (
              <ImageTextSection
                key={section._key}
                data={section}
                dataSanity={dataSanity}
                eager={isFirst}
                blurDataURL={blurMap.get(section._key)}
              />
            )
          case 'bildegalleriSeksjon':
            return <GallerySection key={section._key} data={section} dataSanity={dataSanity} />
          default:
            console.warn('Unknown page section type:', (section as { _type: string })._type)
            return null
        }
      })}
    </>
  )
}
