import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { defineLocations, presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { media, mediaAssetSource } from 'sanity-plugin-media'
import { unsplashAssetSource } from 'sanity-plugin-asset-source-unsplash'
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
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {
        locations: {
          frontpage: defineLocations({
            locations: [{ title: 'Forside', href: '/' }],
          }),
          event: defineLocations({
            select: { slug: 'slug.current' },
            resolve: (doc) => doc?.slug
              ? { locations: [{ title: doc.slug, href: `/${doc.slug}` }] }
              : null,
          }),
          page: defineLocations({
            select: { slug: 'slug.current' },
            resolve: (doc) => doc?.slug
              ? { locations: [{ title: doc.slug, href: `/${doc.slug}` }] }
              : null,
          }),
          siteSettings: defineLocations({
            locations: [{ title: 'Forside', href: '/' }],
          }),
        },
      },
    }),
    visionTool(),
    media(),
  ],

  schema: {
    types: schemaTypes,
  },

  form: {
    image: {
      assetSources: () => [mediaAssetSource, unsplashAssetSource],
    },
  },
})
