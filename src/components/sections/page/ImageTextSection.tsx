import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity/image'
import type { BildeTekstSeksjon } from '@/types/sanity'
import styles from './ImageTextSection.module.css'

const RATIO_MAP: Record<string, number> = {
  '16/9': 9 / 16,
  '3/2': 2 / 3,
  '4/3': 3 / 4,
  '1/1': 1,
}

interface ImageTextSectionProps {
  data: BildeTekstSeksjon
  dataSanity?: string
  eager?: boolean
  blurDataURL?: string
}

export function ImageTextSection({ data, dataSanity, eager = false, blurDataURL }: ImageTextSectionProps) {
  const bildeForst = data.bildeForst !== false
  const ratio = data.bildeforhold || '3/2'
  const width = 1400
  const height = Math.round(width * (RATIO_MAP[ratio] || 2 / 3))

  return (
    <div className={`${styles.imageTextSection} ${bildeForst ? '' : styles.imageTextReversed}`} data-sanity={dataSanity}>
      {data.bilde && (
        <div className={styles.imageTextImageWrap} data-sanity={dataSanity}>
          <Image
            src={urlFor(data.bilde).width(width).height(height).quality(92).fit('crop').url()}
            alt={data.bilde.alt || data.bilde.assetAltText || ''}
            width={width}
            height={height}
            loading={eager ? 'eager' : 'lazy'}
            placeholder={blurDataURL ? 'blur' : 'empty'}
            blurDataURL={blurDataURL}
            className={styles.imageTextImage}
            data-sanity={dataSanity}
          />
        </div>
      )}
      <div className={styles.imageTextContent} data-sanity={dataSanity}>
        {data.visOverskrift && data.overskrift && (
          <h2 className={styles.imageTextHeading}>{data.overskrift}</h2>
        )}
        {data.tekst && (
          <div className={styles.imageTextBody}>
            <PortableText value={data.tekst} />
          </div>
        )}
      </div>
    </div>
  )
}
