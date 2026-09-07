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
