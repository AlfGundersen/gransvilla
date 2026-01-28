import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ViewTransitions } from 'next-view-transitions'
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ViewTransitions>
      <html lang="no">
        <head>
          <link rel="stylesheet" href="https://use.typekit.net/ipo0piy.css" />
        </head>
        <body className={inter.variable} suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ViewTransitions>
  )
}
