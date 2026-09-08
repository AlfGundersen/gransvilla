/**
 * Absolute site origin, with or without a protocol in the env var.
 *
 * NEXT_PUBLIC_SITE_URL was read as a bare hostname and had `https://`
 * prepended, but .env.example documents it as a full URL. Netlify was set the
 * documented way, so production served `https://http://localhost:3000/...` in
 * robots.txt and the sitemap. Accept either form.
 */
export function siteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || 'gransvilla.no').trim()
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  return withProtocol.replace(/\/+$/, '')
}
