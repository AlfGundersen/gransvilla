'use client'

import Script from 'next/script'
import { useCookieConsent } from '@/context/CookieConsentContext'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function GoogleAnalytics() {
  const { consent } = useCookieConsent()

  if (!GA_ID || !consent.statistics) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}
