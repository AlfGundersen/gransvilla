import {
  HomeIcon,
  DocumentsIcon,
  CalendarIcon,
  CogIcon,
  DocumentTextIcon,
  ClipboardIcon,
} from '@sanity/icons'
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Innhold')
    .items([
      // ═══════════════════════════════════════
      // INNHOLD
      // ═══════════════════════════════════════

      S.listItem()
        .title('Forside')
        .id('frontpage')
        .icon(HomeIcon)
        .child(S.document().schemaType('frontpage').documentId('frontpage')),

      S.listItem()
        .title('Sider')
        .icon(DocumentsIcon)
        .schemaType('page')
        .child(S.documentTypeList('page').title('Sider')),

      S.listItem()
        .title('Arrangementer')
        .id('arrangementer')
        .icon(CalendarIcon)
        .child(
          S.list()
            .title('Arrangementer')
            .items([
              S.listItem()
                .title('Innstillinger')
                .id('arrangementerSettings')
                .icon(CogIcon)
                .child(S.document().schemaType('arrangementerSettings').documentId('arrangementerSettings')),
              S.listItem()
                .title('Arrangementsider')
                .icon(CalendarIcon)
                .schemaType('event')
                .child(S.documentTypeList('event').title('Arrangementsider')),
            ]),
        ),

      S.divider(),

      // ═══════════════════════════════════════
      // JURIDISK
      // ═══════════════════════════════════════

      S.listItem()
        .title('Personvernerklæring')
        .id('personvernerklaering')
        .icon(DocumentTextIcon)
        .child(S.document().schemaType('personvernerklaering').documentId('personvernerklaering')),

      S.listItem()
        .title('Salgsvilkår')
        .id('salgsvilkar')
        .icon(ClipboardIcon)
        .child(S.document().schemaType('salgsvilkar').documentId('salgsvilkar')),

      S.divider(),

      // ═══════════════════════════════════════
      // INNSTILLINGER
      // ═══════════════════════════════════════

      S.listItem()
        .title('Innstillinger')
        .id('siteSettings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
