import 'server-only'

import { cache } from 'react'

/**
 * Translates strings that are not in the committed dictionary yet.
 *
 * A product added in Shopify, or a section rewritten in Sanity, would otherwise
 * stay Norwegian on the English site until someone ran `pnpm translate` and
 * deployed. This fills that gap so no manual deploy is needed.
 *
 * It does not weaken the offline guarantee: every failure path returns the
 * Norwegian source, so a Weglot outage or an exhausted quota degrades to
 * Norwegian text rather than failing a render or a build.
 *
 * Pages are statically generated or ISR-revalidated, so this runs during
 * (re)generation rather than per visitor.
 */

const ENDPOINT = 'https://api.weglot.com/translate'
const WORD_TYPE_TEXT = 1
const BATCH_SIZE = 80

/** Per-request memoisation, so one payload does not fetch the same string twice. */
const fetchBatch = cache(async (key: string, locale: string): Promise<Record<string, string>> => {
  const texts: string[] = JSON.parse(key)
  const apiKey = process.env.NEXT_PUBLIC_WEGLOT_API_KEY
  if (!apiKey || texts.length === 0) return {}

  const out: Record<string, string> = {}

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    try {
      const response = await fetch(`${ENDPOINT}?api_key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          l_from: 'nb',
          l_to: locale,
          request_url: 'https://gransvilla.no/',
          words: batch.map((text) => ({ w: text, t: WORD_TYPE_TEXT })),
        }),
        // Let Next cache the response alongside the page that triggered it.
        next: { revalidate: 3600, tags: ['i18n-runtime'] },
      })
      if (!response.ok) continue

      const data = (await response.json()) as { to_words?: (string | null)[] }
      const words = data.to_words
      if (!Array.isArray(words) || words.length !== batch.length) continue

      batch.forEach((source, j) => {
        const word = words[j]
        if (word) out[source] = word
      })
    } catch {
      // Leave these untranslated; the caller falls back to the Norwegian source.
    }
  }

  return out
})

export async function translateMissing(
  texts: string[],
  locale: string,
): Promise<Record<string, string>> {
  if (texts.length === 0) return {}
  // Sorted so the same set of strings hits the same memoised entry.
  return fetchBatch(JSON.stringify([...texts].sort()), locale)
}
