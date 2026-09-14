/**
 * Weglot translation client.
 *
 * Only plain text works. Measured 2026-09-14: "Et flott lokale for bryllup."
 * translates, but the identical sentence wrapped as "<p>…</p>" comes back
 * untouched under both t:1 and t:2. Callers must send text nodes, never markup,
 * and reassemble structure themselves.
 */

const ENDPOINT = 'https://api.weglot.com/translate'
const WORD_TYPE_TEXT = 1

/** Weglot rejects very large payloads; stay well under the limit. */
const BATCH_SIZE = 80

async function translateBatch(batch, { apiKey, from = 'nb', to, requestUrl }) {
  const response = await fetch(`${ENDPOINT}?api_key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      l_from: from,
      l_to: to,
      // Required. Without it the API answers 400
      // "request_url: This value should not be blank."
      request_url: requestUrl ?? 'https://gransvilla.no/',
      words: batch.map((text) => ({ w: text, t: WORD_TYPE_TEXT })),
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Weglot ${response.status}: ${detail.slice(0, 300)}`)
  }

  const data = await response.json()
  const words = data.to_words

  if (!Array.isArray(words) || words.length !== batch.length) {
    throw new Error(
      `Weglot returned ${Array.isArray(words) ? words.length : 'no'} words for ${batch.length} inputs`,
    )
  }

  // A null entry means Weglot declined that word; fall back to the source so a
  // partial failure never blanks out copy.
  return words.map((word, i) => word ?? batch[i])
}

/** Translates in batches, preserving input order. */
export async function translateAll(texts, options, onProgress) {
  const out = []
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    out.push(...(await translateBatch(batch, options)))
    onProgress?.(Math.min(i + BATCH_SIZE, texts.length), texts.length)
  }
  return out
}
