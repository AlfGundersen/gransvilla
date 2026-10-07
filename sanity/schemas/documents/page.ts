import { SearchIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { AltTextInput } from '../../components/AltTextInput'
import { ShopifyProductInput } from '../../components/ShopifyProductInput'
import { watermarkFields } from '../objects/watermarkFields'

export default defineType({
  name: 'page',
  title: 'Side',
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
      description:
        'Valgfri kort tekst om siden. Vises ikke på selve sidevisningen ennå, men gjør innholdet redigerbart og forhindrer «ukjent felt»-varsel i Studio.',
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
        ...watermarkFields,
      ],
      group: 'content',
    }),
    defineField({
      name: 'knapp',
      title: 'Knapp',
      type: 'knapp',
      description:
        'Valgfri tekst og/eller knapp i den første tekstseksjonen. Teksten vises til venstre, knappen rett under brødteksten.',
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
      description:
        'Produkter fra nettbutikken som selges fra denne siden. Siden får da samme oppsett som butikken: teksten til venstre og produktene til høyre.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'productHandle',
              title: 'Velg produkt fra Shopify',
              type: 'string',
              components: { input: ShopifyProductInput },
            }),
            defineField({
              name: 'skjulIButikken',
              title: 'Skjul i butikken',
              type: 'boolean',
              description:
                'Produktet vises bare på denne siden og via direktelenke, ikke i butikkoversikten.',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              productHandle: 'productHandle',
              skjulIButikken: 'skjulIButikken',
            },
            prepare({ productHandle, skjulIButikken }) {
              return {
                title: productHandle || 'Velg et produkt',
                subtitle: skjulIButikken ? 'Skjult i butikken' : undefined,
              }
            },
          },
        },
      ],
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
      slug: 'slug.current',
    },
    prepare({ title, slug }) {
      return {
        title,
        subtitle: slug ? `/${slug}` : '',
      }
    },
  },
})
