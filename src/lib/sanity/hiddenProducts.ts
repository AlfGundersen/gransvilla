import { stegaClean } from 'next-sanity'
import { sanityFetch } from './live'
import { hiddenProductHandlesQuery } from './queries'

/**
 * Handles of products that are sold from a page of their own and must stay out
 * of the shop listing — the Framdrift lunch is for members, who reach it from
 * /framdrift or a QR code, not by browsing.
 *
 * The product stays published in Shopify, so its page and checkout keep
 * working; hiding is only a matter of leaving it out wherever products are
 * listed. A failed lookup hides nothing rather than emptying the shop.
 *
 * In draft mode Sanity threads invisible source-map characters through every
 * string, and a handle carrying those matches nothing in Shopify.
 */
export async function getHiddenProductHandles(): Promise<Set<string>> {
  try {
    const { data } = await sanityFetch({ query: hiddenProductHandlesQuery })
    return new Set(stegaClean((data as string[] | null) ?? []))
  } catch {
    return new Set()
  }
}
