import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta-tittel',
      type: 'string',
      description: 'Overstyr sidetittelen for søkemotorer',
      validation: (Rule) => Rule.max(60).warning('Bør være under 60 tegn'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta-beskrivelse',
      type: 'text',
      rows: 3,
      description: 'Beskrivelse som vises i søkeresultater',
      validation: (Rule) => Rule.max(160).warning('Bør være under 160 tegn'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Delingsbilde',
      type: 'image',
      description: 'Bilde som vises når siden deles på sosiale medier (1200x630px anbefalt)',
    }),
    defineField({
      name: 'noIndex',
      title: 'Skjul fra søkemotorer',
      type: 'boolean',
      initialValue: false,
      description: 'Aktiver for å hindre at siden indekseres av Google og andre søkemotorer',
    }),
  ],
})
