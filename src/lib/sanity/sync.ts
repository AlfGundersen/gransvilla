import { writeClient, client } from './client'
import { getCollections } from '@/lib/shopify'

/** Extract the numeric ID from a Shopify GID (e.g. gid://shopify/Collection/123 → 123) */
function numericId(gid: string): string {
  return gid.split('/').pop()!
}

/** Build a deterministic Sanity document ID from a Shopify collection GID */
function docId(shopifyGid: string): string {
  return `shopifyCollection-${numericId(shopifyGid)}`
}

interface CollectionInput {
  id: string | number
  title: string
  handle: string
}

/** Create or update a single Sanity shopCategory from Shopify collection data. */
export async function syncCollection(collection: CollectionInput) {
  const gid =
    typeof collection.id === 'number'
      ? `gid://shopify/Collection/${collection.id}`
      : String(collection.id).startsWith('gid://')
        ? String(collection.id)
        : `gid://shopify/Collection/${collection.id}`

  const _id = docId(gid)

  const tx = writeClient.transaction()

  tx.createIfNotExists({
    _id,
    _type: 'shopCategory',
    title: collection.title,
    shopifyCollectionId: gid,
    shopifyHandle: collection.handle,
  })

  tx.patch(_id, (p) =>
    p.set({
      title: collection.title,
      shopifyCollectionId: gid,
      shopifyHandle: collection.handle,
    }),
  )

  await tx.commit()
  return _id
}

/** Delete the Sanity document for a removed Shopify collection. */
export async function removeCollection(shopifyId: string | number) {
  const gid =
    typeof shopifyId === 'number'
      ? `gid://shopify/Collection/${shopifyId}`
      : String(shopifyId).startsWith('gid://')
        ? String(shopifyId)
        : `gid://shopify/Collection/${shopifyId}`

  const _id = docId(gid)
  await writeClient.delete(_id)
  return _id
}

/** Full reconciliation: sync all Shopify collections into Sanity. */
export async function syncAllCollections() {
  const [shopifyCollections, sanityDocs] = await Promise.all([
    getCollections(),
    client.fetch<{ _id: string; shopifyCollectionId: string | null }[]>(
      `*[_type == "shopCategory"]{ _id, shopifyCollectionId }`,
    ),
  ])

  const created: string[] = []
  const updated: string[] = []
  const deleted: string[] = []

  // Build a set of expected Sanity doc IDs from Shopify collections
  const expectedIds = new Set<string>()

  for (const col of shopifyCollections) {
    const _id = docId(col.id)
    expectedIds.add(_id)

    const existing = sanityDocs.find((d) => d._id === _id)
    const syncedId = await syncCollection(col)

    if (!existing) {
      created.push(syncedId)
    } else {
      updated.push(syncedId)
    }
  }

  // Delete orphaned documents (exist in Sanity but not in Shopify)
  // Also clean up legacy documents that have no shopifyCollectionId
  for (const doc of sanityDocs) {
    if (!expectedIds.has(doc._id)) {
      await writeClient.delete(doc._id)
      deleted.push(doc._id)
    }
  }

  return { created, updated, deleted }
}
