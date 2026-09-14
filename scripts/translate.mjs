#!/usr/bin/env node
/**
 * Refreshes messages/en.json from Weglot.
 *
 * Collects every Norwegian source string the site can render — `t()` calls in
 * the code, Sanity documents, Shopify products — diffs them against what is
 * already translated, and asks Weglot only for the difference. The result is
 * committed, so rendering never depends on Weglot being up.
 *
 *   node scripts/translate.mjs           refresh missing strings
 *   node scripts/translate.mjs --dry     show what would be sent, send nothing
 *   node scripts/translate.mjs --prune   also drop keys no longer used anywhere
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectStrings } from '../src/lib/i18n/walk.ts'
import { translateAll } from './lib/weglot.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MESSAGES = join(ROOT, 'messages', 'en.json')
/**
 * The subset reachable from t() calls in the code. Client components bundle
 * this rather than the full dictionary, which is mostly CMS prose already
 * rendered on the server.
 */
const CLIENT_MESSAGES = join(ROOT, 'messages', 'en.client.json')

const args = new Set(process.argv.slice(2))
const DRY = args.has('--dry')
const PRUNE = args.has('--prune')

// ---------------------------------------------------------------- env

function loadEnv() {
  const env = { ...process.env }
  try {
    for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (match && !env[match[1]]) env[match[1]] = match[2].trim()
    }
  } catch {
    // .env.local is optional when the values come from the environment
  }
  return env
}

const env = loadEnv()

function required(name) {
  const value = env[name]
  if (!value) {
    console.error(`Missing ${name}. Pull it with: netlify env:get ${name} --context production`)
    process.exit(1)
  }
  return value
}

// ------------------------------------------------------- source: code

/** Matches t('…') and t("…"), including escaped quotes. */
const T_CALL = /\bt\(\s*(['"])((?:\\.|(?!\1).)*)\1/g

async function* walkFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walkFiles(path)
    else if (/\.(tsx?|mjs)$/.test(entry.name)) yield path
  }
}

async function collectFromCode() {
  const found = new Set()
  for await (const file of walkFiles(join(ROOT, 'src'))) {
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(T_CALL)) {
      const text = match[2].replace(/\\(['"\\])/g, '$1')
      if (text.trim().length >= 2) found.add(text)
    }
  }
  return [...found]
}

// ----------------------------------------------------- source: sanity

async function collectFromSanity() {
  const projectId = required('NEXT_PUBLIC_SANITY_PROJECT_ID')
  const dataset = required('NEXT_PUBLIC_SANITY_DATASET')
  const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
  const token = required('SANITY_API_TOKEN')

  // Published documents only; drafts are editor state, not published copy.
  const query = `*[!(_id in path("drafts.**")) && !(_type match "sanity.*") && !(_type match "system.*")]`
  const url =
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}` +
    `?query=${encodeURIComponent(query)}`

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) throw new Error(`Sanity ${response.status}: ${await response.text()}`)

  const { result } = await response.json()
  return collectStrings(result ?? [])
}

// ---------------------------------------------------- source: shopify

const SHOPIFY_QUERY = `
  query AllProductText($cursor: String) {
    products(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        title
        description
        images(first: 20) { nodes { altText } }
        options { name values }
        variants(first: 50) { nodes { title selectedOptions { name value } } }
      }
    }
  }
`

async function collectFromShopify() {
  const domain = required('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN')
  const token = required('NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN')

  const found = new Set()
  let cursor = null

  do {
    const response = await fetch(`https://${domain}/api/2025-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query: SHOPIFY_QUERY, variables: { cursor } }),
    })
    if (!response.ok) throw new Error(`Shopify ${response.status}: ${await response.text()}`)

    const { data, errors } = await response.json()
    if (errors?.length) throw new Error(`Shopify: ${JSON.stringify(errors).slice(0, 300)}`)

    for (const text of collectStrings(data.products.nodes)) found.add(text)
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null
  } while (cursor)

  return [...found]
}

// ---------------------------------------------------------------- run

/** Matches the renderer's key normalisation in src/lib/i18n/dictionary.ts. */
const normalize = (text) => text.replace(/\s+/g, ' ').trim()

async function main() {
  const apiKey = required('NEXT_PUBLIC_WEGLOT_API_KEY')

  const existing = JSON.parse(readFileSync(MESSAGES, 'utf8'))

  const [code, sanity, shopify] = await Promise.all([
    collectFromCode(),
    collectFromSanity(),
    collectFromShopify(),
  ])

  console.log(`sources   code ${code.length}  sanity ${sanity.length}  shopify ${shopify.length}`)

  const sources = new Set([...code, ...sanity, ...shopify].map(normalize).filter(Boolean))
  const missing = [...sources].filter((text) => !(text in existing))
  const stale = Object.keys(existing).filter((text) => !sources.has(text))

  console.log(`dictionary ${Object.keys(existing).length} known, ${missing.length} missing`)
  if (stale.length) {
    console.log(`${stale.length} no longer referenced${PRUNE ? ' (pruning)' : ' (keep; --prune drops)'}`)
  }

  if (!missing.length) {
    console.log('nothing to translate')
    if (!PRUNE || !stale.length) return
  }

  if (DRY) {
    for (const text of missing.slice(0, 40)) console.log(`  + ${text}`)
    if (missing.length > 40) console.log(`  … and ${missing.length - 40} more`)
    console.log(`\ndry run — nothing sent (${missing.reduce((n, s) => n + s.split(/\s+/).length, 0)} words)`)
    return
  }

  const next = PRUNE
    ? Object.fromEntries(Object.entries(existing).filter(([key]) => sources.has(key)))
    : { ...existing }

  if (missing.length) {
    const translated = await translateAll(
      missing,
      { apiKey, from: 'nb', to: 'en' },
      (done, total) => process.stdout.write(`\rtranslating ${done}/${total}`),
    )
    process.stdout.write('\n')

    let unchanged = 0
    missing.forEach((source, i) => {
      next[source] = translated[i]
      if (translated[i] === source) unchanged += 1
    })
    if (unchanged) {
      console.log(`${unchanged} came back identical to the source (check the Weglot quota)`)
    }
  }

  // Sorted so the committed diff is reviewable.
  const sort = (entries) => Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)))

  const sorted = sort(Object.entries(next))
  writeFileSync(MESSAGES, `${JSON.stringify(sorted, null, 2)}\n`)
  console.log(`wrote ${Object.keys(sorted).length} entries to messages/en.json`)

  const codeKeys = new Set(code.map(normalize))
  const clientOnly = sort(Object.entries(sorted).filter(([key]) => codeKeys.has(key)))
  writeFileSync(CLIENT_MESSAGES, `${JSON.stringify(clientOnly, null, 2)}\n`)
  console.log(`wrote ${Object.keys(clientOnly).length} entries to messages/en.client.json`)
}

main().catch((error) => {
  console.error(`\n${error.message}`)
  process.exit(1)
})
