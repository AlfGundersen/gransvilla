import type { Knapp } from '@/types/sanity'

/**
 * The href a button points at, whichever kind of link the editor chose.
 *
 * Buttons stored before the choice existed carry no `lenketype`, so the type
 * is read back from whichever field holds something — «Ta kontakt» on Bryllup
 * and Private selskap predate it, and are still just `internLenke`.
 */
export function knappHref(knapp?: Knapp): string | undefined {
  if (!knapp) return undefined

  const slug = knapp.lenke?.slug?.current
  switch (knapp.lenketype) {
    case 'side':
      return slug ? `/${slug}` : undefined
    case 'url':
      return knapp.url
    case 'snarvei':
      return knapp.internLenke
    default:
      return slug ? `/${slug}` : (knapp.internLenke ?? knapp.url)
  }
}
