import { PortableText } from '@portabletext/react'
import type { TekstSeksjon } from '@/types/sanity'
import styles from './TextSection.module.css'

interface TextSectionProps {
  data: TekstSeksjon
}

export function TextSection({ data }: TextSectionProps) {
  return (
    <div className={styles.textSection}>
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
