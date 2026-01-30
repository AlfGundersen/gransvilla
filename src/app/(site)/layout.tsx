import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import ScrollToTop from '@/components/layout/ScrollToTop'
import { CartProvider } from '@/context/CartContext'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { sanityFetch } from '@/lib/sanity/live'
import { siteSettingsQuery } from '@/lib/sanity/queries'
import { resolveMenu } from '@/lib/sanity/resolveMenu'
import type { SiteSettings } from '@/types/sanity'
import styles from './layout.module.css'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = await sanityFetch({ query: siteSettingsQuery }).catch(() => ({ data: null }))

  const mainMenu = resolveMenu(settings?.mainMenu)
  const footerMenu = settings?.footerMenu?.length
    ? resolveMenu(settings.footerMenu)
    : mainMenu
  const socialLinks = settings?.socialLinks ?? []

  return (
    <CartProvider>
      <div className={styles.wrapper} data-site>
        <ScrollToTop />
        <a href="#main-content" className="visually-hidden">
          Hopp til innhold
        </a>
        <Header navigation={mainMenu} socialLinks={socialLinks} />
        <main id="main-content" className={styles.main}>{children}</main>
        <Footer
          navigation={footerMenu}
          socialLinks={socialLinks}
          contactInfo={settings?.contactInfo}
        />
      </div>
      <CartDrawer />
    </CartProvider>
  )
}
