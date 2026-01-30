import { createDataAttribute } from 'next-sanity'
import type { EventPageSection } from '@/types/sanity'
import { TextSection } from './TextSection'
import { ImageSection } from './ImageSection'
import { ImageTextSection } from './ImageTextSection'
import { GallerySection } from './GallerySection'

interface PageSectionRendererProps {
  sections: EventPageSection[]
  documentId?: string
  documentType?: string
}

export function PageSectionRenderer({ sections, documentId, documentType }: PageSectionRendererProps) {
  return (
    <>
      {sections.map((section) => {
        const dataSanity = documentId && documentType
          ? createDataAttribute({
              id: documentId,
              type: documentType,
              path: `sections[_key=="${section._key}"]`,
            }).toString()
          : undefined

        switch (section._type) {
          case 'tekstSeksjon':
            return <TextSection key={section._key} data={section} dataSanity={dataSanity} />
          case 'bildeSeksjon':
            return <ImageSection key={section._key} data={section} dataSanity={dataSanity} />
          case 'bildeTekstSeksjon':
            return <ImageTextSection key={section._key} data={section} dataSanity={dataSanity} />
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
