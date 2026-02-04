import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  groups: [
    { name: 'basic', title: 'Grunnleggende', default: true },
    { name: 'social', title: 'Sosiale medier' },
    { name: 'schema', title: 'Strukturerte data' },
    { name: 'advanced', title: 'Avansert' },
  ],
  fields: [
    // Basic SEO
    defineField({
      name: 'metaTitle',
      title: 'Meta-tittel',
      type: 'string',
      group: 'basic',
      description: 'Overstyr sidetittelen for søkemotorer (maks 60 tegn)',
      validation: (Rule) => Rule.max(60).warning('Bør være under 60 tegn'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta-beskrivelse',
      type: 'text',
      rows: 3,
      group: 'basic',
      description: 'Beskrivelse som vises i søkeresultater (maks 160 tegn)',
      validation: (Rule) => Rule.max(160).warning('Bør være under 160 tegn'),
    }),
    defineField({
      name: 'keywords',
      title: 'Nøkkelord',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      group: 'basic',
      description: 'Relevante nøkkelord for innholdet',
    }),

    // Social Media / Open Graph
    defineField({
      name: 'ogImage',
      title: 'Delingsbilde',
      type: 'image',
      group: 'social',
      description: 'Bilde som vises når siden deles på sosiale medier (1200x630px anbefalt)',
    }),
    defineField({
      name: 'ogTitle',
      title: 'Delingsoverskrift',
      type: 'string',
      group: 'social',
      description: 'Overstyr tittelen for sosiale medier (valgfritt)',
    }),
    defineField({
      name: 'ogDescription',
      title: 'Delingsbeskrivelse',
      type: 'text',
      rows: 2,
      group: 'social',
      description: 'Overstyr beskrivelsen for sosiale medier (valgfritt)',
    }),

    // Schema.org Structured Data
    defineField({
      name: 'schemaType',
      title: 'Schema-type',
      type: 'string',
      group: 'schema',
      options: {
        list: [
          { title: 'Automatisk (anbefalt)', value: 'auto' },
          { title: 'Artikkel', value: 'Article' },
          { title: 'Nyhetsartikkel', value: 'NewsArticle' },
          { title: 'Blogginnlegg', value: 'BlogPosting' },
          { title: 'FAQ-side', value: 'FAQPage' },
          { title: 'Arrangement', value: 'Event' },
          { title: 'Tjeneste', value: 'Service' },
          { title: 'Om oss', value: 'AboutPage' },
          { title: 'Kontaktside', value: 'ContactPage' },
          { title: 'Nettside (generell)', value: 'WebPage' },
          { title: 'Ingen (deaktiver)', value: 'none' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'auto',
      description: 'Automatisk bruker dokumenttype. Tittel, beskrivelse og bilde hentes automatisk fra siden.',
    }),

    // Article-specific fields (shown for Article types or can be used to override auto)
    defineField({
      name: 'articleAuthor',
      title: 'Forfatter',
      type: 'string',
      group: 'schema',
      hidden: ({ parent }) =>
        !['Article', 'NewsArticle', 'BlogPosting'].includes(parent?.schemaType || ''),
      description: 'Overstyr forfatter (automatisk: Grans Villa)',
    }),

    // FAQ fields
    defineField({
      name: 'faqItems',
      title: 'FAQ-elementer',
      type: 'array',
      group: 'schema',
      hidden: ({ parent }) => parent?.schemaType !== 'FAQPage',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Spørsmål',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Svar',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'question', subtitle: 'answer' },
          },
        },
      ],
      description: 'Spørsmål og svar som vises i søkeresultater',
    }),

    // Event-specific fields (for manual override - auto uses event document dates)
    defineField({
      name: 'eventLocation',
      title: 'Sted (overstyr)',
      type: 'string',
      group: 'schema',
      hidden: ({ parent }) => parent?.schemaType !== 'Event',
      description: 'Overstyr sted (automatisk: Grans Villa)',
    }),
    defineField({
      name: 'eventPrice',
      title: 'Pris',
      type: 'number',
      group: 'schema',
      hidden: ({ parent }) => parent?.schemaType !== 'Event',
      description: 'Pris i NOK (0 for gratis)',
    }),

    // Service-specific fields
    defineField({
      name: 'serviceType',
      title: 'Tjenestetype',
      type: 'string',
      group: 'schema',
      hidden: ({ parent }) => parent?.schemaType !== 'Service',
      description: 'F.eks. "Catering", "Restaurant", "Arrangement"',
    }),
    defineField({
      name: 'serviceArea',
      title: 'Tjenesteområde',
      type: 'string',
      group: 'schema',
      hidden: ({ parent }) => parent?.schemaType !== 'Service',
      description: 'Geografisk område tjenesten dekker',
    }),

    // Advanced
    defineField({
      name: 'noIndex',
      title: 'Skjul fra søkemotorer',
      type: 'boolean',
      group: 'advanced',
      initialValue: false,
      description: 'Aktiver for å hindre at siden indekseres av Google og andre søkemotorer',
    }),
    defineField({
      name: 'noFollow',
      title: 'Ikke følg lenker',
      type: 'boolean',
      group: 'advanced',
      initialValue: false,
      description: 'Fortell søkemotorer å ikke følge lenker på denne siden',
    }),
  ],
})
