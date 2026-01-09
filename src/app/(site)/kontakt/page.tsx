import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Ta kontakt med Gransvilla for booking og henvendelser',
}

export default function KontaktPage() {
  return (
    <div className="container" style={{ paddingBlock: 'var(--space-xl)' }}>
      <h1>Kontakt</h1>
      <p>Contact form and info from Sanity will appear here</p>
    </div>
  )
}
