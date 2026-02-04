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

      // ── Sider ──
      S.listItem()
        .title('Sider')
        .schemaType('page')
        .child(S.documentTypeList('page').title('Sider')),

      S.divider(),

      // ── Arrangementer ──
      S.listItem()
        .title('Arrangementer')
        .id('arrangementer')
        .child(
          S.list()
            .title('Arrangementer')
            .items([
              S.listItem()
                .title('Innstillinger')
                .id('arrangementerSettings')
                .child(S.document().schemaType('arrangementerSettings').documentId('arrangementerSettings')),
              S.listItem()
                .title('Arrangementsider')
                .schemaType('event')
                .child(S.documentTypeList('event').title('Arrangementsider')),
            ]),
        ),

      // ── Butikken ──
      S.listItem()
        .title('Butikken')
        .id('nettbutikk')
        .child(
          S.list()
            .title('Butikken')
            .items([
              S.listItem()
                .title('Innstillinger')
                .id('nettbutikkSettings')
                .child(S.document().schemaType('nettbutikkSettings').documentId('nettbutikkSettings')),
              S.listItem()
                .title('Kategorier')
                .schemaType('shopCategory')
                .child(
                  S.documentList()
                    .title('Kategorier')
                    .schemaType('shopCategory')
                    .filter('_type == "shopCategory"')
                    .initialValueTemplates([]),
                ),
            ]),
        ),

      S.divider(),

      // ── Personvern ──
      S.listItem()
        .title('Personvernerklæring')
        .id('personvernerklaering')
        .child(S.document().schemaType('personvernerklaering').documentId('personvernerklaering')),

      // ── Innstillinger ──
      S.listItem()
        .title('Innstillinger')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
