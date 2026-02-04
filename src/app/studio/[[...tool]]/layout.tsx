export const metadata = {
  title: 'Gransvilla Studio',
  description: 'Content management for Gransvilla',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ margin: 0, height: '100vh' }}>{children}</div>
}
