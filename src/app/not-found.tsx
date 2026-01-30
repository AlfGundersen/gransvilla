import Header from '@/components/layout/Header'
import { Link } from 'next-view-transitions'
import { CartProvider } from '@/context/CartContext'
import { client } from '@/lib/sanity/client'
import { siteSettingsQuery } from '@/lib/sanity/queries'
import { resolveMenu } from '@/lib/sanity/resolveMenu'
import type { SiteSettings } from '@/types/sanity'
import styles from './not-found.module.css'

export default async function NotFound() {
  const settings = await client.fetch<SiteSettings>(siteSettingsQuery)
  const mainMenu = resolveMenu(settings?.mainMenu)
  const socialLinks = settings?.socialLinks ?? []

  return (
    <CartProvider>
      <div data-site>
        <Header navigation={mainMenu} socialLinks={socialLinks} />
        <div className={styles.container}>
          <h1 className={styles.number}>404</h1>
          <p className={styles.text}>Siden du leter etter finnes ikke</p>
          <Link href="/" className={styles.link}>
            Tilbake til forsiden
          </Link>
        </div>
      </div>
    </CartProvider>
  )
}
