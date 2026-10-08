import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Deltakerlister | Gransvilla',
  robots: { index: false, follow: false },
}

/**
 * Staff only, so like the Studio it sits outside the `[locale]` segment: its
 * own root layout, always Norwegian, never translated, and without the site's
 * header and footer.
 */
export default function DeltakereLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  )
}
