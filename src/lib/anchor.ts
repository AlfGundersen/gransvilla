/**
 * Fixed anchors for specific sections, keyed by Sanity _key so they
 * survive heading rewrites.
 */
const FIXED_ANCHORS: Record<string, string> = {
  // om-oss «Jugendperlen i konditorgaten» → /om-oss#historie
  '1862120a4e5c602afb6a6e5825ff2511': 'historie',
}

export function sectionAnchor(key: string, heading?: string): string | undefined {
  return FIXED_ANCHORS[key] ?? headingAnchor(heading)
}

/**
 * Stable anchor id from a section heading, so sections can be linked
 * as /om-oss#jugendperlen-i-konditorgaten. Renaming the heading changes
 * the anchor.
 */
export function headingAnchor(heading?: string): string | undefined {
  if (!heading) return undefined
  const slug = heading
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || undefined
}
