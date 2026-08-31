import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { draftMode } from 'next/headers'
import { groq } from 'next-sanity'
import { VisualEditing } from 'next-sanity/visual-editing'
import { DraftModeBanner } from '@/components/pwa/DraftModeBanner'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import { JsonLd } from '@/components/seo/JsonLd'
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import { SanityLive } from '@/lib/sanity/live'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await client.fetch<{ favicon?: { asset: { _ref: string } } } | null>(
    groq`*[_type == "siteSettings"][0]{ favicon { asset } }`,
  )

  const icons: Metadata['icons'] = settings?.favicon?.asset
    ? { icon: urlFor(settings.favicon).width(64).height(64).url() }
    : undefined

  return {
    metadataBase: new URL('https://gransvilla.no'),
    title: {
      default: 'Gransvilla',
      template: '%s | Gransvilla',
    },
    description: 'Gransvilla - Restaurant, kantine og arrangementer',
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'nb_NO',
      siteName: 'Gransvilla',
      title: 'Gransvilla',
      description: 'Restaurant, kantine og arrangementer',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Gransvilla',
      description: 'Restaurant, kantine og arrangementer',
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Gransvilla',
    },
    icons,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isEnabled: isDraftMode } = await draftMode()
  const weglotKey = process.env.NEXT_PUBLIC_WEGLOT_API_KEY

  return (
    // translate="no" matches what weglot.min.js sets pre-hydration
    <html lang="nb" translate="no" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <link rel="alternate" hrefLang="nb" href="https://gransvilla.no" />
        <link rel="alternate" hrefLang="en" href="https://en.gransvilla.no" />
        {weglotKey && (
          <>
            <script src="https://cdn.weglot.com/weglot.min.js" />
            <script
              // biome-ignore lint/security/noDangerouslySetInnerHtml: static init snippet, key is public by design
              dangerouslySetInnerHTML={{
                // dynamics is load-bearing: on en.gransvilla.no React hydration
                // recovery repaints the DOM with untranslated Norwegian from the
                // RSC payload — Weglot must observe the DOM and re-translate.
                __html: `Weglot.initialize({api_key: '${weglotKey}', cache: true, dynamics: [{value: 'body'}], excluded_blocks: [{value: '.language-switcher-button'}], excluded_paths: [{value: '/studio', type: 'START_WITH'}, {value: '/api', type: 'START_WITH'}]});`,
              }}
            />
          </>
        )}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://use.typekit.net" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="stylesheet" href="https://use.typekit.net/ipo0piy.css" />
      </head>
      <body suppressHydrationWarning>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Gransvilla',
            url: 'https://gransvilla.no',
            description: 'Restaurant, kantine og arrangementer',
          }}
        />
        {children}
        <SanityLive />
        {isDraftMode && (
          <>
            <VisualEditing />
            <DraftModeBanner />
          </>
        )}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
