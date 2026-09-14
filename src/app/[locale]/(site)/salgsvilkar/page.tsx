import type { Metadata } from 'next'
import { RichText } from '@/components/RichText'
import { alternatesFor } from '@/lib/i18n/metadata'
import { getTranslator, translateContent } from '@/lib/i18n/server'
import { sanityFetch } from '@/lib/sanity/live'
import { salgsvilkarQuery } from '@/lib/sanity/queries'
import type { Salgsvilkar } from '@/types/sanity'
import styles from '../personvern/page.module.css'

/**
 * Published Sanity content should not wait for the next deploy. Only the shop
 * pages revalidated, so an edit made after a build stayed invisible until
 * something else triggered one.
 */
export const revalidate = 60

type Params = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const t = getTranslator(locale)

  return {
    title: t('Salgsvilkår'),
    description: t('Salgsvilkår for Grans Villa'),
    alternates: alternatesFor('/salgsvilkar', locale),
  }
}

export default async function SalgsvilkarPage({ params }: Params) {
  const { locale } = await params
  const t = getTranslator(locale)

  const { data: raw } = (await sanityFetch({ query: salgsvilkarQuery })) as {
    data: Salgsvilkar | null
  }
  const data = await translateContent(raw, locale)

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>{t('Salgsvilkår')}</h1>

      {data?.innhold ? (
        <div className={styles.content}>
          <RichText value={data.innhold} />
        </div>
      ) : (
        <p className={styles.content}>{t('Ingen salgsvilkår er lagt til ennå.')}</p>
      )}
    </div>
  )
}
