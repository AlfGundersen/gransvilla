import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import ScrollToTop from '@/components/layout/ScrollToTop'
import { CartProvider } from '@/context/CartContext'
import { CookieConsentProvider } from '@/context/CookieConsentContext'
import { CartDrawer } from '@/components/cart/CartDrawer'
import CookieBanner from '@/components/cookie/CookieBanner'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import { sanityFetch } from '@/lib/sanity/live'
import { siteSettingsQuery } from '@/lib/sanity/queries'
import { resolveMenu } from '@/lib/sanity/resolveMenu'
import { urlFor } from '@/lib/sanity/image'
import type { SiteSettings } from '@/types/sanity'
import styles from './layout.module.css'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = await sanityFetch({ query: siteSettingsQuery }).catch(() => ({ data: null }))

  const mainMenu = resolveMenu(settings?.mainMenu)
  const footerMenu = settings?.footerMenu?.length
    ? resolveMenu(settings.footerMenu)
    : mainMenu
  const socialLinks = settings?.socialLinks ?? []
  const faviconUrl = settings?.favicon?.asset
    ? urlFor(settings.favicon).width(100).height(100).url()
    : undefined

  return (
    <CookieConsentProvider>
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
            siteDescription={settings?.siteDescription}
            faviconUrl={faviconUrl}
          />
        </div>
        <CartDrawer />
        <CookieBanner />
        <GoogleAnalytics />
      </CartProvider>
    </CookieConsentProvider>
  )
}
