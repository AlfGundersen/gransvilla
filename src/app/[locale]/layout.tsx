import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { draftMode } from 'next/headers'
import { groq } from 'next-sanity'
import { VisualEditing } from 'next-sanity/visual-editing'
import { DraftModeBanner } from '@/components/pwa/DraftModeBanner'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import { JsonLd } from '@/components/seo/JsonLd'
import { defaultLocale, isLocale, locales } from '@/lib/i18n/config'
import { alternatesFor, openGraphLocale } from '@/lib/i18n/metadata'
import { I18nProvider } from '@/lib/i18n/provider'
import { getTranslator, liveClientMessages } from '@/lib/i18n/server'
import { INVERTED_INIT_SCRIPT } from '@/lib/inverted-colors'
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = getTranslator(locale)
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
    description: t('Gransvilla - Restaurant, kantine og arrangementer'),
    // Per-page alternates override this; the root pair is the front pages.
    alternates: alternatesFor('/', locale),
    openGraph: {
      type: 'website',
      locale: openGraphLocale(locale),
      siteName: 'Gransvilla',
      title: 'Gransvilla',
      description: t('Restaurant, kantine og arrangementer'),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Gransvilla',
      description: t('Restaurant, kantine og arrangementer'),
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
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { isEnabled: isDraftMode } = await draftMode()
  const { locale } = await params
  const lang = isLocale(locale) ? locale : defaultLocale
  const t = getTranslator(lang)
  // Whatever Weglot says right now for the strings client components use, so a
  // correction to a button label lands as fast as one to CMS text.
  const clientOverrides = await liveClientMessages(lang)

  return (
    <html lang={lang} className={inter.variable} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        {/* Before the body paints, so a remembered colour flip does not blink. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed literal, no interpolation */}
        <script dangerouslySetInnerHTML={{ __html: INVERTED_INIT_SCRIPT }} />
        <meta name="theme-color" content="#000000" />
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
            description: t('Restaurant, kantine og arrangementer'),
          }}
        />
        <I18nProvider locale={lang} overrides={clientOverrides}>
          {children}
        </I18nProvider>
        {/* DEBUG(nav-bisect): SanityLive's EventSource removed to test whether an
            open SSE connection is what cancels address-bar navigations on iOS. */}
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
