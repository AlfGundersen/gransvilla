import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

export default defineConfig({
  name: 'gransvilla',
  title: 'Gransvilla',

  projectId,
  dataset,

  basePath: '/studio',

  plugins: [
    structureTool({ structure }),
    visionTool(),
    unsplashImageAsset(),
  ],

  schema: {
    types: schemaTypes,
  },
})
