import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Innhold')
    .items([
      // ── Forside ──
      S.listItem()
        .title('Forside')
        .id('frontpage')
        .child(S.document().schemaType('frontpage').documentId('frontpage')),

      S.divider(),

      // ── Sider ──
      S.listItem()
        .title('Sider')
        .schemaType('page')
        .child(S.documentTypeList('page').title('Sider')),

      S.listItem()
        .title('Arrangementsider')
        .schemaType('event')
        .child(S.documentTypeList('event').title('Arrangementsider')),

      S.divider(),

      // ── Butikk ──
      S.listItem()
        .title('Butikk-kategorier')
        .schemaType('shopCategory')
        .child(
          S.documentList()
            .title('Butikk-kategorier')
            .schemaType('shopCategory')
            .filter('_type == "shopCategory"')
            .initialValueTemplates([]),
        ),

      S.divider(),

      // ── Innstillinger ──
      S.listItem()
        .title('Innstillinger')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
