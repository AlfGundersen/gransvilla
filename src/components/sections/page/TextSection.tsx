import { PortableText } from '@portabletext/react'
import type { TekstSeksjon } from '@/types/sanity'
import styles from './TextSection.module.css'

interface TextSectionProps {
  data: TekstSeksjon
  dataSanity?: string
}

export function TextSection({ data, dataSanity }: TextSectionProps) {
  return (
    <div className={styles.textSection} data-sanity={dataSanity}>
      {data.overskrift && (
        <h2 className={styles.textHeading}>{data.overskrift}</h2>
      )}
      {data.tekst && (
        <div className={styles.textBody}>
          <PortableText value={data.tekst} />
        </div>
      )}
    </div>
  )
}
