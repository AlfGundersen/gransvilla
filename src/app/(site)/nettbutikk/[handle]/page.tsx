import { getProductByHandle, getProducts } from '@/lib/shopify'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductGallery } from './ProductGallery'
import { ProductInfo } from './ProductInfo'
import styles from './page.module.css'

export const revalidate = 60
export const dynamicParams = true

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)

  if (!product) {
    return { title: 'Produkt ikke funnet' }
  }

  return {
    title: product.title,
    description: product.description,
  }
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    handle: product.handle,
  }))
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  const product = await getProductByHandle(handle)

  if (!product) {
    notFound()
  }

  return (
    <div className={styles.productPage}>
      <div className={styles.productContainer}>
        <ProductGallery images={product.images} title={product.title} />
        <ProductInfo product={product} />
      </div>
    </div>
  )
}
