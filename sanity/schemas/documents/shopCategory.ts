import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'shopCategory',
  title: 'Butikk-kategori',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Kategorinavn',
      type: 'string',
      description: 'Må matche productType fra Shopify (f.eks. "Gavekort", "Matopplevelser")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      rows: 3,
      description: 'Kort beskrivelse som vises ved siden av produktene',
    }),
    defineField({
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Lavere tall vises først',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
    },
  },
  orderings: [
    {
      title: 'Rekkefølge',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
