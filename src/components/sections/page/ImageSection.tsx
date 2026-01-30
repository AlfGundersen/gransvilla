import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import type { BildeSeksjon } from '@/types/sanity'
import styles from './ImageSection.module.css'

const RATIO_MAP: Record<string, number> = {
  '16/9': 9 / 16,
  '3/2': 2 / 3,
  '4/3': 3 / 4,
  '1/1': 1,
}

interface ImageSectionProps {
  data: BildeSeksjon
}

export function ImageSection({ data }: ImageSectionProps) {
  if (!data.bilde) return null

  const ratio = data.bildeforhold || '3/2'
  const width = 1400
  const height = Math.round(width * (RATIO_MAP[ratio] || 2 / 3))

  return (
    <div className={`${styles.imageSection} ${data.fullBredde ? styles.imageSectionFull : ''}`} {...(data.fullBredde ? { 'data-fullwidth': '' } : {})}>
      <Image
        src={urlFor(data.bilde).width(width).height(height).fit('crop').url()}
        alt={data.bilde.alt || data.bilde.assetAltText || ''}
        width={width}
        height={height}
        className={styles.imageSectionImage}
      />
    </div>
  )
}
