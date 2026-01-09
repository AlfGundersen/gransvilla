import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Praktisk info',
  description: 'Praktisk informasjon for ansatte',
}

export default function PraktiskInfoPage() {
  return (
    <div className="container" style={{ paddingBlock: 'var(--space-xl)' }}>
      <h1>Praktisk info</h1>
      <p>Staff information from Sanity will appear here</p>
    </div>
  )
}
