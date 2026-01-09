import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kantine',
  description: 'Daglig drift og tilbud i Gransvilla kantine',
}

export default function KantinePage() {
  return (
    <div className="container" style={{ paddingBlock: 'var(--space-xl)' }}>
      <h1>Kantine</h1>
      <p>Content from Sanity will appear here</p>
    </div>
  )
}
