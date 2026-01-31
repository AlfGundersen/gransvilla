import { defineLive } from 'next-sanity/live'
import { client } from './client'

const token = process.env.SANITY_API_TOKEN
const browserToken = process.env.SANITY_BROWSER_TOKEN

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken,
})
