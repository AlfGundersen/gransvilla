import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Arrangementer',
  description: 'Se kommende arrangementer hos Gransvilla',
}

export default function ArrangementerPage() {
  return (
    <div className="container" style={{ paddingBlock: 'var(--space-xl)' }}>
      <h1>Arrangementer</h1>
      <p>Events from Sanity will appear here</p>
    </div>
  )
}
