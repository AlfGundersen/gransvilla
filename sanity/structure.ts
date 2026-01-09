import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Innhold')
    .items([
      // Forside - singleton
      S.listItem()
        .title('Forside')
        .id('frontpage')
        .child(S.document().schemaType('frontpage').documentId('frontpage')),

      S.divider(),

      // Sider
      S.listItem()
        .title('Sider')
        .schemaType('page')
        .child(S.documentTypeList('page').title('Sider')),

      // Arrangementer
      S.listItem()
        .title('Arrangementer')
        .schemaType('event')
        .child(S.documentTypeList('event').title('Arrangementer')),

      S.divider(),

      // Navigasjon
      S.listItem()
        .title('Navigasjon')
        .schemaType('navigation')
        .child(S.documentTypeList('navigation').title('Navigasjon')),

      // Innstillinger - singleton
      S.listItem()
        .title('Innstillinger')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
