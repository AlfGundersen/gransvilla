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

/**
 * Shopify variant titles for dated events: `08.11.2026 kl. 12:00` (the dot
 * after `kl` is sometimes missing). Defined here rather than in
 * variant-date.ts because scripts/translate.mjs imports this module directly
 * through Node's type stripping, which cannot resolve extensionless relative
 * imports — so this file must stay import-free.
 */
export const VARIANT_DATE = /^(\d{2})\.(\d{2})\.(\d{4})\s+kl\.?\s+(\d{1,2}):(\d{2})$/

/** True for titles variant-date.ts formats, so they stay out of the dictionary. */
export function isVariantDate(title: string): boolean {
  return VARIANT_DATE.test(title.trim())
}

/**
 * Values that are identifiers, URLs or structured data rather than prose.
 *
 * Dated variant titles are formatted by variant-date.ts, so translating them
 * would only add a curated entry per date and an American 12-hour clock.
 */
function isTranslatable(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length < 2) return false
  if (isVariantDate(trimmed)) return false
  return !/^(https?:\/\/|gid:\/\/|image-|file-|#|\/|data:)/.test(trimmed)
}

export type StringVisitor = (text: string) => string

/** Fields whose value is an HTML fragment rather than plain text. */
export const HTML_KEYS = new Set(['descriptionHtml'])

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
      if (SKIP_KEYS.has(key)) {
        out[key] = value
      } else if (HTML_KEYS.has(key) && typeof value === 'string') {
        out[key] = translateHtml(value, visit)
      } else {
        out[key] = walkContent(value, visit)
      }
    }
    return out as T
  }

  return node
}

/**
 * Collects every translatable string in a payload, deduplicated.
 *
 * HTML fields contribute their text nodes rather than the whole fragment, since
 * that is what the translator will be asked for at render time.
 */
export function collectStrings(node: unknown): string[] {
  const found = new Set<string>()
  walkContent(node, (text) => {
    found.add(text)
    return text
  })
  return [...found]
}

/**
 * Rewrites internal links inside a CMS payload to the active locale.
 *
 * Editors write Norwegian URLs in Sanity — both relative (`/om-oss`) and
 * absolute (`https://gransvilla.no/om-oss`). Those are correct for Norwegian,
 * and because slugs are identical across languages the English counterpart is
 * the same path with the locale prefix, so no lookup table is needed.
 *
 * Separate from walkContent because `href` is on its skip list: link targets
 * must never be fed to the translator.
 */
export function walkLinks<T>(node: T, rewrite: (href: string) => string): T {
  if (Array.isArray(node)) {
    return node.map((entry) => walkLinks(entry, rewrite)) as T
  }

  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      out[key] =
        key === 'href' && typeof value === 'string' ? rewrite(value) : walkLinks(value, rewrite)
    }
    return out as T
  }

  return node
}

/**
 * Translates the text inside an HTML string, leaving the markup alone.
 *
 * Weglot's API does not translate HTML — a sentence wrapped in <p> comes back
 * untouched — so Shopify's `descriptionHtml` stayed Norwegian while the plain
 * `description` on the product card translated fine. This splits the string on
 * tags, hands the translator only the text between them, and reassembles.
 *
 * Entities and whitespace-only chunks pass through untouched so spacing between
 * inline elements survives.
 */
export function translateHtml(html: string, visit: StringVisitor): string {
  return html.replace(/>([^<]+)</g, (match, text: string) => {
    const trimmed = text.trim()
    if (!trimmed || !/[a-zA-ZæøåÆØÅ]/.test(trimmed)) return match
    const [, lead = '', , trail = ''] = text.match(/^(\s*)([\s\S]*?)(\s*)$/) ?? []
    return `>${lead}${visit(trimmed)}${trail}<`
  })
}

/** Every translatable text node inside an HTML string. */
export function collectHtmlStrings(html: string): string[] {
  const found: string[] = []
  translateHtml(html, (text) => {
    found.push(text)
    return text
  })
  return found
}
