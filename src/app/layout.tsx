import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ViewTransitions } from 'next-view-transitions'
import { VisualEditing } from 'next-sanity/visual-editing'
import { draftMode } from 'next/headers'
import { SanityLive } from '@/lib/sanity/live'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Gransvilla',
    template: '%s | Gransvilla',
  },
  description: 'Gransvilla - Restaurant, kantine og arrangementer',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <ViewTransitions>
      <html lang="no" className={inter.variable}>
        <head>
          <link rel="stylesheet" href="https://use.typekit.net/ipo0piy.css" />
        </head>
        <body suppressHydrationWarning>
          {children}
          <SanityLive />
          {isDraftMode && <VisualEditing />}
        </body>
      </html>
    </ViewTransitions>
  )
}
