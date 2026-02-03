import { defineConfig, type DocumentActionsResolver } from 'sanity'
import './sanity/studio.css'
import { structureTool } from 'sanity/structure'
import { defineLocations, presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { media, mediaAssetSource } from 'sanity-plugin-media'
import { unsplashAssetSource } from 'sanity-plugin-asset-source-unsplash'
import { dashboardTool } from '@sanity/dashboard'
import { plausibleWidget } from 'sanity-plugin-plausible-analytics'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'
import { SetOppdatertOnPublish } from './sanity/actions/setOppdatertOnPublish'

const resolveDocumentActions: DocumentActionsResolver = (prev, context) => {
  if (context.schemaType === 'personvernerklaering') {
    return prev.map((action) =>
      action.action === 'publish' ? SetOppdatertOnPublish : action,
    )
  }
  return prev
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

export default defineConfig({
  name: 'gransvilla',
  title: 'Gransvilla',

  projectId,
  dataset,

  basePath: '/studio',

  plugins: [
    structureTool({ name: 'struktur', title: 'Struktur', structure }),
    presentationTool({
      name: 'live-redigering',
      title: 'Live redigering',
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
    dashboardTool({
      name: 'statistikk',
      title: 'Statistikk',
      widgets: [
        plausibleWidget({
          url: 'https://plausible.io/share/gransvilla.no?auth=RQZIwBYFAumnMGbyMqNzb',
        }),
      ],
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: resolveDocumentActions,
  },

  form: {
    image: {
      assetSources: () => [mediaAssetSource, unsplashAssetSource],
    },
  },
})
