import type { SanityImage } from '@/types/sanity'

/**
 * Stand-in pictures for a text section with no heading.
 *
 * Such a section leaves the first of its three columns empty, which reads as a
 * mistake rather than as space. Until the section carries an image of its own,
 * one of these fills it.
 *
 * The pick is derived from the section's _key rather than being random, so a
 * given section keeps the same picture across renders and deploys — a truly
 * random one would change under the reader on every revalidation, and would
 * make two prerenders of the same page differ.
 *
 * Portrait assets, since the slot is a narrow column.
 */
const PLACEHOLDER_REFS = [
  'image-00c3805f92a4c6ebb2054a500425332fad431dfe-1311x1966-jpg',
  'image-0145c9fbe18d668ab5991918a19ef2f105e58d1a-1311x1966-jpg',
  'image-02c4524f4494ac2ae745a3ff22f3337709c989f5-1311x1966-jpg',
  'image-037f447e04039da59312d8df3576f06859be6c44-1311x1966-jpg',
  'image-0520c57637d780bb4b13d49784a3f5c451c14c4d-1311x1966-jpg',
  'image-08777781513773bf00439d24f6b7df9d48c68586-1311x1966-jpg',
]

export function placeholderImage(key: string): SanityImage {
  let sum = 0
  for (let i = 0; i < key.length; i += 1) {
    sum += key.charCodeAt(i)
  }
  return {
    _type: 'image',
    asset: {
      _ref: PLACEHOLDER_REFS[sum % PLACEHOLDER_REFS.length],
      _type: 'reference',
    },
  }
}
