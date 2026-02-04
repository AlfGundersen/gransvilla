import { PortableText } from '@portabletext/react'
import type { Metadata } from 'next'
import { sanityFetch } from '@/lib/sanity/live'
import { salgsvilkarQuery } from '@/lib/sanity/queries'
import type { Salgsvilkar } from '@/types/sanity'
import styles from '../personvern/page.module.css'

export const metadata: Metadata = {
  title: 'Salgsvilkår',
  description: 'Salgsvilkår for Grans Villa',
  alternates: { canonical: '/salgsvilkar' },
}

export default async function SalgsvilkarPage() {
  const { data } = (await sanityFetch({ query: salgsvilkarQuery })) as {
    data: Salgsvilkar | null
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Salgsvilkår</h1>

      {data?.innhold ? (
        <div className={styles.content}>
          <PortableText value={data.innhold} />
        </div>
      ) : (
        <p className={styles.content}>Ingen salgsvilkår er lagt til ennå.</p>
      )}
    </div>
  )
}
