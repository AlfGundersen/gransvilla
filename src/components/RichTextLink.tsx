'use client'

import Link from 'next/link'
import { localeHref } from '@/lib/i18n/href'
import { useLocale } from '@/lib/i18n/provider'

/**
 * Schemes that are safe to put in an href.
 *
 * The Sanity schema already restricts link schemes to these, but that is
 * edit-time validation only — it does not cover documents written before the
 * rule existed, content imported from elsewhere, or anything written through
 * the API with a token. The default Portable Text serializer renders
 * `href: value?.href` untouched, so a `javascript:` URL would have become a
 * live anchor. Re-check at render time, where it actually matters.
 */
const SAFE_SCHEME = /^(?:https?:|mailto:|tel:)/i

function isSafeHref(href: string): boolean {
  // Browsers strip leading whitespace before resolving a scheme, so
  // " javascript:..." is live. Trim before testing, not after.
  const trimmed = href.trim()

  // Protocol-relative (`//evil.com`) looks internal but leaves the site.
  if (trimmed.startsWith('//')) return false
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true

  return SAFE_SCHEME.test(trimmed)
}

type RichTextLinkProps = {
  href?: string
  openInNewTab?: boolean
  children: React.ReactNode
}

/**
 * Link mark for Portable Text.
 *
 * Editors write these as absolute URLs (`https://gransvilla.no/om-oss`), and
 * the default Portable Text serializer emits a bare <a>. That sent visitors to
 * the production host from every environment, and a bare <a> is a document
 * load, so it dropped out of client routing — no locale carried over, and no
 * view transition.
 *
 * `localeHref` normalises a link back to our own host into a path and prefixes
 * the active locale; anything genuinely external, plus mailto/tel/#anchor, it
 * returns untouched, which is what keeps the <a> branch below correct.
 */
export function RichTextLink({ href, openInNewTab, children }: RichTextLinkProps) {
  const locale = useLocale()

  // No href, or one we will not vouch for: render the text, drop the link.
  if (!href || !isSafeHref(href)) return <>{children}</>

  const resolved = localeHref(href, locale)
  const isInternal = resolved.startsWith('/')

  if (isInternal && !openInNewTab) {
    return <Link href={resolved}>{children}</Link>
  }

  return (
    <a
      href={resolved}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  )
}
