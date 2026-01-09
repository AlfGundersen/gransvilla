import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Om oss',
  description: 'Les om Gransvillas historie og konsept',
}

export default function OmOssPage() {
  return (
    <div className="container" style={{ paddingBlock: 'var(--space-xl)' }}>
      <h1>Om oss</h1>
      <p>Content from Sanity will appear here</p>
    </div>
  )
}
