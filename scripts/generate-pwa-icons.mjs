import sharp from 'sharp'
import { readFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUTPUT_DIR = resolve(ROOT, 'public/icons')
const SIZES = [192, 512]

async function fetchFaviconFromSanity() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

  if (!projectId) return null

  try {
    const query = encodeURIComponent('*[_type == "siteSettings"][0]{ favicon { asset-> { url } } }')
    const res = await fetch(
      `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`
    )
    const data = await res.json()
    const url = data?.result?.favicon?.asset?.url

    if (!url) return null

    const imgRes = await fetch(url)
    return Buffer.from(await imgRes.arrayBuffer())
  } catch (e) {
    console.warn('Could not fetch favicon from Sanity:', e.message)
    return null
  }
}

async function getSourceImage() {
  const sanityImage = await fetchFaviconFromSanity()
  if (sanityImage) {
    console.log('Using favicon from Sanity CMS')
    return sanityImage
  }

  const logoPath = resolve(ROOT, 'public/logo.svg')
  if (existsSync(logoPath)) {
    console.log('Using public/logo.svg as fallback')
    return readFileSync(logoPath)
  }

  throw new Error('No source image found. Add public/logo.svg or configure favicon in Sanity.')
}

async function generateIcon(source, size, maskable = false) {
  const filename = maskable
    ? `icon-${size}x${size}-maskable.png`
    : `icon-${size}x${size}.png`

  let pipeline = sharp(source).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })

  if (maskable) {
    // Maskable icons need 20% safe-zone padding
    const innerSize = Math.round(size * 0.8)
    const padding = Math.round(size * 0.1)

    pipeline = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 245, g: 240, b: 227, alpha: 255 }, // #F5F0E3
      },
    })
      .composite([
        {
          input: await sharp(source)
            .resize(innerSize, innerSize, { fit: 'contain', background: { r: 245, g: 240, b: 227, alpha: 255 } })
            .toBuffer(),
          left: padding,
          top: padding,
        },
      ])
  }

  await pipeline.png().toFile(resolve(OUTPUT_DIR, filename))
  console.log(`Generated ${filename}`)
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const source = await getSourceImage()

  const tasks = SIZES.flatMap((size) => [
    generateIcon(source, size, false),
    generateIcon(source, size, true),
  ])

  await Promise.all(tasks)
  console.log('PWA icons generated successfully')
}

main().catch((err) => {
  console.error('Failed to generate PWA icons:', err)
  process.exit(1)
})
