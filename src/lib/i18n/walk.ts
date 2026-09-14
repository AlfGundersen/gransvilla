/**
 * Walks CMS and commerce payloads and visits every user-facing string.
 *
 * Used two ways: `scripts/translate.mjs` passes a visitor that collects source
 * strings, and the runtime passes one that swaps in translations. Sharing the
 * traversal is what guarantees the build translates exactly the strings the
 * renderer will ask for.
 */

/**
 * Keys whose values are structural, not copy. Translating any of these breaks
 * rendering — `style` and `listItem` drive Portable Text block rendering,
 * `_key` and `_ref` are identity, `slug` is the URL.
 */
const SKIP_KEYS = new Set([
  '_id',
  '_type',
  '_rev',
  '_key',
  '_ref',
  '_weak',
  '_createdAt',
  '_updatedAt',
  '_originalId',
  // Sanity's internal document metadata, which carries revision ids.
  '_system',
  'slug',
  'current',
  'url',
  'href',
  'asset',
  'hotspot',
  'crop',
  'style',
  'listItem',
  'level',
  'marks',
  'markDefs',
  'handle',
  'productHandle',
  'id',
  'internLenke',
  'platform',
  'heroLayout',
  // Layout enums: "3/4", "16/9", "bottom-right", "left".
  'bildeforhold',
  'watermarkPosition',
  'imagePosition',
  // Compared against 'auto'/'none' in SchemaGenerator.tsx:49 — translating it
  // silently breaks JSON-LD type selection.
  'schemaType',
  'currencyCode',
  'amount',
  'sku',
])

/** Values that are identifiers or URLs rather than prose. */
function isTranslatable(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length < 2) return false
  return !/^(https?:\/\/|gid:\/\/|image-|file-|#|\/|data:)/.test(trimmed)
}

export type StringVisitor = (text: string) => string

/**
 * Returns a structurally identical copy with every translatable string passed
 * through `visit`. Object identity is not preserved, so callers should use the
 * return value rather than relying on mutation.
 */
export function walkContent<T>(node: T, visit: StringVisitor): T {
  if (typeof node === 'string') {
    return (isTranslatable(node) ? visit(node) : node) as T
  }

  if (Array.isArray(node)) {
    return node.map((entry) => walkContent(entry, visit)) as T
  }

  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      out[key] = SKIP_KEYS.has(key) ? value : walkContent(value, visit)
    }
    return out as T
  }

  return node
}

/** Collects every translatable string in a payload, deduplicated. */
export function collectStrings(node: unknown): string[] {
  const found = new Set<string>()
  walkContent(node, (text) => {
    found.add(text)
    return text
  })
  return [...found]
}
