import type { EventPageSection } from '@/types/sanity'
import { TextSection } from './TextSection'
import { ImageSection } from './ImageSection'
import { ImageTextSection } from './ImageTextSection'
import { GallerySection } from './GallerySection'

interface PageSectionRendererProps {
  sections: EventPageSection[]
}

export function PageSectionRenderer({ sections }: PageSectionRendererProps) {
  return (
    <>
      {sections.map((section) => {
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
      })}
    </>
  )
}
