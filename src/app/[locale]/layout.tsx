import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { draftMode } from 'next/headers'
import { groq } from 'next-sanity'
import { VisualEditing } from 'next-sanity/visual-editing'
import TranslationFallback from '@/components/i18n/TranslationFallback'
import { DraftModeBanner } from '@/components/pwa/DraftModeBanner'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import { JsonLd } from '@/components/seo/JsonLd'
import { defaultLocale, isLocale, locales } from '@/lib/i18n/config'
import { alternatesFor, openGraphLocale } from '@/lib/i18n/metadata'
import { I18nProvider } from '@/lib/i18n/provider'
import { getTranslator } from '@/lib/i18n/server'
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import { SanityLive } from '@/lib/sanity/live'
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
  const weglotKey = process.env.NEXT_PUBLIC_WEGLOT_API_KEY
  const { locale } = await params
  const lang = isLocale(locale) ? locale : defaultLocale
  const t = getTranslator(lang)

  return (
    // translate="no" matches what weglot.min.js sets pre-hydration
    <html lang={lang} translate="no" className={inter.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
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
            description: t('Restaurant, kantine og arrangementer'),
          }}
        />
        <I18nProvider locale={lang}>{children}</I18nProvider>
        <SanityLive />
        {isDraftMode && (
          <>
            <VisualEditing />
            <DraftModeBanner />
          </>
        )}
        <ServiceWorkerRegistration />
        <TranslationFallback />
      </body>
    </html>
  )
}
