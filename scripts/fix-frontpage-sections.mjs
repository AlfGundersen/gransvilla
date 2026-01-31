import { createClient } from '@sanity/client'
import { randomBytes } from 'crypto'

const client = createClient({
  projectId: '1qmvu8m0',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function genKey() { return randomBytes(6).toString('hex') }

function toBlocks(text) {
  if (!text || typeof text !== 'string') return null
  return text.split(/\r?\n/).map(line => ({
    _type: 'block', _key: genKey(), style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: genKey(), text: line, marks: [] }]
  }))
}

async function fix() {
  // Fetch frontpage document with featured columns and timeline entries
  const frontpage = await client.fetch(`*[_type == "frontpage"][0]{
    _id,
    "featuredColumns": featured.columns,
    "timelineEntries": timeline.entries
  }`)

  if (!frontpage) {
    console.log('No frontpage document found')
    return
  }

  console.log('Found frontpage:', frontpage._id)

  // Fix featured section columns
  if (Array.isArray(frontpage.featuredColumns)) {
    let changed = false
    const columns = frontpage.featuredColumns.map((col, i) => {
      if (typeof col.description === 'string') {
        console.log(`  Converting featured column[${i}] description: "${col.description.substring(0, 50)}..."`)
        changed = true
        return { ...col, description: toBlocks(col.description) }
      }
      console.log(`  Featured column[${i}] description already OK`)
      return col
    })
    if (changed) {
      await client.patch(frontpage._id).set({ 'featured.columns': columns }).commit()
      console.log('  → Patched featured columns')
    }
  }

  // Fix timeline entries
  if (Array.isArray(frontpage.timelineEntries)) {
    let changed = false
    const entries = frontpage.timelineEntries.map((entry, i) => {
      if (typeof entry.description === 'string') {
        console.log(`  Converting timeline entry[${i}] description: "${entry.description.substring(0, 50)}..."`)
        changed = true
        return { ...entry, description: toBlocks(entry.description) }
      }
      console.log(`  Timeline entry[${i}] description already OK`)
      return entry
    })
    if (changed) {
      await client.patch(frontpage._id).set({ 'timeline.entries': entries }).commit()
      console.log('  → Patched timeline entries')
    }
  }

  // Also check page documents with sections arrays
  const pages = await client.fetch(`*[_type in ["page", "event"] && defined(sections)]{ _id, sections }`)
  for (const doc of pages) {
    let changed = false
    const sections = doc.sections.map((section, si) => {
      // contentSection body
      if (section._type === 'tekstSeksjon' && typeof section.body === 'string') {
        console.log(`  Converting ${doc._id} section[${si}] body`)
        changed = true
        return { ...section, body: toBlocks(section.body) }
      }
      return section
    })
    if (changed) {
      await client.patch(doc._id).set({ sections }).commit()
      console.log(`  → Patched sections on ${doc._id}`)
    }
  }

  console.log('Done')
}

fix().catch(console.error)
