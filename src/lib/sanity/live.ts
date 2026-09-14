import { defineLive } from 'next-sanity/live'
import { client } from './client'

const token = process.env.SANITY_API_TOKEN
const browserToken = process.env.SANITY_BROWSER_TOKEN

const { sanityFetch: liveFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken,
})

/** Tag every Sanity query carries, so one call can clear all of them. */
export const SANITY_TAG = 'sanity'

/**
 * Adds a cache tag the revalidation webhook can actually target.
 *
 * defineLive's queries land in Next's data cache under sync tags from the Live
 * API, which nothing on our side can name. revalidatePath cleared the route
 * cache but left the cached GROQ response, so a regenerated page re-rendered
 * the same stale copy — measured on /arbeidskafe as `"Next.js"; fwd=miss` (a
 * genuine re-render) still serving the previous paragraph.
 *
 * With a tag we own, /api/revalidate/sanity can drop those entries on publish.
 */
export const sanityFetch: typeof liveFetch = (options) =>
  liveFetch({ ...options, tags: [...(options.tags ?? []), SANITY_TAG] })

export { SanityLive }
