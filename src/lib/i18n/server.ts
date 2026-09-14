import 'server-only'

import messages from '../../../messages/en.json'
import { defaultLocale, isLocale, type Locale } from './config'
import { createTranslator, normalizeKey, type Translate } from './dictionary'
import { translateMissing } from './runtime'
import { collectStrings, walkContent } from './walk'

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
 * Strings already in the committed dictionary are swapped without touching the
 * network. Anything new — a product just added in Shopify, a section just
 * rewritten in Sanity — is fetched once and falls back to Norwegian if Weglot
 * cannot be reached, so content added between translation runs still appears in
 * English without a manual deploy.
 */
export async function translateContent<T>(payload: T, locale: string): Promise<T> {
  const resolved = isLocale(locale) ? locale : defaultLocale
  if (resolved === defaultLocale) return payload

  const dictionary = dictionaries[resolved]
  const missing = collectStrings(payload)
    .map(normalizeKey)
    .filter((text) => text && !(text in dictionary))

  const fetched = missing.length ? await translateMissing(missing, resolved) : {}
  const translate = createTranslator(resolved, { ...dictionary, ...fetched })

  return walkContent(payload, translate)
}
