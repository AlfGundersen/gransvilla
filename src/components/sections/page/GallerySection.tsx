import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity/image'
import type { BildegalleriSeksjon } from '@/types/sanity'
import { GalleryClient } from './GalleryClient'
import styles from './GallerySection.module.css'

const RATIO_MAP: Record<string, number> = {
  '16/9': 9 / 16,
  '3/2': 2 / 3,
  '4/3': 3 / 4,
  '1/1': 1,
  '3/4': 4 / 3,
  '2/3': 3 / 2,
}

interface GallerySectionProps {
  data: BildegalleriSeksjon
  dataSanity?: string
}

export function GallerySection({ data, dataSanity }: GallerySectionProps) {
  const ratio = data.bildeforhold || '3/4'
  const ratioMultiplier = RATIO_MAP[ratio] || 2 / 3
  const thumbWidth = 1400
  const thumbHeight = Math.round(thumbWidth * ratioMultiplier)

  const images = (data.bilder || []).map((bilde) => ({
    src: urlFor(bilde).width(thumbWidth).height(thumbHeight).quality(100).fit('crop').url(),
    fullSrcBase: urlFor(bilde).quality(100).fit('crop').url(),
    alt: bilde.alt || bilde.assetAltText || '',
    width: thumbWidth,
    height: thumbHeight,
    ratio: ratioMultiplier,
  }))

  return (
    <div className={styles.gallerySection} data-fullwidth data-sanity={dataSanity}>
      {data.visInnhold && (data.overskrift || data.tekst) && (
        <div className={styles.galleryContent}>
          {data.overskrift && (
            <h2 className={styles.galleryHeading}>{data.overskrift}</h2>
          )}
          {data.tekst && (
            <div className={styles.galleryBody}>
              <PortableText value={data.tekst} />
            </div>
          )}
        </div>
      )}
      {images.length > 0 && (
        <GalleryClient
          images={images}
          columns={data.antallKolonner || 2}
          hasContent={!!(data.visInnhold && (data.overskrift || data.tekst))}
        />
      )}
    </div>
  )
}
