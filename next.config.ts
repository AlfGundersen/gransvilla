import type { NextConfig } from 'next'

const publicCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://plausible.io https://cdnjs.cloudflare.com",
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

/*
 * Cache key for the service worker, rebuilt every deploy.
 *
 * sw.js cache-firsts anything matching its asset pattern, which includes
 * unhashed files like /logo.svg and the PWA icons. CACHE_NAME used to be a
 * hardcoded string, and activate only clears caches whose name differs from
 * it — so it never cleared, and swapping one of those files would have served
 * the old one to returning visitors indefinitely.
 *
 * Netlify sets COMMIT_REF. The timestamp fallback only matters for local
 * production builds, where a fresh cache every time costs nothing.
 */
const swVersion = process.env.COMMIT_REF?.slice(0, 8) ?? Date.now().toString(36)

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SW_VERSION: swVersion,
  },
  // Enables React's <ViewTransition> component (see (site)/template.tsx).
  experimental: {
    viewTransition: true,
  },
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
      // Immutable caching is only safe in production, where chunk filenames
      // are content-hashed. In dev the names are stable, so this header made
      // browsers keep stale chunks forever.
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/_next/static/:path*',
              headers: [
                { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
              ],
            },
          ]
        : []),
    ]
  },
}

export default nextConfig
