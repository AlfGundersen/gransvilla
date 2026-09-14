import 'server-only'

import messages from '../../../messages/en.json'
import { defaultLocale, isLocale, type Locale } from './config'
import { createTranslator, type Translate } from './dictionary'
import { walkContent } from './walk'

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
 */
export function translateContent<T>(payload: T, locale: string): T {
  const resolved = isLocale(locale) ? locale : defaultLocale
  if (resolved === defaultLocale) return payload
  return walkContent(payload, getTranslator(resolved))
}
