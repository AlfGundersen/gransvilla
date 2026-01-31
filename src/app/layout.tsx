import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { VisualEditing } from 'next-sanity/visual-editing'
import { draftMode } from 'next/headers'
import { SanityLive } from '@/lib/sanity/live'
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import { groq } from 'next-sanity'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await client.fetch<{ favicon?: { asset: { _ref: string } } } | null>(
    groq`*[_type == "siteSettings"][0]{ favicon { asset } }`
  )

  const icons: Metadata['icons'] = settings?.favicon?.asset
    ? { icon: urlFor(settings.favicon).width(64).height(64).url() }
    : undefined

  return {
    title: {
      default: 'Gransvilla',
      template: '%s | Gransvilla',
    },
    description: 'Gransvilla - Restaurant, kantine og arrangementer',
    icons,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <html lang="no" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://use.typekit.net" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="preload" href="https://use.typekit.net/ipo0piy.css" as="style" />
        <script dangerouslySetInnerHTML={{ __html: `
          var l=document.createElement('link');l.rel='stylesheet';
          l.href='https://use.typekit.net/ipo0piy.css';
          document.head.appendChild(l);
        `}} />
        <noscript>
          <link rel="stylesheet" href="https://use.typekit.net/ipo0piy.css" />
        </noscript>
      </head>
      <body suppressHydrationWarning>
        {children}
        <SanityLive />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  )
}
