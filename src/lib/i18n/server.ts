import 'server-only'

import clientMessages from '../../../messages/en.client.json'
import messages from '../../../messages/en.json'
import { defaultLocale, isLocale, type Locale } from './config'
import { createTranslator, normalizeKey, type Translate } from './dictionary'
import { localeHref } from './href'
import { translateLive } from './runtime'
import { collectStrings, walkContent, walkLinks } from './walk'

const dictionaries: Record<Locale, Record<string, string>> = {
  nb: {},
  en: messages as Record<string, string>,
}

/**
 * Translator for Server Components.
 *
 * Holds the full dictionary — UI strings plus all CMS and commerce copy — and
 * never reaches the network, since messages/en.json is committed.
 */
export function getTranslator(locale: string): Translate {
  const resolved = isLocale(locale) ? locale : defaultLocale
  return createTranslator(resolved, dictionaries[resolved])
}

/**
 * Translates a fetched Sanity or Shopify payload in place of rendering it raw.
 *
 * Structure is preserved — Portable Text keys, block styles and marks are left
 * alone — so `@portabletext/react` still renders what it expects.
 *
 * Weglot is asked for every string, not just the ones missing from the
 * dictionary, so a correction made in the dashboard appears within the page's
 * revalidation window rather than waiting for a commit and a rebuild. Re-asking
 * for a string it has already translated costs no quota, and pages are ISR, so
 * this runs at most once per page per window, in the background.
 *
 * The committed dictionary is the floor underneath that: whatever Weglot does
 * not answer for — an outage, a spent quota, a string it has never seen — falls
 * through to it, so the site never renders Norwegian in place of English it
 * already knows.
 */
export async function translateContent<T>(payload: T, locale: string): Promise<T> {
  const resolved = isLocale(locale) ? locale : defaultLocale
  if (resolved === defaultLocale) return payload

  const dictionary = dictionaries[resolved]
  const sources = collectStrings(payload).map(normalizeKey).filter(Boolean)

  const live = sources.length ? await translateLive(sources, resolved) : {}
  const translate = createTranslator(resolved, { ...dictionary, ...live })

  const translated = walkContent(payload, translate)
  return walkLinks(translated, (href) => localeHref(href, resolved))
}

/**
 * Current Weglot translations for the strings client components use.
 *
 * The layout passes these to I18nProvider so a correction to a UI string
 * behaves like a correction to CMS text, rather than waiting for a rebuild.
 * Returns nothing if Weglot cannot be reached; the provider falls back to the
 * bundled file.
 */
export async function liveClientMessages(locale: string): Promise<Record<string, string>> {
  const resolved = isLocale(locale) ? locale : defaultLocale
  if (resolved === defaultLocale) return {}
  return translateLive(Object.keys(clientMessages), resolved)
}
