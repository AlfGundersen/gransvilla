import { defaultLocale, type Locale } from './config'

/**
 * Translations are keyed on the Norwegian source string, not on invented keys.
 *
 * That mirrors how Weglot's own translation memory is keyed, so a correction
 * made in the Weglot dashboard lines up 1:1 with what the code asks for. It
 * also means an untranslated string degrades to Norwegian rather than to a
 * missing-key placeholder.
 *
 * Keys must match Weglot's entry exactly — "Arbeidskafe" and "Arbeidskafé" are
 * separate entries there, so a correction made against the wrong spelling has
 * no effect.
 */
export type Translate = (source: string) => string

/**
 * Normalises the whitespace JSX introduces, so a string broken across source
 * lines still matches the single-line key Weglot was given.
 */
export function normalizeKey(source: string): string {
  return source.replace(/\s+/g, ' ').trim()
}

export function createTranslator(locale: Locale, dictionary: Record<string, string>): Translate {
  if (locale === defaultLocale) return (source) => source

  return (source) => {
    if (!source) return source
    const hit = dictionary[normalizeKey(source)]
    if (!hit) return source

    // Preserve the caller's leading/trailing whitespace, since JSX relies on it
    // for spacing between inline elements.
    const [, lead = '', , trail = ''] = source.match(/^(\s*)([\s\S]*?)(\s*)$/) ?? []
    return `${lead}${hit}${trail}`
  }
}
