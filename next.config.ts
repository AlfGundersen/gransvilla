import type { NextConfig } from 'next'

const publicCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://plausible.io",
  "style-src 'self' 'unsafe-inline' https://use.typekit.net https://p.typekit.net",
  "font-src 'self' https://use.typekit.net https://p.typekit.net",
  "img-src 'self' data: blob: https://cdn.sanity.io https://cdn.shopify.com",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://plausible.io",
  "media-src 'self' https://cdn.sanity.io",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "worker-src 'self'",
].join('; ')


const baseSecurityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Studio: no CSP (authenticated admin interface)
        source: '/studio/:path*',
        headers: baseSecurityHeaders,
      },
      {
        // Public pages: full CSP
        source: '/((?!studio).*)',
        headers: [
          { key: 'Content-Security-Policy', value: publicCsp },
          ...baseSecurityHeaders,
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
