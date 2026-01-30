import { defineField, defineType } from 'sanity'
import { AltTextInput } from '../../components/AltTextInput'

export default defineType({
  name: 'event',
  title: 'Arrangementside',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Hovedtittelen som vises øverst på siden',
      validation: (Rule) => Rule.required().error('Tittel er påkrevd'),
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
    }),
    defineField({
      name: 'description',
      title: 'Kort beskrivelse',
      type: 'simpleBlockContent',
      description: 'Kort sammendrag som vises i lister',
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
    }),
  ],
  preview: {
    select: {
      title: 'title',
      description: 'description',
    },
    prepare({ title, description }) {
      return {
        title,
        subtitle: description ? description.substring(0, 50) + (description.length > 50 ? '...' : '') : '',
      }
    },
  },
})
