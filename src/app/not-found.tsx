import Header from '@/components/layout/Header'
import { Link } from 'next-view-transitions'
import { CartProvider } from '@/context/CartContext'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <CartProvider>
      <div data-site>
        <Header />
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
