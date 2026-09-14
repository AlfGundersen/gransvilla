import 'server-only'

import { cache } from 'react'

/**
 * Translations straight from Weglot, so a correction shows up in about a minute
 * instead of waiting for a commit and a rebuild.
 *
 * Re-fetching a string Weglot has already translated does not cost quota. Ten
 * full refreshes on 2026-09-14 moved ~3000 words each; had they billed, that
 * alone would have been 30,000 against a 10,000 allowance, and the account sat
 * at 6,000. So asking every render is free, and only genuinely new text bills.
 *
 * Pages are ISR, so this runs at most once per page per revalidation window —
 * in the background, while visitors are served the cached page. Failure returns
 * nothing and the caller falls back to the committed dictionary, which is why
 * that file still exists.
 */

const ENDPOINT = 'https://api.weglot.com/translate'
const WORD_TYPE_TEXT = 1
const BATCH_SIZE = 80

/** Matches the page revalidation window; there is no point being fresher. */
const REVALIDATE_SECONDS = 60

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
        next: { revalidate: REVALIDATE_SECONDS, tags: ['i18n-runtime'] },
      })
      if (!response.ok) continue

      const data = (await response.json()) as { to_words?: (string | null)[] }
      const words = data.to_words
      if (!Array.isArray(words) || words.length !== batch.length) continue

      batch.forEach((source, j) => {
        const word = words[j]
        // Weglot echoes the source back for anything it has no translation for.
        // Keeping those would shadow a dictionary entry with Norwegian text.
        if (word && word !== source) out[source] = word
      })
    } catch {
      // Leave these out; the caller falls back to the committed dictionary.
    }
  }

  return out
})

/**
 * Current translations for these strings, or an empty object if Weglot cannot
 * be reached. Never throws: a translation outage must not fail a render.
 */
export async function translateLive(
  texts: string[],
  locale: string,
): Promise<Record<string, string>> {
  if (texts.length === 0) return {}
  // Sorted so the same set of strings hits the same memoised entry.
  return fetchBatch(JSON.stringify([...texts].sort()), locale)
}
