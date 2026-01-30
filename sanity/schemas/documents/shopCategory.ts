import { defineField, defineType } from 'sanity'
import { ReadOnlyField } from '@/sanity/components/ReadOnlyField'

export default defineType({
  name: 'shopCategory',
  title: 'Butikk-kategori',
  type: 'document',
  fields: [
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'simpleBlockContent',
      description: 'Kort beskrivelse som vises ved siden av produktene',
    }),
    defineField({
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Lavere tall vises først',
      initialValue: 0,
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Synkronisert fra Shopify – ikke rediger manuelt',
      readOnly: true,
      components: { input: ReadOnlyField },
    }),
    defineField({
      name: 'shopifyCollectionId',
      title: 'Shopify Collection ID',
      type: 'string',
      description: 'Shopify GID – brukes for kobling',
      readOnly: true,
      components: { input: ReadOnlyField },
    }),
    defineField({
      name: 'shopifyHandle',
      title: 'Shopify Handle',
      type: 'string',
      description: 'Shopify URL-handle – synkronisert automatisk',
      readOnly: true,
      components: { input: ReadOnlyField },
    }),
  ],
  preview: {
    select: {
      title: 'title',
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
