import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { locales } from '@/lib/i18n/config'
import { localeHref } from '@/lib/i18n/href'
import { getProducts } from '@/lib/shopify'
import {
  fetchOwnerPage,
  ProductPageContent,
  productMetadata,
  productPath,
} from './ProductPageContent'

export const revalidate = 60
export const dynamicParams = true

interface Props {
  params: Promise<{ locale: string; handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params
  return productMetadata(locale, handle)
}

export async function generateStaticParams() {
  try {
    const products = await getProducts()
    // Handles are the same in both languages; only the host differs.
    return locales.flatMap((locale) =>
      products.map((product) => ({ locale, handle: product.handle })),
    )
  } catch {
    // Return empty array if store unavailable - pages will be generated on-demand
    return []
  }
}

export default async function ProductPage({ params }: Props) {
  const { locale, handle } = await params

  // A product kept out of the shop has its own address outside /butikken. The
  // links that still point here — its card, the cart — are sent on to it.
  if (await fetchOwnerPage(handle)) {
    redirect(localeHref(productPath(handle, true), locale))
  }

  return <ProductPageContent locale={locale} handle={handle} />
}
