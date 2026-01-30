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
        const sectionAttr = documentId && documentType
          ? createDataAttribute({
              id: documentId,
              type: documentType,
              path: `sections[_key=="${section._key}"]`,
            }).toString()
          : undefined

        const content = (() => {
          switch (section._type) {
            case 'tekstSeksjon':
              return <TextSection key={section._key} data={section} />
            case 'bildeSeksjon':
              return <ImageSection key={section._key} data={section} />
            case 'bildeTekstSeksjon':
              return <ImageTextSection key={section._key} data={section} />
            case 'bildegalleriSeksjon':
              return <GallerySection key={section._key} data={section} />
            default:
              console.warn('Unknown page section type:', (section as { _type: string })._type)
              return null
          }
        })()

        if (!content) return null

        return sectionAttr ? (
          <div key={section._key} data-sanity={sectionAttr}>
            {content}
          </div>
        ) : (
          content
        )
      })}
    </>
  )
}
