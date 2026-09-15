import Link from 'next/link'
import styles from './BackLink.module.css'

interface BackLinkProps {
  href: string
  label: string
  /** Lets the page own the spacing between the link and whatever follows it. */
  className?: string
}

/**
 * Back-navigation link shown above a detail page's title.
 *
 * Detail pages are reached from a listing — an event from /arrangementer, a
 * product from /butikken — and the header menu has no way back to the listing,
 * so without this the only route back is the browser's own button.
 */
export function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link href={href} className={className ? `${styles.backLink} ${className}` : styles.backLink}>
      <svg
        className={styles.arrow}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M11 18l-6-6 6-6" />
        <line x1="5" y1="12" x2="20" y2="12" />
      </svg>
      <span>{label}</span>
    </Link>
  )
}
