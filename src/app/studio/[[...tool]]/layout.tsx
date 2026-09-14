import '@/styles/globals.css'

export const metadata = {
  title: 'Gransvilla Studio',
  description: 'Content management for Gransvilla',
}

/**
 * Studio sits outside the `[locale]` segment, so with no top-level layout it is
 * its own root layout and has to render <html>/<body> itself. Admin-only, so it
 * is always English and never translated.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ margin: 0, height: '100vh' }}>{children}</div>
      </body>
    </html>
  )
}
