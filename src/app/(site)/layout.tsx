import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import ScrollToTop from '@/components/layout/ScrollToTop'
import { CartProvider } from '@/context/CartContext'
import { CartDrawer } from '@/components/cart/CartDrawer'
import styles from './layout.module.css'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className={styles.wrapper} data-site>
        <ScrollToTop />
        <Header />
        <main className={styles.main}>{children}</main>
        <Footer />
      </div>
      <CartDrawer />
    </CartProvider>
  )
}
