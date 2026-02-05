import { defineField, defineType } from 'sanity'
import { SearchIcon } from '@sanity/icons'
import { AltTextInput } from '../../components/AltTextInput'
import { ShopifyProductInput } from '../../components/ShopifyProductInput'

export default defineType({
  name: 'event',
  title: 'Arrangementside',
  type: 'document',
  groups: [
    { name: 'content', title: 'Innhold', default: true },
    { name: 'seo', title: 'SEO', icon: SearchIcon },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Hovedtittelen som vises øverst på siden',
      validation: (Rule) => Rule.required().error('Tittel er påkrevd'),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/æ/g, 'ae')
            .replace(/ø/g, 'o')
            .replace(/å/g, 'a')
            .replace(/[^a-z0-9-]/g, '')
            .slice(0, 96),
      },
      description: 'Klikk "Generate" for å lage URL fra tittelen',
      validation: (Rule) => Rule.required().error('URL-slug er påkrevd'),
      group: 'content',
    }),
    defineField({
      name: 'description',
      title: 'Kort beskrivelse',
      type: 'simpleBlockContent',
      description: 'Kort sammendrag som vises på arrangementer-oversikten',
      group: 'content',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Fremhevet bilde',
      type: 'image',
      description: 'Stort bilde som vises ved siden av tittelen øverst på siden',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativ tekst',
          type: 'string',
          description: 'Viktig for tilgjengelighet og SEO',
          components: { input: AltTextInput },
        }),
      ],
      group: 'content',
    }),
    defineField({
      name: 'sections',
      title: 'Seksjoner',
      type: 'array',
      description: 'Bygg opp siden med ulike innholdsseksjoner',
      of: [
        { type: 'tekstSeksjon' },
        { type: 'bildeSeksjon' },
        { type: 'bildeTekstSeksjon' },
        { type: 'bildegalleriSeksjon' },
      ],
      group: 'content',
    }),
    defineField({
      name: 'products',
      title: 'Tilknyttede produkter',
      type: 'array',
      description: 'Produkter fra nettbutikken som er knyttet til dette arrangementet',
      of: [{
        type: 'object',
        fields: [
          defineField({
            name: 'productHandle',
            title: 'Velg produkt fra Shopify',
            type: 'string',
            components: { input: ShopifyProductInput },
          }),
        ],
        preview: {
          select: {
            productHandle: 'productHandle',
          },
          prepare({ productHandle }) {
            return {
              title: productHandle || 'Velg et produkt',
            }
          },
        },
      }],
      group: 'content',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      description: 'description',
    },
    prepare({ title, description }) {
      const text = Array.isArray(description)
        ? description.map((block: { children?: { text?: string }[] }) =>
            block.children?.map((c) => c.text).join('') ?? ''
          ).join(' ')
        : description || ''
      return {
        title,
        subtitle: text ? text.substring(0, 50) + (text.length > 50 ? '...' : '') : '',
      }
    },
  },
})
