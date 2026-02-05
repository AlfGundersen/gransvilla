/**
 * Migration script: Convert plain text fields to Portable Text (simpleBlockContent)
 *
 * Converts line-break-separated plain strings into Portable Text block arrays.
 * Run with: node scripts/migrate-text-to-portable.mjs
 */

import { createClient } from '@sanity/client'
import { randomBytes } from 'crypto'

const client = createClient({
  projectId: '1qmvu8m0',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function generateKey() {
  return randomBytes(6).toString('hex')
}

/** Convert a plain text string into a Portable Text block array */
function textToPortableText(text) {
  if (!text || typeof text !== 'string') return null
  // Split on newlines, each line becomes a block
  const lines = text.split(/\r?\n/)
  return lines.map((line) => ({
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text: line,
        marks: [],
      },
    ],
  }))
}

/**
 * Fields to migrate, grouped by document type.
 * Each entry: { path: 'dotted.path', field: 'fieldName' }
 *  - path is the parent path (empty string for top-level)
 *  - field is the field name to convert
 */
const migrations = [
  // siteSettings
  { type: 'siteSettings', path: '', field: 'siteDescription' },
  // Note: contactInfo.address already migrated to simpleBlockContent

  // event
  { type: 'event', path: '', field: 'description' },
]

/**
 * Array-nested fields: these live inside arrays on documents.
 * We handle them separately because we need to patch array items.
 */
const arrayMigrations = [
  // featuredSection columns[].description
  { type: 'frontpage', sectionType: 'featuredSection', arrayField: 'columns', field: 'description' },
  // timelineSection entries[].description
  { type: 'frontpage', sectionType: 'timelineSection', arrayField: 'entries', field: 'description' },
  // Same for page documents
  { type: 'page', sectionType: 'featuredSection', arrayField: 'columns', field: 'description' },
  { type: 'page', sectionType: 'timelineSection', arrayField: 'entries', field: 'description' },
  // contentSection body (top-level field on the section, not nested array)
  { type: 'frontpage', sectionType: 'contentSection', field: 'body' },
  { type: 'page', sectionType: 'contentSection', field: 'body' },
  // newsletter description
  { type: 'frontpage', sectionType: 'newsletter', field: 'description' },
  { type: 'page', sectionType: 'newsletter', field: 'description' },
]

async function migrateTopLevel() {
  for (const { type, path, field } of migrations) {
    const fullField = path ? `${path}.${field}` : field
    console.log(`\nMigrating ${type}.${fullField}...`)

    const query = `*[_type == "${type}" && defined(${fullField})]{ _id, _rev, ${path ? `"fieldValue": ${fullField}` : `"fieldValue": ${field}`} }`
    const docs = await client.fetch(query)

    console.log(`  Found ${docs.length} document(s) to migrate`)

    for (const doc of docs) {
      const value = doc.fieldValue
      if (typeof value !== 'string') {
        console.log(`  Skipping ${doc._id} - already migrated or not a string`)
        continue
      }

      const portableText = textToPortableText(value)
      if (!portableText) continue

      const patchPath = path ? { [path]: { [field]: portableText } } : { [field]: portableText }

      try {
        if (path) {
          // Nested object field
          await client.patch(doc._id).set({ [`${fullField}`]: portableText }).commit()
        } else {
          await client.patch(doc._id).set({ [field]: portableText }).commit()
        }
        console.log(`  ✓ Migrated ${doc._id}`)
      } catch (err) {
        console.error(`  ✗ Failed ${doc._id}:`, err.message)
      }
    }
  }
}

async function migrateSections() {
  for (const migration of arrayMigrations) {
    const { type, sectionType, arrayField, field } = migration
    console.log(`\nMigrating ${type} → ${sectionType}.${arrayField ? arrayField + '[].' : ''}${field}...`)

    // Fetch documents that have sections of this type
    const query = `*[_type == "${type}" && defined(sections)] { _id, sections }`
    const docs = await client.fetch(query)

    for (const doc of docs) {
      if (!doc.sections) continue
      let patched = false

      for (let si = 0; si < doc.sections.length; si++) {
        const section = doc.sections[si]
        if (section._type !== sectionType) continue

        if (arrayField) {
          // Field is inside an array within the section (e.g. columns[].description)
          const items = section[arrayField]
          if (!Array.isArray(items)) continue

          for (let ii = 0; ii < items.length; ii++) {
            const item = items[ii]
            const value = item[field]
            if (typeof value !== 'string') continue

            const portableText = textToPortableText(value)
            if (!portableText) continue

            const path = `sections[${si}].${arrayField}[${ii}].${field}`
            try {
              await client.patch(doc._id).set({ [path]: portableText }).commit()
              console.log(`  ✓ ${doc._id} → ${path}`)
              patched = true
            } catch (err) {
              // Try with _key if index doesn't work
              const key = item._key
              if (key) {
                const keyPath = `sections[_key=="${section._key}"].${arrayField}[_key=="${key}"].${field}`
                try {
                  await client.patch(doc._id).set({ [keyPath]: portableText }).commit()
                  console.log(`  ✓ ${doc._id} → ${keyPath}`)
                  patched = true
                } catch (err2) {
                  console.error(`  ✗ Failed ${doc._id} → ${path}:`, err2.message)
                }
              } else {
                console.error(`  ✗ Failed ${doc._id} → ${path}:`, err.message)
              }
            }
          }
        } else {
          // Field is directly on the section (e.g. contentSection.body)
          const value = section[field]
          if (typeof value !== 'string') continue

          const portableText = textToPortableText(value)
          if (!portableText) continue

          const path = section._key
            ? `sections[_key=="${section._key}"].${field}`
            : `sections[${si}].${field}`
          try {
            await client.patch(doc._id).set({ [path]: portableText }).commit()
            console.log(`  ✓ ${doc._id} → ${path}`)
            patched = true
          } catch (err) {
            console.error(`  ✗ Failed ${doc._id} → ${path}:`, err.message)
          }
        }
      }

      if (!patched) {
        console.log(`  No matching fields in ${doc._id}`)
      }
    }
  }
}

async function main() {
  console.log('=== Sanity Text → Portable Text Migration ===')
  console.log('Dataset: production')
  console.log('')

  await migrateTopLevel()
  await migrateSections()

  console.log('\n=== Migration complete ===')
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
