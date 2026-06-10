import { PortableText } from '@portabletext/react'
import { getWatermarkSrc } from '@/components/Watermark'
import { getBlurDataURL } from '@/lib/sanity/blur'
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

export async function GallerySection({ data, dataSanity }: GallerySectionProps) {
  const ratio = data.bildeforhold || '3/4'
  const ratioMultiplier = RATIO_MAP[ratio] || 2 / 3
  const thumbWidth = 600
  const thumbHeight = Math.round(thumbWidth * ratioMultiplier)

  // Editors can leave empty slots in the gallery array; skip them so urlFor() doesn't crash.
  const bilder = (data.bilder || []).filter((bilde) => bilde?.asset)
  const [blurResults, watermarkSrc] = await Promise.all([
    Promise.all(bilder.map((bilde) => getBlurDataURL(bilde))),
    getWatermarkSrc(),
  ])

  const images = bilder.map((bilde, i) => ({
    src: urlFor(bilde).width(thumbWidth).height(thumbHeight).quality(92).fit('crop').url(),
    fullSrcBase: urlFor(bilde).quality(92).fit('crop').url(),
    alt: bilde.alt || bilde.assetAltText || '',
    width: thumbWidth,
    height: thumbHeight,
    ratio: ratioMultiplier,
    blurDataURL: blurResults[i],
    watermark: bilde.watermark,
    watermarkPosition: bilde.watermarkPosition,
  }))

  return (
    <div className={styles.gallerySection} data-fullwidth data-sanity={dataSanity}>
      {data.visInnhold && (data.overskrift || data.tekst) && (
        <div className={styles.galleryContent}>
          {data.overskrift && <h2 className={styles.galleryHeading}>{data.overskrift}</h2>}
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
          watermarkSrc={watermarkSrc}
        />
      )}
    </div>
  )
}
